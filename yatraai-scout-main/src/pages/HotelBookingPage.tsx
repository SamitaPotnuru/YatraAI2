import { motion } from "framer-motion";
import { Hotel as HotelIcon, Search, Tune, Sort } from "@mui/icons-material";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import HotelCard from "@/components/HotelCard";

const HARDCODED_HOTELS = [
  // Luxury
  { city: "Agra", name: "The Oberoi Amarvilas", rating: 5, price: 45000, category: "luxury", location: "Near Taj Mahal", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400", description: "Uninterrupted views of the Taj Mahal. Pure Mughal luxury." },
  { city: "Jaipur", name: "Rambagh Palace", rating: 5, price: 38000, category: "luxury", location: "Bhawani Singh Road", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", description: "Royal hospitality in a sprawling palace setting." },
  { city: "Delhi", name: "The Leela Palace", rating: 5, price: 28000, category: "luxury", location: "Chanakyapuri", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400", description: "Modern luxury meets traditional motifs." },
  { city: "Mumbai", name: "The Taj Mahal Palace", rating: 5, price: 22500, category: "luxury", location: "Colaba", image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e84?auto=format&fit=crop&w=800&q=80", description: "India's first luxury hotel, a landmark in itself." },
  // Mid Range
  { city: "Agra", name: "ITC Mughal", rating: 4, price: 12000, category: "mid", location: "Taj Ganj", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400", description: "A luxury collection hotel inspired by Mughal architecture." },
  { city: "Jaipur", name: "Shahpura House", rating: 4, price: 8500, category: "mid", location: "Bani Park", image: "https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=800&q=80", description: "Experience Rajput hospitality in a heritage boutique hotel." },
  { city: "Delhi", name: "The Claridges", rating: 4, price: 14000, category: "mid", location: "Aurangzeb Road", image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400", description: "Classic elegance since 1952 in the heart of Lutyens' Delhi." },
  // Budget
  { city: "Agra", name: "Hotel Taj Resort", rating: 3, price: 3500, category: "budget", location: "Fatehabad Road", image: "https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=400", description: "Comfortable and affordable stay just 500m from the Taj." },
  { city: "Jaipur", name: "Pearl Palace Heritage", rating: 3, price: 4200, category: "budget", location: "Ajmer Road", image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=400", description: "Award-winning heritage guesthouse with artistic decor." },
  { city: "Delhi", name: "Bloomrooms @ Link Road", rating: 3, price: 4800, category: "budget", location: "Jangpura", image: "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=400", description: "Clean, bright, and modern stays with excellent connectivity." },
  // Heritage & New additions
  { city: "Udaipur", name: "Taj Lake Palace", rating: 5, price: 65000, category: "luxury", location: "Lake Pichola", image: "https://images.unsplash.com/photo-1598977123418-4545450388fb?auto=format&fit=crop&w=800&q=80", description: "A floating vision of white marble in the center of Lake Pichola." },
  { city: "Jodhpur", name: "Umaid Bhawan Palace", rating: 5, price: 75000, category: "luxury", location: "Circuit House Road", image: "https://images.unsplash.com/photo-1549412644-1044bb1ca9a1?auto=format&fit=crop&w=800&q=80", description: "One of the world's largest private residences, a desert oasis." },
  { city: "Hyderabad", name: "Taj Falaknuma Palace", rating: 5, price: 55000, category: "luxury", location: "Engine Bowli", image: "https://images.unsplash.com/photo-1629721671030-a83edbb11237?auto=format&fit=crop&w=800&q=80", description: "Be world's guests at this palace in the sky, 2000 feet above Hyderabad." },
  { city: "Varanasi", name: "BrijRama Palace", rating: 5, price: 35000, category: "luxury", location: "Dashashwamedh Ghat", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80", description: "One of the oldest landmarks on the Ganges, offering spiritual luxury." },
  { city: "Shimla", name: "Wildflower Hall", rating: 5, price: 42000, category: "luxury", location: "Chharabra", image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80", description: "Oberoi resort in the Himalayas with breathtaking cedar forest views." },
  { city: "Udaipur", name: "The Leela Palace", rating: 5, price: 48000, category: "luxury", location: "Lake Pichola", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80", description: "Lakeside modern palace reflecting the grandeur of Mewar." },
  { city: "Kochi", name: "Brunton Boatyard", rating: 4, price: 18000, category: "mid", location: "Fort Kochi", image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80", description: "Built on the remains of a Victorian shipyard, reflecting Kochi's history." },
  { city: "Mysore", name: "Lalitha Mahal Palace", rating: 4, price: 12000, category: "mid", location: "Siddhartha Layout", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", description: "Grand palace hotel at the base of Chamundi Hill." },
  { city: "Amritsar", name: "Ranjit's Svaasa", rating: 4, price: 9500, category: "mid", location: "Mall Road", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80", description: "A pre-independence heritage haveli turned boutique health spa." },
  { city: "Gwalior", name: "Usha Kiran Palace", rating: 4, price: 14000, category: "mid", location: "Jayendraganj", image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80", description: "A 120-year-old palace with stunning architecture and local crafts." }
];

const HotelBookingPage = () => {
  const [search, setSearch] = useState("");
  const [maxBudget, setMaxBudget] = useState(50000);
  const [sortBy, setSortBy] = useState("recommended");

  const filteredHotels = HARDCODED_HOTELS.filter(h => 
    (h.city.toLowerCase().includes(search.toLowerCase()) || 
     h.name.toLowerCase().includes(search.toLowerCase())) &&
    h.price <= maxBudget
  ).sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0; // recommended / default
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
          <HotelIcon fontSize="large" className="text-primary" /> Heritage Stays & Bookings
        </h1>
        <p className="text-muted-foreground mb-8">Discover and book handpicked heritage hotels across India</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card-solid p-6 rounded-2xl border border-border/50 sticky top-24">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Tune fontSize="small" /> Filters
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Search Location/Hotel</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="e.g. Agra" 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Budget (per night)</label>
                    <span className="text-xs font-bold text-primary">₹{maxBudget.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="3000" 
                    max="50000" 
                    step="1000" 
                    value={maxBudget} 
                    onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-2 uppercase tracking-tighter">
                    <span>Economy</span>
                    <span>Luxury</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Categories</label>
                  <div className="space-y-2">
                    {["Boutique", "Palace", "Resort", "Heritage"].map(cat => (
                      <label key={cat} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Showing {filteredHotels.length} luxury stays</p>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs gap-2">
                    <Sort fontSize="inherit" /> 
                    Sort by: {sortBy === "recommended" ? "Recommended" : sortBy === "price-low" ? "Price: Low to High" : "Price: High to Low"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass-card-solid border-border/50">
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                    <DropdownMenuRadioItem value="recommended" className="text-xs">Recommended</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="price-low" className="text-xs">Price: Low to High</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="price-high" className="text-xs">Price: High to Low</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredHotels.length > 0 ? (
                filteredHotels.map((hotel, i) => (
                  <HotelCard key={i} {...hotel} price={hotel.price.toLocaleString()} />
                ))
              ) : (
                <div className="glass-card-solid rounded-2xl p-12 text-center opacity-60">
                  <HotelIcon fontSize="large" className="mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">No Hotels Found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your budget or search term.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HotelBookingPage;
