import { useState } from "react";
import { auth } from "@/integrations/firebase/config";
import { sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";
import { motion } from "framer-motion";
import { Email as Mail, ArrowForward as ArrowRight, ArrowBack as ArrowLeft, Lock } from "@mui/icons-material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const oobCode = searchParams.get("oobCode"); // Firebase recovery code

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Email sent!", description: "Check your inbox for the reset link." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast({ title: "Password updated!", description: "You can now sign in with your new password." });
      navigate("/login");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero-bg p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-primary-foreground mb-2">
            {oobCode ? "Set New Password" : "Reset Password"}
          </h1>
        </div>

        {oobCode ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="relative">
              <Lock fontSize="small" className="absolute left-3 top-3 text-primary-foreground/50" />
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-primary-bg text-primary-foreground border-0">
              {loading ? "Updating..." : "Update Password"} <ArrowRight fontSize="small" className="ml-2" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSendReset} className="space-y-4">
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
            <Button type="submit" disabled={loading} className="w-full gradient-primary-bg text-primary-foreground border-0">
              {loading ? "Sending..." : "Send Reset Link"} <ArrowRight fontSize="small" className="ml-2" />
            </Button>
          </form>
        )}

        <Link to="/login" className="flex items-center justify-center mt-6 text-sm text-primary-foreground/60 hover:text-primary-foreground">
          <ArrowLeft fontSize="small" className="mr-2" /> Back to Login
        </Link>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
