import { motion } from "framer-motion";
import { Map as MapIcon, LocationOn, Search, NearMe, Route, FilterList } from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import HotelCard from "@/components/HotelCard";

const HARDCODED_HOTELS = [
  // Luxury
  { city: "Agra", name: "The Oberoi Amarvilas", rating: 5, price: 45000, category: "luxury", location: "Near Taj Mahal", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400", description: "Uninterrupted views of the Taj Mahal. Pure Mughal luxury." },
  { city: "Jaipur", name: "Rambagh Palace", rating: 5, price: 38000, category: "luxury", location: "Bhawani Singh Road", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", description: "Royal hospitality in a sprawling palace setting." },
  { city: "Delhi", name: "The Leela Palace", rating: 5, price: 28000, category: "luxury", location: "Chanakyapuri", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400", description: "Modern luxury meets traditional motifs." },
  // Mid Range
  { city: "Agra", name: "ITC Mughal", rating: 4, price: 12000, category: "mid", location: "Taj Ganj", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400", description: "A luxury collection hotel inspired by Mughal architecture." },
  { city: "Jaipur", name: "Shahpura House", rating: 4, price: 8500, category: "mid", location: "Bani Park", image: "https://images.unsplash.com/photo-1551882547-ff43c33fefee?w=400", description: "Experience Rajput hospitality in a heritage boutique hotel." },
  { city: "Delhi", name: "The Claridges", rating: 4, price: 14000, category: "mid", location: "Aurangzeb Road", image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400", description: "Classic elegance since 1952 in the heart of Lutyens' Delhi." },
  // Budget
  { city: "Agra", name: "Hotel Taj Resort", rating: 3, price: 3500, category: "budget", location: "Fatehabad Road", image: "https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=400", description: "Comfortable and affordable stay just 500m from the Taj." },
  { city: "Jaipur", name: "Pearl Palace Heritage", rating: 3, price: 4200, category: "budget", location: "Ajmer Road", image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=400", description: "Award-winning heritage guesthouse with artistic decor." },
  { city: "Delhi", name: "Bloomrooms @ Link Road", rating: 3, price: 4800, category: "budget", location: "Jangpura", image: "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=400", description: "Clean, bright, and modern stays with excellent connectivity." }
];

// Fix for default Leaflet icons in Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const RecenterMap = ({ lat, lon }: { lat: number; lon: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
};

const RouteBounds = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);
  return null;
};

const MapPage = () => {
  const [position, setPosition] = useState<[number, number]>([28.6139, 77.209]); // Default Delhi
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [routeLine, setRouteLine] = useState<[number, number][] | null>(null);
  const [poiCategory, setPoiCategory] = useState("");
  const [radius, setRadius] = useState("5000"); // m
  const [pois, setPois] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [routingDist, setRoutingDist] = useState("");
   const [searchParams] = useSearchParams();
  const [suggestedHotels, setSuggestedHotels] = useState<any[]>([]);
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [maxBudget, setMaxBudget] = useState(50000);

  useEffect(() => {
    const dest = searchParams.get("dest");
    if (dest) {
      setEndQuery(dest);
      checkForHotels(dest);
    }
  }, [searchParams]);

  const checkForHotels = (query: string, budget: number = maxBudget) => {
    const cityHotels = HARDCODED_HOTELS.filter(h => 
      (query.toLowerCase().includes(h.city.toLowerCase()) || 
      h.city.toLowerCase().includes(query.toLowerCase())) &&
      h.price <= budget
    );
    setSuggestedHotels(cityHotels);
  };

  useEffect(() => {
    if (endQuery) checkForHotels(endQuery, maxBudget);
  }, [maxBudget]);

  const handleGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setStartQuery("Current Location");
        },
        () => alert("GPS access denied or failed.")
      );
    }
  };

  const geocode = async (query: string): Promise<[number, number] | null> => {
    if (query === "Current Location") return position;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const handleRoute = async () => {
    if (!startQuery || !endQuery) return;
    setLoading(true);
    const start = await geocode(startQuery);
    const end = await geocode(endQuery);
    if (start && end) {
       try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map((c: any) => [c[1], c[0]]);
          setRouteLine(coords);
          setRoutingDist((route.distance / 1000).toFixed(1) + " km");
          
          // Flatten instructions from steps
          const steps = route.legs[0].steps.map((s: any) => ({
            instruction: s.maneuver.instruction,
            distance: s.distance > 1000 ? (s.distance / 1000).toFixed(1) + " km" : Math.round(s.distance) + " m"
          }));
          setRouteSteps(steps);
          setPosition(start);
        }
      } catch (err) {
        console.error("Routing error", err);
      }
    } else {
      alert("Location not found.");
    }
    checkForHotels(endQuery);
    setLoading(false);
  };

  const handleFindNearby = async (category: string) => {
    setPoiCategory(category);
    setLoading(true);
    setPois([]);
    
    const queryMap: any = {
      beach: '["natural"="beach"]',
      temple: '["amenity"="place_of_worship"]',
      hotel: '["tourism"="hotel"]',
      park: '["leisure"="park"]',
      restaurant: '["amenity"="restaurant"]',
    };
    
    const filter = queryMap[category];
    if (!filter) { setLoading(false); return; }

    const q = `[out:json];node(around:${radius},${position[0]},${position[1]})${filter};out 50;`;
    try {
      const res = await fetch("https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(q));
      const data = await res.json();
      if (data && data.elements) {
        setPois(data.elements.filter((e: any) => e.lat && e.lon));
      }
    } catch (e) {
      console.error(e);
      alert("Error fetching POIs. Try decreasing radius.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col" style={{ height: "calc(100svh - 7rem)" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0">
        <h1 className="text-xl md:text-3xl font-display font-bold text-foreground mb-1 flex items-center gap-2">
          <MapIcon fontSize="medium" className="text-secondary" /> Map Explorer
        </h1>
        <p className="text-muted-foreground text-sm mb-3 hidden md:block">Interactive mapping, routing, and nearby discovery powered by OpenStreetMap.</p>
      </motion.div>
      
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-y-auto md:overflow-hidden">
        {/* Map first on mobile, then controls, then hotel sidebar */}
        {/* Sidebar Controls */}
        <div className="w-full md:w-1/3 flex flex-col gap-4 md:overflow-y-auto pr-0 md:pr-2 pb-4 order-2 md:order-1">
          <div className="glass-card-solid p-4 rounded-xl">
            <h2 className="font-bold mb-3 flex items-center gap-2"><Route fontSize="small"/> Route Planner</h2>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input placeholder="Start Location" value={startQuery} onChange={(e) => setStartQuery(e.target.value)} />
                <Button variant="outline" size="icon" onClick={handleGPS} title="Use GPS"><NearMe fontSize="small"/></Button>
              </div>
              <Input placeholder="Destination" value={endQuery} onChange={(e) => setEndQuery(e.target.value)} />
              <Button onClick={handleRoute} disabled={loading} className="w-full gradient-primary-bg border-0 text-white"><Search fontSize="small" className="mr-2"/> Find Route</Button>
              {routingDist && <div className="text-sm font-semibold text-primary text-center mt-2">Distance: {routingDist}</div>}
            </div>
          </div>

          <div className="glass-card-solid p-4 rounded-xl flex-1">
            <h2 className="font-bold mb-3 flex items-center gap-2"><FilterList fontSize="small"/> Nearby Explorer</h2>
            <div className="mb-4">
               <label className="text-xs text-muted-foreground">Radius (meters):</label>
               <Input type="number" value={radius} onChange={(e) => setRadius(e.target.value)} min="500" max="25000" />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
               {["temple", "hotel", "beach", "park", "restaurant"].map(cat => (
                 <Button key={cat} size="sm" variant={poiCategory === cat ? "default" : "outline"} onClick={() => handleFindNearby(cat)} className="capitalize">{cat}</Button>
               ))}
            </div>
            
            {loading && <p className="text-center text-sm text-muted-foreground animate-pulse">Searching...</p>}
            
            <div className="space-y-2 overflow-y-auto max-h-48">
              {pois.map(poi => (
                <div key={poi.id} className="p-2 bg-muted rounded-md text-sm cursor-pointer hover:bg-accent/10" onClick={() => setPosition([poi.lat, poi.lon])}>
                  <div className="font-semibold text-foreground">{poi.tags?.name || "Unnamed " + poiCategory}</div>
                  <div className="text-xs text-muted-foreground">{poi.tags?.amenity || poi.tags?.tourism || "Point of Interest"}</div>
                </div>
              ))}
              {!loading && poiCategory && pois.length === 0 && <p className="text-xs text-muted-foreground text-center">No results found.</p>}
            </div>
          </div>
        </div>
        
        {/* Map Container */}
        <div className="w-full md:w-2/3 glass-card-solid rounded-xl overflow-hidden shadow-lg h-[350px] md:h-full relative z-0 order-1 md:order-2">
           <MapContainer 
             center={position} 
             zoom={13} 
             style={{ height: "100%", width: "100%", zIndex: 0 }}
           >
             <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
             />
             <RecenterMap lat={position[0]} lon={position[1]} />
             {routeLine && <RouteBounds positions={routeLine} />}
             <Marker position={position}>
               <Popup>Selected Location</Popup>
             </Marker>
             {pois.map((poi) => (
               <Marker key={poi.id} position={[poi.lat, poi.lon]}>
                 <Popup>
                   <strong>{poi.tags?.name || "Unnamed"}</strong><br/>
                   {poi.tags?.amenity || poi.tags?.tourism || poiCategory}
                 </Popup>
               </Marker>
             ))}
             {routeLine && <Polyline positions={routeLine} color="#3b82f6" weight={5} />}
           </MapContainer>
        </div>

        {/* Info & Booking Sidebar */}
        <div className="w-full md:w-1/3 flex flex-col gap-6 order-3">
           <div className="glass-card-solid rounded-xl p-5 border border-border/50">
                <h3 className="text-sm font-bold text-foreground mb-4 flex justify-between">
                  <span>Stay Budget Filter</span>
                  <span className="text-primary font-display">₹{maxBudget.toLocaleString()}</span>
                </h3>
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
                  <span>Mid-Range</span>
                  <span>Ultra-Luxury</span>
                </div>
           </div>

           {suggestedHotels.length > 0 && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h3 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                  <HotelIcon className="text-primary" /> Recommended Heritage Stays
                </h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                  {suggestedHotels.map((hotel, i) => (
                    <HotelCard key={i} {...hotel} />
                  ))}
                </div>
             </motion.div>
           )}

           {routingDist && (
             <div className="glass-card-solid rounded-xl p-6 border border-primary/20 bg-primary/5">
                <h3 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                   <Route /> Route Intelligence
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Distance:</span>
                  <span className="text-xl font-bold text-foreground">{routingDist}</span>
                </div>
                
                {/* Navigation Steps */}
                <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Turn-by-Turn</p>
                  {routeSteps.map((step, i) => (
                    <div key={i} className="flex gap-3 text-sm p-2 rounded-lg bg-background/50 border border-border/30">
                      <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</div>
                      <div className="flex-1">
                        <p className="text-foreground leading-tight">{step.instruction}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{step.distance}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-6 gradient-primary-bg border-0">
                  Enable GPS Voice Guidance
                </Button>
             </div>
           )}

           {!suggestedHotels.length && !routingDist && (
             <div className="glass-card-solid rounded-xl p-8 text-center border-dashed border-2 flex flex-col items-center justify-center h-full opacity-60">
                <LocationOn className="text-muted-foreground h-12 w-12 mb-4" />
                <p className="text-lg font-medium text-foreground">Plan Your Journey</p>
                <p className="text-sm text-muted-foreground">Enter a destination to see heritage stays and routes</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
