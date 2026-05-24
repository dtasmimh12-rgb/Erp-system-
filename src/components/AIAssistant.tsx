import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Trash2, ArrowRightCircle, AlertCircle, Loader2 } from "lucide-react";

interface Message {
  sender: "user" | "ai";
  text: string;
}

interface AIAssistantProps {
  lang: "EN" | "BN";
}

export default function AIAssistant({ lang }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: lang === "EN" 
        ? "Hello! I am your OTTOMASS JACQUARD Smart Business Advisor. Ask me anything about employee headcounts, live attendance status, knit outputs, yarn stocks, financial accounts balance, or draft professional HR documents instantly." 
        : "স্বাগতম! আমি আপনার অটোমাস জ্যাকার্ড স্মার্ট বিজনেস এডভাইজার। কর্মচারী সংখ্যা, উপস্থিতি, উৎপাদন, সুতার স্টক বা আর্থিক খাতের যেকোনো প্রশ্ন আমাকে করতে পারেন।"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Prompt templates from user list
  const docSnippets = [
    { text: lang === "EN" ? "Today how many workers are absent?" : "আজ কতজন কর্মচারী অনুপস্থিত?", prompt: "According to the active ERP logs, how many employees are absent today? Break down their names and sections if possible." },
    { text: lang === "EN" ? "Which line has highest OT?" : "কোন লাইনে সবচেয়ে বেশি ওভারটাইম?", prompt: "Which line or employee department currently has the highest overtime (OT)? Analyze based on today's logs." },
    { text: lang === "EN" ? "Which yarn stock is low?" : "কোন সুতা স্টক কমে গেছে?", prompt: "Check store list. Which yarn category is low in stock or below the reorder target level?" },
    { text: lang === "EN" ? "Which order is delayed?" : "কোন অর্ডারে বিলম্ব হচ্ছে?", prompt: "Observe the active buyer garments order delivery dates and progress. Are there delayed orders or close deadlines?" },
    { text: lang === "EN" ? "Predict production delay." : "উৎপাদন বিলম্বের পূর্বাভাস দিন।", prompt: "Look at the active machines downtime minutes and yesterday's knitting output target achievements. Predict potential production blockages." },
    { text: lang === "EN" ? "Explain profit/loss simply" : "লাভ/ক্ষতি সহজ ভাষায় বোঝান", prompt: "Review our double-entry ledger chart of accounts balances. Explain our revenue, material costs, and net status in straightforward language." },
    { text: lang === "EN" ? "Write buyer invoice email." : "ক্রেতার পেমেন্ট ইমেইল লিখুন", prompt: "Draft a polite and business-professional client email to H&M Global requesting pay collection of accounts receivable (৳3,500,000) for completed styles." },
    { text: lang === "EN" ? "Generate Appointment Letter" : "নিয়োগপত্র তৈরি করুন", prompt: "Generate a formal garments standard employment Appointment Letter template for a Junior Jacquard operator joining OTTOMASS." }
  ];

  async function handleSend(customText?: string) {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    if (!customText) setInput("");

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSend })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to communicate with AI");
      }

      setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev, 
        { 
          sender: "ai", 
          text: `⚠️ **Error**: ${err.message || "Failed to reach Google Gemini. Please check your network or confirm GEMINI_API_KEY lies in your environment variables."}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setMessages([
      {
        sender: "ai",
        text: lang === "EN" 
          ? "Workspace cleared. Ask me any garments or production ERP query!" 
          : "চ্যাট রিসেট করা হয়েছে। নতুন প্রশ্ন জিজ্ঞেস করুন!"
      }
    ]);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in pr-2 h-[calc(100vh-140px)]">
      
      {/* Sidebar Suggestions */}
      <div className="lg:col-span-1 bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center space-x-2 mb-4.5">
            <Sparkles size={16} className="text-indigo-600 animate-pulse" />
            <h3 className="font-display font-bold text-xs tracking-wider uppercase text-slate-700">
              {lang === "EN" ? "Quick AI Consults" : "দ্রুত পরামর্শ"}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
            {lang === "EN" 
              ? "Select any query below to run a direct analysis against the live database snapshot." 
              : "নিচের যেকোনো অপশন সিলেক্ট করে সরাসরি লাইভ ডাটাবেস বিশ্লেষণ করুন।"}
          </p>

          <div className="space-y-2">
            {docSnippets.map((sn, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sn.prompt)}
                disabled={loading}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200/60 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-[11px] font-medium text-slate-600 hover:text-indigo-700 transition"
              >
                {sn.text}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 text-[10px] text-slate-400 font-mono">
          <p>Model: Gemini 3.5 Flash</p>
          <p className="mt-1">Scope: OTTOMASS Approved Data</p>
        </div>
      </div>

      {/* Main chat window */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xs h-full">
        
        {/* Chat box Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold leading-none shadow-md shadow-indigo-600/10">
              OM
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-slate-800 tracking-wide uppercase">
                {lang === "EN" ? "Gemini business expert console" : "জেমিনি বিজনেস এক্সপার্ট কনসোল"}
              </h4>
              <p className="font-mono text-[9px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">
                {lang === "EN" ? "Zero-hallucinatory factory advisor" : "নির্ভুল ফ্যাক্টরি এডভাইজার"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors"
            title={lang === "EN" ? "Clear conversation history" : "ইতিহাস মুছুন"}
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Message bubble stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/20">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex items-start space-x-3.5 max-w-[85%] ${m.sender === "user" ? "ml-auto flex-row-reverse space-x-reverse" : ""}`}
            >
              <div className={`p-2 rounded-xl flex-shrink-0 ${
                m.sender === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"
              }`}>
                {m.sender === "user" ? <User size={14} /> : <Bot size={14} className="text-slate-600" />}
              </div>
              
              <div className={`p-4 rounded-2xl text-[11.5px] leading-relaxed shadow-xs whitespace-pre-wrap ${
                m.sender === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-slate-200/80 rounded-tl-none text-slate-700"
              }`}>
                {/* Check for standard markdown tables & lists formatting gracefully */}
                <span className="font-sans font-medium">{m.text}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3.5 max-w-[80%] pr-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
                <Bot size={14} />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-xs flex items-center space-x-3">
                <Loader2 size={14} className="text-indigo-600 animate-spin" />
                <span className="text-xs text-slate-400 font-mono italic">
                  {lang === "EN" ? "Analyzing active ERP structures..." : "সক্রিয় ইআরপি ফাইল বিশ্লেষণ করা হচ্ছে..."}
                </span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Chat input footer */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-slate-100 bg-white flex items-center space-x-3 no-print"
        >
          <input
            type="text"
            className="flex-1 border border-slate-200 rounded-full px-4.5 py-2.5 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-600 focus:bg-slate-50 placeholder:text-slate-400 transition"
            placeholder={lang === "EN" ? "Ask a factory question (e.g., Which orders have high margins?)" : "ফ্যাক্টরি সংক্রান্ত প্রশ্ন লিখুন..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </form>

      </div>
    </div>
  );
}
