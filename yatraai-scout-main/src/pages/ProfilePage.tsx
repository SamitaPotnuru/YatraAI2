import { motion } from "framer-motion";
import { 
  Person, 
  Settings, 
  Security, 
  Notifications, 
  History, 
  CreditCard,
  Edit,
  Verified,
  DirectionsRun as Steps,
  Favorite as Heart,
  Whatshot as Calories
} from "@mui/icons-material";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "firebase/auth";

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName });
      toast({ title: "Profile updated!", description: "Your display name has been saved." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: Person },
    { id: "fitness", label: "Fitness Tracking", icon: Steps },
    { id: "security", label: "Security", icon: Security },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Notifications },
  ];
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full gradient-primary-bg flex items-center justify-center text-4xl text-primary-foreground shadow-xl border-4 border-background">
              {displayName.charAt(0) || user?.email?.charAt(0) || "?"}
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-background border border-border shadow-lg hover:scale-110 transition-transform">
              <Edit fontSize="small" className="text-muted-foreground" />
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
              {displayName || "User"} <Verified fontSize="small" className="text-blue-500" />
            </h1>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Pro Intelligence</span>
              <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">Verified Account</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Sidebar Tabs */}
          <div className="md:col-span-1">
            <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 md:space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <tab.icon fontSize="small" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="md:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card-solid rounded-2xl p-8 border border-border/50 shadow-sm"
            >
              {activeTab === "personal" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">Account Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Display Name</label>
                      <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-muted/50 border-0" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Login Email</label>
                      <Input value={user?.email || ""} disabled className="bg-muted/50 border-0 opacity-60" />
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button onClick={handleUpdate} disabled={loading} className="gradient-primary-bg border-0 px-8">
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-foreground border-b border-border pb-4">Security Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                      <div>
                        <p className="font-bold text-sm">Update Password</p>
                        <p className="text-xs text-muted-foreground">Change your security credentials</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                      <div>
                        <p className="font-bold text-sm">Two-Factor Authentication</p>
                        <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "fitness" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <h2 className="text-xl font-bold text-foreground">Fitness Activity</h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">Pro Tracking Live</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Step Counter Card */}
                    <div className="bg-muted/30 p-6 rounded-2xl border border-border/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <Steps fontSize="small" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase">Step Counter</p>
                            <p className="text-2xl font-bold text-foreground">7,542</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-primary">75%</p>
                          <p className="text-[10px] text-muted-foreground uppercase">of 10k Target</p>
                        </div>
                      </div>
                      <Progress value={75} className="h-2 bg-muted transition-all" />
                      <p className="text-[10px] text-muted-foreground italic text-center">"2,458 steps left to reach your daily travel goal!"</p>
                    </div>

                    {/* Heart Rate Card */}
                    <div className="bg-muted/30 p-6 rounded-2xl border border-border/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                            <motion.div
                              animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [1, 0.8, 1] 
                              }}
                              transition={{ 
                                duration: 0.8, 
                                repeat: Infinity,
                                ease: "easeInOut" 
                              }}
                            >
                              <Heart fontSize="small" />
                            </motion.div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase">Heart Rate</p>
                            <p className="text-2xl font-bold text-foreground">72 <span className="text-sm font-medium text-muted-foreground">BPM</span></p>
                          </div>
                        </div>
                        <div className="h-12 w-20 flex items-end gap-0.5">
                          {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              className="w-full bg-red-500/30 rounded-t-sm"
                              transition={{ 
                                duration: 1, 
                                delay: i * 0.1, 
                                repeat: Infinity, 
                                repeatType: "reverse" 
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic text-center pt-2">Resting heart rate is optimal for v2.0 sync.</p>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="p-4 rounded-xl bg-muted/20 text-center">
                      <Calories className="text-orange-500 mb-1 mx-auto" fontSize="small" />
                      <p className="text-lg font-bold">320</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Calories</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/20 text-center">
                      <Steps className="text-blue-500 mb-1 mx-auto" fontSize="small" />
                      <p className="text-lg font-bold">4.2 <span className="text-xs">km</span></p>
                      <p className="text-[10px] text-muted-foreground uppercase">Distance</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/20 text-center text-muted-foreground opacity-50">
                      <Settings className="mb-1 mx-auto" fontSize="small" />
                      <p className="text-[10px] uppercase font-bold">More coming</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/20 text-center text-muted-foreground opacity-50">
                      <Settings className="mb-1 mx-auto" fontSize="small" />
                      <p className="text-[10px] uppercase font-bold">Pro Features</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab !== "personal" && activeTab !== "security" && activeTab !== "fitness" && (
                <div className="py-12 text-center opacity-40">
                  <Settings fontSize="large" className="mx-auto mb-2" />
                  <p className="text-sm">Advanced {activeTab} settings coming soon in v2.0</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
