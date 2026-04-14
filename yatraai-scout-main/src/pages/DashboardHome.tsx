import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Map, 
  CameraAlt as Camera, 
  AccountBalanceWallet as Wallet, 
  Cloud, 
  SmartToy as Brain,
  EventNote,
  LocationOn,
  History,
  Help,
  KeyboardArrowDown
} from "@mui/icons-material";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const DashboardHome = () => {
  const { user } = useAuth();

  const stats = [
    { label: "Places Visited", value: "12", icon: Map, color: "text-blue-500" },
    { label: "Landmarks ID'd", value: "45", icon: Camera, color: "text-purple-500" },
    { label: "Active Routes", value: "3", icon: TrendingUp, color: "text-green-500" },
    { label: "Saved Stays", value: "8", icon: LocationOn, color: "text-orange-500" },
  ];

  const quickActions = [
    { title: "Identify Landmark", path: "/dashboard/landmark", icon: Camera, desc: "Scan physical monuments" },
    { title: "Plan a Route", path: "/dashboard/map", icon: Map, desc: "Explore heritage paths" },
    { title: "Chat with Scout", path: "/dashboard/scout", icon: Brain, desc: "AI travel companion" },
    { title: "Check Forecast", path: "/dashboard/weather", icon: Cloud, desc: "7-day weather intel" },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl gradient-hero-bg p-5 md:p-8 text-primary-foreground shadow-2xl"
      >
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl md:text-4xl font-display font-bold mb-3">
            Welcome back, {user?.displayName || "Explorer"}!
          </h1>
          <p className="text-primary-foreground/80 text-sm md:text-lg mb-5 leading-relaxed max-w-lg">
            Your intelligence-powered heritage journey continues. Explore, identify, and document India's finest landmarks with YatraAI Scout Pro.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/dashboard/map">
              <Button className="bg-white text-primary hover:bg-white/90 border-0 rounded-full px-8">
                Start Exploring
              </Button>
            </Link>
            <Link to="/dashboard/scout">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8">
                Ask Scout AI
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute right-[-5%] bottom-[-15%] opacity-10 hidden sm:block">
          <Brain style={{ fontSize: "220px" }} />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card-solid p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`p-2 rounded-lg bg-background w-fit mb-3 shadow-inner`}>
              <stat.icon className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <EventNote className="text-primary" /> Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <Link key={action.title} to={action.path}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card-solid p-5 rounded-2xl border border-border/50 flex items-start gap-4 hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <action.icon />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Travel Wisdom Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Help className="text-primary" /> Travel Wisdom
          </h2>
          <div className="glass-card-solid rounded-2xl p-2 border border-border/50">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="px-4 hover:no-underline">Best time for Heritage visits?</AccordionTrigger>
                <AccordionContent className="px-4 text-muted-foreground">
                  Early mornings (6 AM - 8 AM) are ideal for monuments like the Taj Mahal or Jaipur Forts to avoid crowds and catch the best lighting for photography.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-b-0">
                <AccordionTrigger className="px-4 hover:no-underline">Photography Guidelines</AccordionTrigger>
                <AccordionContent className="px-4 text-muted-foreground">
                  Most ASI monuments require a small fee for professional cameras. Tripods are generally not allowed without prior written permission.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-b-0">
                <AccordionTrigger className="px-4 hover:no-underline">Sustainability Tips</AccordionTrigger>
                <AccordionContent className="px-4 text-muted-foreground">
                  Carry a reusable water bottle. Many heritage sites now have eco-friendly filling stations to reduce plastic waste.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="glass-card-solid rounded-2xl p-6 border border-border/50 bg-accent/5">
             <h3 className="font-bold text-foreground mb-1">Pro Tip</h3>
             <p className="text-sm text-muted-foreground">Use the <b>Landmark ID</b> scanner even in low light—our AI is trained on high-contrast architectural features.</p>
          </div>
        </div>

        {/* Recent History */}
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <History className="text-primary" /> Recent Landmark ID
          </h2>
          <div className="glass-card-solid rounded-2xl p-6 border border-border/50 space-y-4 h-[300px] flex flex-col items-center justify-center text-center opacity-60">
             <Camera fontSize="large" className="text-muted-foreground mb-4" />
             <p className="text-sm font-medium">No Recent Scans</p>
             <p className="text-xs text-muted-foreground mt-1 px-4">Identify your first landmark to see its history here.</p>
             <Link to="/dashboard/landmark" className="mt-4">
                <Button variant="outline" size="sm" className="rounded-full">Start Scan</Button>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
