import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Search,
  Microscope,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  CheckCircle2,
  FlaskConical,
  Thermometer,
  Droplets,
  Ruler,
} from "lucide-react";
import { askExpert, decodeModelNumber, PRODUCT_KB, PRODUCT_ORDER } from "../data/productExpertKB";

interface ChatMessage {
  id: number;
  type: "user" | "bot";
  text: string;
  confidence?: "high" | "medium" | "low";
  source?: string;
  relatedProducts?: string[];
  isModelDecode?: boolean;
  decodedFields?: Array<{ code: string; label: string; meaning: string }>;
  decodedProduct?: string;
  decodedUnknown?: string[];
}

const QUICK_QUESTIONS = [
  { icon: <Microscope className="w-3.5 h-3.5" />, text: "Decode FMIPL-SMMLI-F-S2-F1-FC1-FS1-AS-DS-JNA-CD-SD1-SU1-NA-NA-25NB-900MM" },
  { icon: <Zap className="w-3.5 h-3.5" />, text: "Which flowmeter for sewage with slurry?" },
  { icon: <Thermometer className="w-3.5 h-3.5" />, text: "Which meter for saturated steam at 10 bar?" },
  { icon: <Droplets className="w-3.5 h-3.5" />, text: "Tell me about EMF specifications" },
  { icon: <Ruler className="w-3.5 h-3.5" />, text: "Compare EMF vs Vortex vs Turbine" },
  { icon: <FlaskConical className="w-3.5 h-3.5" />, text: "What is the minimum conductivity for EMF?" },
];

