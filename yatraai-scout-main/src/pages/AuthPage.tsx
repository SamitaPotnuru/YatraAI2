import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "@/integrations/firebase/config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { motion } from "framer-motion";
import { Email as Mail, Lock, Person as User, ArrowForward as ArrowRight, Visibility as Eye, VisibilityOff as EyeOff } from "@mui/icons-material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const AuthPage = ({ mode }: { mode: "login" | "signup" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
        toast({ title: "Account created!", description: "Welcome to YatraAI Scout Pro." });
        navigate("/dashboard");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Logged in!", description: "Ready to explore." });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      toast({ title: "Auth Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast({ title: "Signed in with Google!", description: "Welcome to YatraAI Scout Pro." });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Google Sign-In Failed", description: error.message, variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero-bg p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card rounded-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-primary-foreground mb-2">
            {mode === "login" ? "Welcome Back" : "Join YatraAI"}
          </h1>
          <p className="text-primary-foreground/70 text-sm">
            {mode === "login" ? "Sign in to continue your journey" : "Start your intelligent travel experience"}
          </p>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-primary-foreground/20 bg-white/10 hover:bg-white/20 text-primary-foreground text-sm font-semibold transition-all mb-5 disabled:opacity-60"
        >
          <GoogleIcon />
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-primary-foreground/20" />
          <span className="text-xs text-primary-foreground/50 uppercase tracking-widest font-medium">or</span>
          <div className="flex-1 h-px bg-primary-foreground/20" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="relative">
              <User fontSize="small" className="absolute left-3 top-3 text-primary-foreground/50" />
              <Input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail fontSize="small" className="absolute left-3 top-3 text-primary-foreground/50" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
              required
            />
          </div>

          <div className="relative">
            <Lock fontSize="small" className="absolute left-3 top-3 text-primary-foreground/50" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-primary-foreground/50 hover:text-primary-foreground"
            >
              {showPassword ? <EyeOff fontSize="small" /> : <Eye fontSize="small" />}
            </button>
          </div>

          {mode === "login" && (
            <div className="text-right">
              <Link to="/reset-password" className="text-xs text-primary-foreground/60 hover:text-primary-foreground">
                Forgot password?
              </Link>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary-bg text-primary-foreground border-0 hover:opacity-90 transition-opacity"
          >
            {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
            <ArrowRight fontSize="small" className="ml-2" />
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-primary-foreground/60">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <Link
            to={mode === "login" ? "/signup" : "/login"}
            className="text-primary-foreground font-medium hover:underline"
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
