import { motion } from "framer-motion";
import { SmartToy as Brain, Send, Mic, Menu, Message as MessageSquare, Add as Plus, Delete as Trash2, VolumeUp, VolumeOff } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router-dom";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

const HARDCODED_HOTELS = {
  "Agra": "The Oberoi Amarvilas, Taj Hotel & Convention Centre",
  "Goa": "Taj Exotica Resort & Spa, W Goa",
  "Jaipur": "Rambagh Palace, Fairmont Jaipur",
  "Mumbai": "The Taj Mahal Palace, The Oberoi Mumbai",
  "Delhi": "The Leela Palace, Taj Diplomatic Enclave",
  "Kerala": "Taj Kumarakom Resort, The Zuri White Sands",
};

const SYSTEM_PROMPT = `You are Scout AI, a professional multilingual travel intelligence engine. 

CRITICAL PROTOCOLS:
1. NO FORMATTING SYMBOLS: Never use asterisks (*), underscores (_), or bold markdown. Use clean spacing for emphasis.
2. SHARP & PRECISE: Deliver information with executive-level clarity. Avoid conversational filler.
3. MULTILINGUAL CAPABILITY: fluently support English, Hindi, Telugu, Tamil, and Kannada.
4. HERITAGE DATABASE: Use these specific suggestions for the following cities:
   - Agra: The Oberoi Amarvilas, Taj Hotel & Convention Centre
   - Goa: Taj Exotica Resort & Spa, W Goa
   - Jaipur: Rambagh Palace, Fairmont Jaipur
   - Mumbai: The Taj Mahal Palace, The Oberoi Mumbai
   - Delhi: The Leela Palace, Taj Diplomatic Enclave
   - Kerala: Taj Kumarakom Resort, The Zuri White Sands

FORMATTING: Present hotel data as simple, high-visibility lists without symbols.`;

const ScoutAIPage = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setInput(query);
    }
  }, [searchParams]);

  // Load configuration for API key
  const MASTER_GROQ_KEY = localStorage.getItem("keys/groq") || import.meta.env.VITE_GROQ_API_KEY || "";

  useEffect(() => {
    const saved = localStorage.getItem("scout_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        } else {
          createNewSession();
        }
      } catch (e) {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("scout_chat_history", JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, currentSessionId]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [
        { role: "assistant", content: "Namaste! 🙏 I'm Scout AI, your travel companion. Ask me about any destination in India — travel tips, historical facts, or hidden gems!" },
      ],
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
      } else {
        createNewSession();
      }
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const handleSend = async () => {
    if (!input.trim() || !currentSessionId) return;
    
    if (!MASTER_GROQ_KEY) {
      alert("Set GROQ_API_KEY in .env or localStorage for chat.");
      return;
    }

    const userMsg: Message = { role: "user", content: input };
    const sessionIndex = sessions.findIndex(s => s.id === currentSessionId);
    if (sessionIndex === -1) return;

    const newSessions = [...sessions];
    const sessionToUpdate = { ...newSessions[sessionIndex] };
    
    sessionToUpdate.messages = [...sessionToUpdate.messages, userMsg];
    
    if (sessionToUpdate.messages.length === 2) {
      sessionToUpdate.title = input.slice(0, 30) + (input.length > 30 ? "..." : "");
    }
    
    sessionToUpdate.updatedAt = Date.now();
    newSessions[sessionIndex] = sessionToUpdate;
    setSessions(newSessions);
    setInput("");
    setLoading(true);
    window.speechSynthesis.cancel(); // Stop any pending speech
    setIsSpeaking(false);

    try {
      const messagesToApi = [
        { role: "system", content: SYSTEM_PROMPT },
        ...sessionToUpdate.messages.map(m => ({ role: m.role, content: m.content }))
      ];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + MASTER_GROQ_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: messagesToApi,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) throw new Error("API error: " + response.status);
      const data = await response.json();
      const reply = data.choices[0].message.content || "Sorry, I couldn't generate a response.";

      const botMsg: Message = { role: "assistant", content: reply };
      
      setSessions(prev => {
        const next = [...prev];
        const idx = next.findIndex(s => s.id === currentSessionId);
        if (idx !== -1) {
          next[idx] = { ...next[idx], messages: [...next[idx].messages, botMsg], updatedAt: Date.now() };
        }
        return next;
      });
      speakText(reply);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = { role: "assistant", content: "Could not reach AI. Check your API key or network." };
      setSessions(prev => {
        const next = [...prev];
        const idx = next.findIndex(s => s.id === currentSessionId);
        if (idx !== -1) {
          next[idx] = { ...next[idx], messages: [...next[idx].messages, errorMsg], updatedAt: Date.now() };
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.onresult = (e: any) => {
      setInput(e.results[0][0].transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* Sidebar for History */}
      <motion.div 
        initial={false}
        animate={{ width: sidebarOpen ? "250px" : "0px", opacity: sidebarOpen ? 1 : 0 }}
        className="shrink-0 rounded-2xl glass-card-solid overflow-hidden flex flex-col h-full z-10 transition-all duration-300 shadow-md hidden md:flex"
      >
        <div className="p-4 border-b border-border flex flex-col gap-2 relative z-20">
          <Button onClick={createNewSession} className="w-full justify-start gap-2 h-10 gradient-primary-bg border-0">
            <Plus /> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 z-20">
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => setCurrentSessionId(s.id)}
              className={`p-2 w-full text-left text-sm rounded-lg hover:bg-accent/10 transition-colors flex justify-between items-center cursor-pointer group ${currentSessionId === s.id ? 'bg-accent/20 font-medium' : 'text-muted-foreground'}`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <MessageSquare fontSize="small" className="shrink-0" />
                <span className="truncate">{s.title}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0 hover:text-destructive" onClick={(e) => deleteSession(s.id, e)}>
                <Trash2 fontSize="small" />
              </Button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-card-solid rounded-2xl p-4 flex flex-col overflow-hidden relative shadow-md">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:flex">
            <Menu />
          </Button>
          <Brain fontSize="large" className="text-accent" />
          <h1 className="text-xl font-display font-bold text-foreground">Scout AI</h1>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
          {currentSession?.messages.map((msg, i) => (
            msg.role !== "system" && (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "gradient-primary-bg text-primary-foreground shadow-sm"
                      : "bg-background border border-border text-foreground shadow-sm relative group"
                  }`}
                >
                  {msg.content}
                  {msg.role === "assistant" && (
                    <div className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => speakText(msg.content)}>
                        <VolumeUp fontSize="small" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-background border border-border text-foreground rounded-2xl px-4 py-3 text-sm flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="flex gap-2 mt-4 pt-3 relative">
          <Button variant="outline" size="icon" onClick={handleVoice} className={`shrink-0 rounded-full h-10 w-10 ${listening ? "bg-red-50 text-red-500 border-red-200 animate-pulse" : ""}`}>
            <Mic />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Scout AI..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            className="flex-1 rounded-full px-4"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} className="shrink-0 rounded-full h-10 w-10 gradient-primary-bg text-primary-foreground p-0">
            <Send fontSize="small" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScoutAIPage;
