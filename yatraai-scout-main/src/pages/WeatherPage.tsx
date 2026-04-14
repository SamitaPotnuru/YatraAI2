import { motion, AnimatePresence } from "framer-motion";
import { Cloud, WaterDrop as Droplets, Air as Wind, Thermostat as Thermometer, Search } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface WeatherData {
  temperature: number;
  windspeed: number;
  humidity: number;
  description: string;
  daily: { day: string; high: number; low: number; icon: string }[];
}

const WeatherPage = () => {
  const [city, setCity] = useState("Delhi");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`
      );
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        setCity(result.name);
        if (!cities[result.name]) {
          fetchWeather(result.latitude, result.longitude);
        }
        setSearchQuery("");
      } else {
        toast.error("City not found. Please try another name.");
      }
    } catch (error) {
      toast.error("Failed to search city. Check your connection.");
    } finally {
      setIsSearching(false);
    }
  };

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
      );
      const data = await res.json();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      setWeather({
        temperature: data.current.temperature_2m,
        windspeed: data.current.wind_speed_10m,
        humidity: data.current.relative_humidity_2m,
        description: getWeatherDesc(data.current.weather_code),
        daily: data.daily.time.slice(0, 7).map((t: string, i: number) => ({
          day: days[new Date(t).getDay()],
          high: data.daily.temperature_2m_max[i],
          low: data.daily.temperature_2m_min[i],
          icon: getWeatherEmoji(data.daily.weather_code[i]),
        })),
      });
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const cities: Record<string, [number, number]> = {
    Delhi: [28.6139, 77.209],
    Mumbai: [19.076, 72.8777],
    Jaipur: [26.9124, 75.7873],
    Goa: [15.2993, 74.124],
    Kolkata: [22.5726, 88.3639],
    Chennai: [13.0827, 80.2707],
  };

  useEffect(() => {
    const coords = cities[city];
    if (coords) fetchWeather(coords[0], coords[1]);
  }, [city]);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
          <Cloud fontSize="large" className="text-accent" /> Weather Intelligence
        </h1>
        <p className="text-muted-foreground mb-8">Real-time weather data powered by Open-Meteo</p>

        <form onSubmit={handleSearch} className="relative mb-8 max-w-md group">
          <Input
            type="text"
            placeholder="Search for a city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-card-solid border-white/10 focus:border-accent/50 transition-all pl-10 h-12 bg-black/20 backdrop-blur-md rounded-xl"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" fontSize="small" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-accent/20 hover:bg-accent/40 text-accent rounded-lg text-xs font-medium transition-all backdrop-blur-sm"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-6">
          {Object.keys(cities).map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                city === c ? "gradient-primary-bg text-primary-foreground" : "glass-card-solid text-foreground hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="glass-card-solid rounded-2xl p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : weather ? (
          <div className="space-y-6">
            <div className="glass-card-solid rounded-2xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{city}</h2>
                  <p className="text-muted-foreground text-sm">{weather.description}</p>
                </div>
                <span className="text-5xl font-bold text-foreground">{Math.round(weather.temperature)}°C</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Thermometer fontSize="small" className="text-accent" />
                  <span className="text-sm text-muted-foreground">Feels {Math.round(weather.temperature)}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind fontSize="small" className="text-primary" />
                  <span className="text-sm text-muted-foreground">{weather.windspeed} km/h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets fontSize="small" className="text-secondary" />
                  <span className="text-sm text-muted-foreground">{weather.humidity}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weather.daily.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card-solid rounded-xl p-3 text-center"
                >
                  <p className="text-xs font-medium text-muted-foreground">{d.day}</p>
                  <p className="text-xl my-1">{d.icon}</p>
                  <p className="text-sm font-semibold text-foreground">{Math.round(d.high)}°</p>
                  <p className="text-xs text-muted-foreground">{Math.round(d.low)}°</p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
};

function getWeatherDesc(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  return "Stormy";
}

function getWeatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  return "⛈️";
}

export default WeatherPage;
