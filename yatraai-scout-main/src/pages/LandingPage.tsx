import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowForward as ArrowRight, Map, SmartToy as Brain, AccountBalanceWallet as Wallet, People as Users, Cloud, CameraAlt as Camera, WbSunny as Sun, DarkMode as Moon } from "@mui/icons-material";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import heroImage from "@/assets/hero-travel.jpg";

const features = [
  { icon: Camera, title: "AI Landmark ID", desc: "Upload photos to identify monuments instantly" },
  { icon: Map, title: "Interactive Maps", desc: "Real-time routing with GPS and nearby explorer" },
  { icon: Brain, title: "Scout AI Assistant", desc: "AI-powered travel tips and historical facts" },
  { icon: Wallet, title: "Budget Planner", desc: "Track expenses with beautiful charts" },
  { icon: Users, title: "Travel Buddy", desc: "AI-matched companions for your journey" },
  { icon: Cloud, title: "Weather Intel", desc: "7-day forecast for any destination" },
];

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-display font-bold gradient-text">YatraAI Scout Pro</span>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors">
              {theme === "dark" ? <Sun fontSize="small" className="text-foreground" /> : <Moon fontSize="small" className="text-foreground" />}
            </button>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-foreground">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gradient-primary-bg text-primary-foreground border-0">
                Get Started <ArrowRight fontSize="small" className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Ancient Indian temples at sunset" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        </div>
        <div className="container mx-auto px-6 relative z-10 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 rounded-full glass-card text-xs font-medium text-foreground mb-6">
              ✨ AI-Powered Travel Companion
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              <span className="text-foreground">Explore India</span>
              <br />
              <span className="gradient-text">Like Never Before</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Your intelligent travel companion that identifies landmarks, plans budgets, finds travel buddies, and guides you with AI-powered insights.
            </p>
            <div className="flex gap-4">
              <Link to="/signup">
                <Button size="lg" className="gradient-primary-bg text-primary-foreground border-0 text-base px-8">
                  Start Exploring <ArrowRight fontSize="small" className="ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="text-base border-foreground/20 text-foreground hover:bg-foreground/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Six powerful features designed to make every trip unforgettable
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card-solid rounded-xl p-6 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="gradient-hero-bg rounded-3xl p-12 md:p-16 text-center"
          >
            <h2 className="text-4xl font-display font-bold text-primary-foreground mb-4">Ready to Scout?</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">
              Join thousands of travelers using AI to discover India's hidden gems.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-primary-foreground text-primary border-0 hover:bg-primary-foreground/90 text-base px-8">
                Create Free Account <ArrowRight fontSize="small" className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © 2026 YatraAI Scout Pro. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
