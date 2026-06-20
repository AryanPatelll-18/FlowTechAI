/**
 * AI Settings Panel — Configure OpenAI API key for AI-driven extraction
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Key, AlertTriangle, CheckCircle2, Brain, Eye, EyeOff } from "lucide-react";
import { getAISettings, saveAISettings, hasApiKey, type AISettings } from "../data/aiExtractionService";

export default function AISettingsPanel() {
  const [settings, setSettings] = useState<AISettings>(getAISettings());
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getAISettings());
  }, []);

  const handleSave = () => {
    saveAISettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const configured = hasApiKey();

  return (
    <div className="space-y-4 max-w-xl">
      <Card className={configured ? "border-green-200" : "border-amber-200"}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-red-600" />
            AI Extraction Settings
            {configured ? (
              <Badge className="text-[9px] bg-green-100 text-green-700 border-0 gap-1">
                <CheckCircle2 className="w-3 h-3" />Configured
              </Badge>
            ) : (
              <Badge className="text-[9px] bg-amber-100 text-amber-700 border-0 gap-1">
                <AlertTriangle className="w-3 h-3" />API Key Required
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!configured && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">AI extraction is not configured</p>
                  <p className="mt-1">The app is currently using Enhanced Regex v3 (~85% accuracy). Add your OpenAI API key to enable GPT-4o AI extraction (90-98% accuracy).</p>
                  <p className="mt-1">Get your API key from: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">platform.openai.com/api-keys</a></p>
                </div>
              </div>
            </div>
          )}

          {/* API Key */}
          <div>
            <label className="text-[10px] font-medium text-gray-700 block mb-1">OpenAI API Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? "text" : "password"}
                  value={settings.openaiApiKey}
                  onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full pl-3 pr-9 py-2 border rounded-lg text-sm font-mono"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">Stored locally in your browser. Never sent to any server except OpenAI.</p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-[10px] font-medium text-gray-700 block mb-1">Model</label>
            <select
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="gpt-4o">GPT-4o (Best accuracy, ~$8.80/1K pages)</option>
              <option value="gpt-4o-mini">GPT-4o Mini (Faster, cheaper, ~$1.50/1K pages, lower accuracy)</option>
            </select>
          </div>

          {/* Extraction Mode */}
          <div>
            <label className="text-[10px] font-medium text-gray-700 block mb-1">Extraction Mode</label>
            <select
              value={settings.extractionMode}
              onChange={(e) => setSettings({ ...settings, extractionMode: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="auto">Auto — AI when key available, regex fallback otherwise</option>
              <option value="ai_only">AI Only — Always use GPT-4o (fails if no key)</option>
              <option value="regex_fallback">Regex Enhanced — Regex + smart post-processing (no AI)</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} size="sm" className="bg-red-600 hover:bg-red-700 gap-1">
              {saved ? <CheckCircle2 className="w-3 h-3" /> : <Key className="w-3 h-3" />}
              {saved ? "Saved" : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            How AI Extraction Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-[11px] text-muted-foreground">
            <p><strong className="text-gray-700">1. Upload SO/QTN PDF</strong> — Any format: scanned, digital, image-based</p>
            <p><strong className="text-gray-700">2. GPT-4o reads the document</strong> — Understands layout, tables, context, and semantics</p>
            <p><strong className="text-gray-700">3. Structured data extraction</strong> — Tag, model, process conditions, sizing data, certifications</p>
            <p><strong className="text-gray-700">4. Confidence scoring</strong> — Every field has a 0.0-1.0 confidence score for human review</p>
            <p><strong className="text-gray-700">5. Direct sizing input</strong> — Extracted process conditions feed directly into sizing engine</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-red-50 border border-red-200 rounded p-2 text-center">
              <div className="font-bold text-red-700">Regex (Current)</div>
              <div className="text-red-600">~85% accuracy</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
              <div className="font-bold text-green-700">GPT-4o (AI)</div>
              <div className="text-green-600">90-98% accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
