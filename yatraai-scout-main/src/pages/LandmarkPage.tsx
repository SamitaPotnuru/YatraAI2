import { motion } from "framer-motion";
import { CameraAlt as Camera, UploadFile as Upload, TravelExplore, Chat as ChatIcon, Map as MapIcon } from "@mui/icons-material";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LandmarkPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [result, setResult] = useState<{ name: string; description: string } | null>(null);
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  const handleScan = async () => {
    if (!fileToUpload) return;
    setScanning(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", fileToUpload);

    try {
      // Use /api/predict which Vercel proxies to Leapcell server-side (no CORS)
      const response = await fetch(`/api/predict`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      
      setResult({ 
        name: data.prediction, 
        description: data.details || "Discovered by AI Vision. This magnificent Indian heritage site is a testament to the region's architectural brilliance and historical depth." 
      });
    } catch (error) {
      console.error(error);
      setResult({
        name: "Identification Failed",
        description: "Server error. Check if the AI backend server is running and configured correctly.",
      });
    } finally {
      setScanning(false);
    }
  };

  const navigateToMap = () => {
    if (result) {
      // Pass the landmark as the destination to the Map explorer
      navigate(`/map?dest=${encodeURIComponent(result.name)}`);
    }
  };

  const askAIAboutLandmark = () => {
    if (result) {
      // Pre-fill the chat with a query about the landmark
      navigate(`/scout?q=${encodeURIComponent(`Tell me more about ${result.name} and suggest some good heritage hotels nearby.`)}`);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
          <Camera className="h-8 w-8 text-primary" /> AI Landmark Identification
        </h1>
        <p className="text-muted-foreground mb-8">Upload a photo of any Indian monument to identify it instantly</p>

        <div
          className={`glass-card-solid rounded-2xl p-8 text-center border-2 border-dashed transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          {image ? (
            <div className="space-y-4">
              <img src={image} alt="Uploaded" className="max-h-64 mx-auto rounded-xl object-cover shadow-lg border border-border" />
              <div className="pt-4 flex justify-center gap-4">
                <Button onClick={handleScan} disabled={scanning} className="gradient-primary-bg text-primary-foreground border-0 px-8">
                  {scanning ? (
                    <span className="flex items-center gap-2">
                       <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                       Scanning...
                    </span>
                  ) : (
                    <>
                      <TravelExplore className="mr-2" /> Identify Landmark
                    </>
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

        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card-solid rounded-2xl p-6 mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2 flex items-center gap-2">🏛️ {result.name}</h2>
                <p className="text-muted-foreground max-w-xl">{result.description}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button onClick={navigateToMap} className="gradient-primary-bg text-primary-foreground border-0">
                  <MapIcon className="mr-2 h-4 w-4" /> Set as Destination
                </Button>
                <Button variant="outline" onClick={askAIAboutLandmark} className="text-primary hover:bg-primary/5 border-primary/20">
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
