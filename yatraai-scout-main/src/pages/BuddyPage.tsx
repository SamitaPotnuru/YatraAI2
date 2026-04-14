import { motion } from "framer-motion";
import { People as Users, Favorite as Heart, Place as MapPin } from "@mui/icons-material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const DUMMY_PROFILES = [
  { id: 1, name: "Rahul S.", age: 28, destination: "Goa", interests: ["Beaches", "Nightlife", "Photography"], avatar: "🧑", bio: "Party animal looking for friends" },
  { id: 2, name: "Sneha M.", age: 24, destination: "Jaipur", interests: ["History", "Architecture", "Food"], avatar: "👩", bio: "History buff exploring the pink city" },
  { id: 3, name: "Vikram P.", age: 32, destination: "Manali", interests: ["Trekking", "Adventure", "Nature"], avatar: "👨", bio: "Mountains are calling." },
  { id: 4, name: "Anjali K.", age: 26, destination: "Kerala", interests: ["Ayurveda", "Houseboats", "Culture"], avatar: "🧕", bio: "Seeking peace in the backwaters." },
];

const BuddyPage = () => {
  const [matchedBuddies, setMatchedBuddies] = useState<any[] | null>(null);
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);

  const findBuddy = async () => {
    if (!location) {
      alert("Please enter a destination to find a buddy.");
      return;
    }

    const MASTER_GROQ_KEY = localStorage.getItem("keys/groq") || import.meta.env.VITE_GROQ_API_KEY;
    if (!MASTER_GROQ_KEY) {
      alert("Set GROQ_API_KEY in .env or LocalStorage for AI matching.");
      return;
    }

    setLoading(true);

    try {
      const aiPrompt = `A user wants to travel to: ${location}. Their interests are: ${interests || "Not specified"}.
      Here are the available dummy profiles: ${JSON.stringify(DUMMY_PROFILES)}
      Select the best 2 matches. Return your response ONLY as a valid JSON array. 
      CRITICAL: The "reason" field must be a sharp, professional text without any asterisks, bolding, or markdown symbols. 
      Format: [{"id": 1, "reason": "Accurate reason text"}]`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": "Bearer " + MASTER_GROQ_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: aiPrompt }],
        }),
      });

      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      let reply = data.choices[0].message.content.trim();
      const matchObj = reply.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (matchObj) reply = matchObj[1];

      const matches = JSON.parse(reply);
      const fullMatches = matches.map((m: any) => {
        const p = DUMMY_PROFILES.find(x => x.id === m.id) || DUMMY_PROFILES[0];
        return { ...p, reason: m.reason };
      });
      setMatchedBuddies(fullMatches);
    } catch (e) {
      console.error(e);
      alert("Error finding match. Check your connection or API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
          <Users fontSize="large" className="text-secondary" /> Travel Buddy Matchmaker
        </h1>
        <p className="text-muted-foreground mb-8">Find AI-matched travel companions based on your interests</p>

        <div className="glass-card-solid rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input placeholder="Destination (e.g. Goa, Jaipur)" value={location} onChange={e => setLocation(e.target.value)} />
            <Input placeholder="Your Interests (e.g. Photography, Food)" value={interests} onChange={e => setInterests(e.target.value)} />
          </div>
          <Button onClick={findBuddy} disabled={loading} className="w-full gradient-primary-bg text-primary-foreground border-0">
            {loading ? "Analyzing..." : <><Heart fontSize="small" className="mr-2" /> Find My Buddy</>}
          </Button>
        </div>

        {matchedBuddies && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedBuddies.length === 0 && <p className="text-muted-foreground p-4">No suitable matches found.</p>}
            {matchedBuddies.map((buddy, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card-solid rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{buddy.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{buddy.name} ({buddy.age})</h3>
                    <p className="text-sm text-secondary mt-1 font-medium"><MapPin fontSize="small" /> {buddy.destination}</p>
                    <p className="text-sm text-foreground mt-2">{buddy.reason}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {buddy.interests.map((x: string) => (
                        <span key={x} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{x}</span>
                      ))}
                    </div>
                    <Button size="sm" className="mt-3 gradient-primary-bg text-primary-foreground border-0 text-xs w-full" onClick={() => alert("Connect request sent!")}>
                      Send Connect Request
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
export default BuddyPage;
