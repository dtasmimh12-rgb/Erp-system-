import React, { useState } from "react";
import { FileText, UploadCloud, Cpu, AlertCircle, CheckCircle, RefreshCcw, Landmark, Plus, FileSpreadsheet, Sparkles } from "lucide-react";

interface AIDocumentReaderProps {
  lang: "EN" | "BN";
  onAddParsedEmployee: (emp: any) => void;
  onAddParsedOrder: (ord: any) => void;
}

export default function AIDocumentReader({ lang, onAddParsedEmployee, onAddParsedOrder }: AIDocumentReaderProps) {
  const [docType, setDocType] = useState<"CV" | "Purchase Order" | "Invoice">("CV");
  const [docText, setDocText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState("");

  // Sample templates to let the user immediately test the OCR extraction
  const cvTemplate = `Name: Md. Abu Sayeed Al-Hasan
Phone: +880 1745-983421
Email: abu.sayeed12@garmtech.com.bd
Education: Diploma in Textile Engineering, BGMEA University of Fashion & Technology (BUFT)
Experience: 4.5 Years as Stoll Computerized Jacquard Knitting machine operator & programmer at Gazipur Knitwear. Skilled in Stoll M1 Plus design drafting.
Expected Salary: 26500 BDT
Key skills: Stoll M1 Plus pattern drafting, Jacquard knitting, stitch troubleshooting, needle mending.`;

  const poTemplate = `Style PO: H&M-SWT-9022A
Ordered By: H&M Global Procurement Group (Sweden)
Order Number: PO-88374921
Product Specification: Hooded Sweater Panels (12GG)
Quantity Ordered: 15,000 sets
Delivery Target Date: 2026-08-10
Gauge requirement: 12GG
Color/Shade: Navy Heather Melange`;

  const invoiceTemplate = `INV: Spinning-2026-441A
Vendor: Narayanganj Cotton Spinning Mills Ltd
Date: 2026-05-18
Item Description: Acrylic/Cotton Mixed Dyed Yarn Cones
Total Value: 680,000 BDT
Quantity Delivered: 1,800 Kg`;

  function handleSelectTemplate() {
    if (docType === "CV") setDocText(cvTemplate);
    else if (docType === "Purchase Order") setDocText(poTemplate);
    else setDocText(invoiceTemplate);
    setResult(null);
    setStatusMsg("");
  }

  async function handleAnalyze() {
    if (!docText.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setStatusMsg("");

    try {
      const response = await fetch("/api/gemini/doc-reader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docText, docType })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to parse document");
      }

      setResult(data.parsedData);
      setStatusMsg(lang === "EN" ? "✅ OCR Structured Extraction Complete!" : "✅ ডকুমেন্টের তথ্য নিষ্কাশন সম্পন্ন হয়েছে!");
    } catch (err: any) {
      console.error(err);
      setStatusMsg(`⚠️ Error: ${err.message || "Failed to reach Gemini parsing route."}`);
    } finally {
      setLoading(false);
    }
  }

  function handleAutoFill() {
    if (!result) return;

    if (docType === "CV") {
      const mappedEmp = {
        name: result.name || "Abu Sayeed",
        banglaName: "আবু সাঈদ আল-হাসান",
        phone: result.phone || "01745983421",
        email: result.email || "abu.sayeed12@garmtech.com",
        nid: "199438274950182",
        department: "Production",
        section: "Jacquard knitting",
        line: "Line-A2",
        designation: "Stoll Programmer",
        grade: "Grade B",
        employeeType: "Worker" as const,
        salaryType: "Monthly" as const,
        gender: "Male" as const,
        biometricId: "BIO-NEW-88",
        joiningDate: "2026-06-01",
        status: "Active" as const,
        basicSalary: result.expectedSalary || 26000,
        houseRent: 8000,
        medicalAllowance: 2000,
        conveyance: 1500,
        foodAllowance: 2500
      };
      onAddParsedEmployee(mappedEmp);
      setStatusMsg(lang === "EN" ? "Saved Md. Abu Sayeed Al-Hasan successfully into active employee list!" : "কর্মচারী তালিকায় সফলভাবে সংরক্ষণ করা হয়েছে!");
    } else {
      const mappedOrd = {
        orderNo: result.orderNo || "PO-88374921",
        styleNo: result.styleNo || "H&M-SWT-9022A",
        buyerName: result.buyerName || "H&M Global",
        productType: result.productType || "Hooded Sweater Panels",
        gauge: (result.gauge || "12GG") as any,
        yarnCount: "2/32 Cotton Mixed",
        colorCode: "Navy Heather Melange",
        sizeRange: "S-XXL",
        orderQty: result.orderQty || 15000,
        deliveryDate: result.deliveryDate || "2026-08-10",
        status: "Sampling" as const,
        profitabilityRatio: 22
      };
      onAddParsedOrder(mappedOrd);
      setStatusMsg(lang === "EN" ? `Created style ${mappedOrd.styleNo} successfully under Buyer Orders!` : "ক্রেতার অর্ডারে স্টাইল সফলভাবে যুক্ত করা হয়েছে!");
    }
    setResult(null);
  }

  return (
    <div className="space-y-6 animate-fade-in py-1 pr-2">
      
      {/* Title */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight">
          {lang === "EN" ? "Cognitive AI Document Reader" : "কৃত্রিম বুদ্ধিমত্তা ডকুমেন্ট রিডার"}
        </h2>
        <p className="font-sans text-xs text-slate-500 mt-1">
          {lang === "EN" ? "Instantly extract database-ready JSON records from candidate CVs or buyer Purchase Orders using server-side Gemini 3.5 OCR." : "সার্ভার-সাইড জেমিনি ৩.৫ ওসিআর দিয়ে সিভি এবং পিও ফাইল থেকে তথ্য স্বয়ংক্রিয়ভাবে এক্সট্র্যাক্ট করুন।"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Document paste and select side */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider">
              {lang === "EN" ? "Input Document Source" : "ডকুমেন্ট ইনপুট"}
            </h4>
            <div className="flex space-x-1.5 p-1 bg-slate-100 rounded-lg">
              <button 
                onClick={() => { setDocType("CV"); setResult(null); }}
                className={`px-3 py-1 text-[10.5px] font-semibold rounded-md transition ${docType === "CV" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
              >
                CV/Resume
              </button>
              <button 
                onClick={() => { setDocType("Purchase Order"); setResult(null); }}
                className={`px-3 py-1 text-[10.5px] font-semibold rounded-md transition ${docType === "Purchase Order" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
              >
                Buyer PO
              </button>
              <button 
                onClick={() => { setDocType("Invoice"); setResult(null); }}
                className={`px-3 py-1 text-[10.5px] font-semibold rounded-md transition ${docType === "Invoice" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
              >
                Invoice
              </button>
            </div>
          </div>

          {/* Quick Sandbox Tester Template Banner */}
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/60 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Sparkles size={14} className="text-amber-500 flex-shrink-0" />
              <p className="text-[11px] text-amber-700 font-medium">
                {lang === "EN" ? `Load standard dummy garments ${docType} snapshot?` : `পরীক্ষার জন্য ডেমো ${docType} ডেটা লোড করবেন?`}
              </p>
            </div>
            <button
              onClick={handleSelectTemplate}
              className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10.5px] font-bold rounded-lg transition-colors"
            >
              {lang === "EN" ? "Load Template" : "লোড করুন"}
            </button>
          </div>

          <div className="space-y-2">
            <label className="font-sans text-[11px] text-slate-500 font-medium h-4 block">
              {lang === "EN" ? "Paste text, specs or scan OCR content:" : "ডকুমেন্টের ভেতরের টেক্সট পেস্ট করুন:"}
            </label>
            <textarea
              className="w-full h-64 bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11.5px] text-slate-700 font-mono focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              placeholder={lang === "EN" ? "Pasting raw document contents here..." : "এখানে ডকুমেন্টের টেক্সট লিখুন..."}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400 font-mono">Size: {docText.length} character bytes</span>
            <button
              onClick={handleAnalyze}
              disabled={loading || !docText.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/10"
            >
              {loading ? (
                <>
                  <RefreshCcw size={13} className="animate-spin" />
                  <span>{lang === "EN" ? "AI Cognitive Parsing..." : "এআই বিশ্লেষণ চলছে..."}</span>
                </>
              ) : (
                <>
                  <Cpu size={13} />
                  <span>{lang === "EN" ? "Run AI Extraction" : "এআই দিয়ে এক্সট্র্যাক্ট করুন"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Structured Results Display */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider mb-4">
              {lang === "EN" ? "Structured JSON Results" : "এক্সট্র্যাক্ট করা ডাটা"}
            </h4>

            {statusMsg && (
              <div className={`p-3 rounded-xl mb-4.5 flex items-start space-x-2.5 text-[11px] leading-relaxed font-sans ${
                statusMsg.includes("⚠️") ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-emerald-50 text-emerald-800 border border-emerald-100"
              }`}>
                {statusMsg.includes("⚠️") ? <AlertCircle size={14} className="mt-0.5" /> : <CheckCircle size={14} className="mt-0.5" />}
                <span>{statusMsg}</span>
              </div>
            )}

            {result ? (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-200/80 font-mono text-[11px] text-slate-700 space-y-3">
                  {docType === "CV" ? (
                    <>
                      <p><strong className="text-slate-400">Name:</strong> {result.name}</p>
                      <p><strong className="text-slate-400">Phone:</strong> {result.phone}</p>
                      <p><strong className="text-slate-400">Email:</strong> {result.email}</p>
                      <p><strong className="text-slate-400">Education:</strong> {result.education}</p>
                      <p><strong className="text-slate-400">Garment Exp:</strong> {result.experience}</p>
                      <p><strong className="text-slate-400">Expected Salary:</strong> ৳{result.expectedSalary?.toLocaleString()}</p>
                      <p>
                        <strong className="text-slate-400">Skill Tags:</strong> 
                        <span className="flex flex-wrap gap-1 mt-1.5">
                          {result.skillTags?.map((s: string, idx: number) => (
                            <span key={idx} className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-100">
                              {s}
                            </span>
                          ))}
                        </span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p><strong className="text-slate-400">PO Number:</strong> {result.orderNo}</p>
                      <p><strong className="text-slate-400">Style No:</strong> {result.styleNo}</p>
                      <p><strong className="text-slate-400">Buyer Brand:</strong> {result.buyerName}</p>
                      <p><strong className="text-slate-400">Product:</strong> {result.productType}</p>
                      <p><strong className="text-slate-400">Required GG:</strong> {result.gauge}</p>
                      <p><strong className="text-slate-400">Order Quantity:</strong> {result.orderQty?.toLocaleString()} Pcs</p>
                      <p><strong className="text-slate-400">Delivery Target:</strong> {result.deliveryDate}</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-400 animate-fade-in">
                <UploadCloud size={40} className="text-slate-300 stroke-1 mb-2.5 animate-bounce" />
                <p className="font-sans font-semibold text-xs text-slate-600">
                  {lang === "EN" ? "Awaiting OCR analyzing process" : "ডকুমেন্ট বিশ্লেষণের অপেক্ষায়"}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal max-w-sm">
                  {lang === "EN" ? "Choose or paste content on the left, then select 'Run AI Extraction' to view parsed objects." : "বাম দিকে ডকুমেন্টের টেক্সট দিয়ে 'এআই দিয়ে এক্সট্র্যাক্ট করুন' এ ক্লিক করুন।"}
                </p>
              </div>
            )}
          </div>

          {result && (
            <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end">
              <button
                onClick={handleAutoFill}
                className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/10"
              >
                <Plus size={13} />
                <span>
                  {docType === "CV" 
                    ? (lang === "EN" ? "Auto-Fill Employee Profile" : "প্রোফাইল অটো-ফিল করুন") 
                    : (lang === "EN" ? "Auto-Fill into Buyer Orders" : "অর্ডারে অটো-ফিল করুন")
                  }
                </span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
