import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Pre-seeded database state to inject directly into Gemini AI context
import { 
  initialCompanySettings, 
  initialEmployees, 
  initialAttendanceRecords, 
  initialLeaveApplications, 
  initialBuyerOrders, 
  initialKnittingRecords, 
  initialInventoryItems, 
  initialMachines, 
  initialChartOfAccounts, 
  initialJournalVouchers, 
  initialPayrollRecords 
} from "./src/mockData.js";

const app = express();
const PORT = 3000;

// Security configuration & middleware
app.use(express.json({ limit: "50mb" }));

// Initialize Google Gemini Client (Server-side ONLY)
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("Warning: GEMINI_API_KEY environment variable is not defined.");
}

// Helper to compile ERP dataset into consolidated text context for active Q&A
function getERPDatabaseContext() {
  return JSON.stringify({
    companySettings: initialCompanySettings,
    employees: initialEmployees,
    attendanceToday: initialAttendanceRecords,
    leaves: initialLeaveApplications,
    orders: initialBuyerOrders,
    knittingRecords: initialKnittingRecords,
    inventory: initialInventoryItems,
    machines: initialMachines,
    ledgerChartOfAccounts: initialChartOfAccounts,
    journalVouchers: initialJournalVouchers,
    payrolls: initialPayrollRecords
  }, null, 2);
}

// API Routes FIRST

// 1. Health Status check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    time: new Date().toISOString(),
    geminiInitialized: !!ai 
  });
});

// 2. AI Business Assistant Route
app.post("/api/gemini/assistant", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!ai) {
      return res.status(503).json({ 
        error: "Gemini client is not configured on the server. Please define GEMINI_API_KEY in the Secrets panel." 
      });
    }

    const systemInstruction = `You are the world-class OTTOMASS JACQUARD ERP Smart Assistant, an advanced operational advisor for our jacquard knitting and sweater parts manufacturing factory based in Gazipur, Bangladesh.

You answer questions strictly and exclusively using the approved ERP live database snapshot provided below. If the answer cannot be confidently derived from this snapshot, state that clearly—do not hallucinate or make up false information.

Translate your replies dynamically to English or Bangla based on the user's input/language preference. When listing tables or reports, render them using beautiful, neat Markdown formatting.

Approved ERP Database Live Snapshot:
${getERPDatabaseContext()}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2 // Lower temperature for high fact-precision
      }
    });

    const reply = response.text || "No response received from AI model.";
    res.json({ reply });

  } catch (err: any) {
    console.error("AI Assistant API Error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// 3. AI Document Reader Route (Extract structured JSON from CV/Invoice/PO uploads)
app.post("/api/gemini/doc-reader", async (req, res) => {
  try {
    const { docText, docType } = req.body;
    if (!docText) {
      return res.status(400).json({ error: "Document text contents are required for processing" });
    }

    if (!ai) {
      return res.status(503).json({ 
        error: "Gemini client is not configured. Please define GEMINI_API_KEY in the Secrets panel." 
      });
    }

    let pSchema: any = {};
    let promptText = "";

    if (docType === "CV") {
      pSchema = {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Full Name of Candidate" },
          phone: { type: Type.STRING, description: "Contact Number" },
          email: { type: Type.STRING, description: "Email Address" },
          education: { type: Type.STRING, description: "Highest Educational Degree" },
          experience: { type: Type.STRING, description: "Key garments/knitting experience summary" },
          expectedSalary: { type: Type.NUMBER, description: "Expected monthly salary in BDT" },
          skillTags: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: "List of skills (e.g. Stoll, linking, programming, quality control)"
          }
        },
        required: ["name"]
      };
      promptText = `Parse this Candidate CV/Resume and extract key demographics. Return fully structured JSON data. Document contents: ${docText}`;
    } else if (docType === "Purchase Order") {
      pSchema = {
        type: Type.OBJECT,
        properties: {
          orderNo: { type: Type.STRING, description: "PO or Order Number" },
          styleNo: { type: Type.STRING, description: "Design style reference number" },
          buyerName: { type: Type.STRING, description: "Name of buying brand e.g. H&M, Zara, Walmart" },
          productType: { type: Type.STRING, description: "Sweater parts or sweater styles" },
          orderQty: { type: Type.NUMBER, description: "Ordered item count/pieces" },
          deliveryDate: { type: Type.STRING, description: "Delivery date in YYYY-MM-DD" },
          gauge: { type: Type.STRING, description: "Knitting machine gauge requirement e.g. 12GG, 3GG" }
        },
        required: ["orderNo", "buyerName", "orderQty"]
      };
      promptText = `Extract relevant garments purchase order detail records. Return full JSON. Document contents: ${docText}`;
    } else {
      // General invoices / documents
      pSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Title or invoice subject" },
          merchantName: { type: Type.STRING, description: "Seller, spinner, or company name" },
          amount: { type: Type.NUMBER, description: "Total BDT value" },
          date: { type: Type.STRING, description: "Document date" },
          summary: { type: Type.STRING, description: "Brief content explanation" }
        }
      };
      promptText = `Process this supply expense document or invoices text and structure it into a clean JSON output. Contents: ${docText}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: pSchema,
        temperature: 0.1
      }
    });

    res.json({ parsedData: JSON.parse(response.text || "{}") });

  } catch (err: any) {
    console.error("AI Document Reader API Error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// Vite Middleware for asset serving + path fallback (mounted after API routes)
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION static files serving mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`OTTOMASS JACQUARD ERP operational at http://localhost:${PORT}`);
  });
}

setupVite();
