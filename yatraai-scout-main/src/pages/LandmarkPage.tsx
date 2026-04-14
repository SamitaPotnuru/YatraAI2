import { motion } from "framer-motion";
import { CameraAlt as Camera, UploadFile as Upload, TravelExplore, Chat as ChatIcon, Map as MapIcon, AutoFixHigh } from "@mui/icons-material";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "meta-llama/llama-4-scout-17b-16e-instruct";

const toBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload  = () => res((reader.result as string).split(",")[1]);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

const LandmarkPage = () => {
  const [dragActive, setDragActive]     = useState(false);
  const [image, setImage]               = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [result, setResult]             = useState<{ name: string; description: string } | null>(null);
  const [scanning, setScanning]         = useState(false);
  const navigate = useNavigate();

  const handleScan = async () => {
    if (!fileToUpload) return;
    setScanning(true);
    setResult(null);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error("Groq API key not configured.");

      const b64 = await toBase64(fileToUpload);
      const mimeType = fileToUpload.type || "image/jpeg";

      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type":  "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 200,
          temperature: 0.2,
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an expert on Indian heritage monuments, UNESCO sites, and ASI monuments.
Identify the monument in this image. Respond with exactly TWO lines:
Line 1: Monument name — City, State, India
Line 2: One sharp, precise sentence describing its historical significance.
Do not use asterisks, markdown, or bullet points.`,
              },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${b64}` },
              },
            ],
          }],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Groq error ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim() ?? "";
      const lines = text.split("\n").map((l: string) => l.trim()).filter(Boolean);

      setResult({
        name:        lines[0] || "Unknown Landmark",
        description: lines[1] || "A remarkable Indian heritage site.",
      });
    } catch (error: any) {
      console.error(error);
      setResult({
        name:        "Identification Failed",
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setScanning(false);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setFileToUpload(file);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Camera className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            AI Landmark Identification
          </h1>
          <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 font-semibold">
            Powered by Groq Vision
          </span>
        </div>
        <p className="text-muted-foreground mb-8 text-sm md:text-base">
          Upload a photo of any Indian monument — AI identifies it instantly, no backend required.
        </p>

        {/* Drop Zone */}
        <div
          className={`glass-card-solid rounded-2xl p-6 md:p-8 text-center border-2 border-dashed transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        >
          {image ? (
            <div className="space-y-4">
              <img src={image} alt="Uploaded" className="max-h-64 mx-auto rounded-xl object-cover shadow-lg border border-border" />
              <div className="flex justify-center gap-3 flex-wrap">
                <Button
                  onClick={handleScan}
                  disabled={scanning}
                  className="gradient-primary-bg text-primary-foreground border-0 px-8"
                >
                  {scanning ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Analysing with AI...
                    </span>
                  ) : (
                    <><TravelExplore className="mr-2" /> Identify Landmark</>
                  )}
                </Button>
                <Button variant="outline" onClick={() => { setImage(null); setFileToUpload(null); setResult(null); }}>
                  Clear
                </Button>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer block py-12">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium">Drop an image here or click to upload</p>
              <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, WebP</p>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </label>
          )}
        </div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card-solid rounded-2xl p-6 mt-6 border border-border/50"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
                  🏛️ {result.name}
                </h2>
                <p className="text-muted-foreground max-w-xl text-sm md:text-base">{result.description}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button
                  onClick={() => navigate(`/dashboard/map?dest=${encodeURIComponent(result.name)}`)}
                  className="gradient-primary-bg text-primary-foreground border-0"
                >
                  <MapIcon className="mr-2 h-4 w-4" /> Set as Destination
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/dashboard/scout?q=${encodeURIComponent(`Tell me about ${result.name} and suggest nearby heritage hotels.`)}`)}
                  className="text-primary hover:bg-primary/5 border-primary/20"
                >
                  <ChatIcon className="mr-2 h-4 w-4" /> Ask Scout AI
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LandmarkPage;