export default function ProductExpertPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      type: "bot",
      text: `**Welcome to Flowtech Product Expert AI** 👋\n\nI'm your technical assistant with complete knowledge of all Flowtech products. I can help you with:\n\n🔧 **De-code Model Numbers** — Paste any FMIPL-xxx code\n📋 **Product Specifications** — EMF, Turbine, Vortex, Level Indicators\n🎯 **Application Guidance** — "Which meter for my process?"\n⚖️ **Compare Products** — Side-by-side technical comparison\n📐 **Sizing Parameters** — What data is needed for sizing\n\n*Try one of the quick questions below or type your own!*`,
      confidence: "high",
      source: "Flowtech Product Knowledge Base",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function processBotResponse(userText: string): ChatMessage {
    // Check if it's a model code
    const modelMatch = userText.match(/FMIPL-[A-Z0-9\-]+/i);
    if (modelMatch) {
      const decoded = decodeModelNumber(modelMatch[0]);
      if (decoded) {
        return {
          id: Date.now(),
          type: "bot",
          text: `**Model Code Decoded**\n\n**Product:** ${decoded.product}\n\n${decoded.fields.map(f => `- **${f.label}:** \`${f.code}\` → ${f.meaning}`).join("\n")}${decoded.unknown.length > 0 ? "\n\n⚠️ *Unrecognized segments:* " + decoded.unknown.join(", ") : ""}`,
          confidence: "high",
          source: "Flowtech Model Code Database",
          isModelDecode: true,
          decodedProduct: decoded.product,
          decodedFields: decoded.fields,
          decodedUnknown: decoded.unknown,
        };
      }
    }

    // Use expert engine
    const answer = askExpert(userText);
    return {
      id: Date.now(),
      type: "bot",
      text: answer.answer,
      confidence: answer.confidence,
      source: answer.source,
      relatedProducts: answer.relatedProducts,
    };
  }

  function handleSend(text?: string) {
    const q = text || input.trim();
    if (!q) return;

    const userMsg: ChatMessage = { id: Date.now(), type: "user", text: q };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botMsg = processBotResponse(q);
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function renderMessageText(text: string): React.ReactNode {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Bold text **xxx**
      let content: React.ReactNode = line;
      const boldMatches = line.match(/\*\*(.+?)\*\*/g);
      if (boldMatches) {
        const parts: React.ReactNode[] = [];
        let lastIdx = 0;
        boldMatches.forEach((match, mi) => {
          const idx = line.indexOf(match, lastIdx);
          if (idx > lastIdx) parts.push(<span key={`t${mi}`}>{line.substring(lastIdx, idx)}</span>);
          parts.push(<strong key={`b${mi}`} className="text-red-700">{match.replace(/\*\*/g, "")}</strong>);
          lastIdx = idx + match.length;
        });
        if (lastIdx < line.length) parts.push(<span key="tail">{line.substring(lastIdx)}</span>);
        content = parts;
      }

      // Code text `xxx`
      const codeMatches = line.match(/`(.+?)`/g);
      if (codeMatches) {
        const parts: React.ReactNode[] = [];
        let lastIdx = 0;
        codeMatches.forEach((match, mi) => {
          const idx = line.indexOf(match, lastIdx);
          if (idx > lastIdx) parts.push(<span key={`ct${mi}`}>{line.substring(lastIdx, idx)}</span>);
          parts.push(<code key={`c${mi}`} className="bg-red-50 text-red-700 px-1 py-0.5 rounded text-[11px] font-mono">{match.replace(/`/g, "")}</code>);
          lastIdx = idx + match.length;
        });
        if (lastIdx < line.length) parts.push(<span key="ctail">{line.substring(lastIdx)}</span>);
        content = parts;
      }

      if (line.startsWith("| ") && line.includes(" | ")) {
        // Table row
        const cells = line.split("|").map(c => c.trim()).filter(c => c);
        return (
          <div key={i} className="grid gap-1 py-0.5" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
            {cells.map((cell, ci) => (
              <span key={ci} className={`text-[11px] px-1 ${ci === 0 ? "font-semibold text-gray-700" : "text-gray-600"}`}>{cell}</span>
            ))}
          </div>
        );
      }

      if (line.startsWith("- ")) {
        return <div key={i} className="flex items-start gap-1.5 text-[11px] text-gray-700 leading-relaxed py-0.5"><span className="text-red-500 mt-0.5 shrink-0">•</span><span>{content}</span></div>;
      }

      if (!line.trim()) return <div key={i} className="h-1" />;

      return <div key={i} className="text-[11px] text-gray-700 leading-relaxed py-0.5">{content}</div>;
    });
  }

  const confidenceColor = (c?: string) => {
    if (c === "high") return "bg-green-100 text-green-700 border-green-200";
    if (c === "medium") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Product Browser */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="border-red-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-600" />
              <h3 className="text-sm font-bold text-gray-800">Product Knowledge Base</h3>
            </div>

            <div className="space-y-1">
              {PRODUCT_ORDER.map(key => {
                const p = PRODUCT_KB[key];
                return (
                  <button
                    key={key}
                    onClick={() => {
                      handleSend(`Tell me about ${p.name}`);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors group border border-transparent hover:border-red-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-gray-800 group-hover:text-red-700">{p.shortCode}</div>
                        <div className="text-[10px] text-gray-500 group-hover:text-red-600 leading-tight">{p.name}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-red-500" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t pt-3">
              <button
                onClick={() => setShowProducts(!showProducts)}
                className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-red-600 transition-colors"
              >
                {showProducts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Additional Products ({Object.keys(PRODUCT_KB).length - PRODUCT_ORDER.length} more)
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Model Decoder Card */}
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-800">Quick Model Decoder</h3>
            </div>
            <p className="text-[10px] text-gray-500">Paste any FMIPL model code to instantly decode it</p>
            <div className="flex gap-2">
              <Input
                placeholder="FMIPL-S900-F-S2-F1-L3-E1..."
                className="text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
            </div>
            <div className="text-[9px] text-gray-400 space-y-0.5">
              <div>Example: FMIPL-SMMLI-F-S2-F1-FC1-FS1-AS-DS-JNA-CD-SD1-SU1-TNA-SNA-25NB-900MM</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Chat Interface */}
      <div className="lg:col-span-2 flex flex-col h-[calc(100vh-180px)]">
        <Card className="flex-1 flex flex-col overflow-hidden border-red-200">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white">Flowtech Product Expert AI</div>
              <div className="text-[10px] text-red-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Online — {Object.keys(PRODUCT_KB).length} product families, 500+ technical parameters
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.type === "user" ? "justify-end" : ""}`}>
                {msg.type === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-red-600" />
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.type === "user" ? "order-1" : ""}`}>
                  <div className={`rounded-xl px-4 py-3 ${
                    msg.type === "user"
                      ? "bg-red-600 text-white"
                      : "bg-white border border-gray-200 shadow-sm"
                  }`}>
                    {msg.type === "bot" ? (
                      <div className="space-y-1">
                        {renderMessageText(msg.text)}
                      </div>
                    ) : (
                      <p className="text-sm">{msg.text}</p>
                    )}
                  </div>
                  {msg.type === "bot" && msg.confidence && (
                    <div className="flex items-center gap-2 mt-1.5 px-1">
                      <Badge className={`text-[8px] px-1.5 py-0 ${confidenceColor(msg.confidence)}`}>
                        {msg.confidence === "high" ? <CheckCircle2 className="w-2.5 h-2.5 inline mr-0.5" /> : <HelpCircle className="w-2.5 h-2.5 inline mr-0.5" />}
                        {msg.confidence} confidence
                      </Badge>
                      {msg.source && (
                        <span className="text-[8px] text-gray-400">{msg.source}</span>
                      )}
                    </div>
                  )}
                </div>
                {msg.type === "user" && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5 order-2">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-red-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 py-3 border-t bg-white shrink-0">
              <p className="text-[10px] text-gray-500 mb-2 font-medium">Quick Questions — click to ask:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q.text)}
                    className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    {q.icon}
                    <span className="truncate max-w-[200px]">{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-white shrink-0">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Ask about any Flowtech product, paste a model code, or describe your application..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 text-sm"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="bg-red-600 hover:bg-red-700 text-white px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[9px] text-gray-400 mt-2 text-center">
              Powered by Flowtech Product Knowledge Base — Model codes, specs, applications, comparisons
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
