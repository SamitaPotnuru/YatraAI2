import { motion, AnimatePresence } from "framer-motion";
import { Star, LocationOn, CheckCircle, Hotel, CalendarMonth, Person, CreditCard } from "@mui/icons-material";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface HotelProps {
  name: string;
  rating: number;
  price: string;
  image: string;
  location: string;
  description: string;
}

const HotelCard = ({ name, rating, price, image, location, description }: HotelProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "confirm" | "booked">("form");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [cardNum, setCardNum] = useState("");
  const { toast } = useToast();

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
      : 0;
  const totalCost = nights * parseInt(price.replace(/,/g, ""));

  const handleConfirm = () => {
    if (!checkIn || !checkOut || nights < 1) {
      toast({ title: "Invalid dates", description: "Please select valid check-in and check-out dates.", variant: "destructive" });
      return;
    }
    setStep("confirm");
  };

  const handlePay = () => {
    if (cardNum.length < 16) {
      toast({ title: "Invalid card", description: "Enter a 16-digit card number.", variant: "destructive" });
      return;
    }
    setStep("booked");
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => { setStep("form"); setCheckIn(""); setCheckOut(""); setGuests("1"); setCardNum(""); }, 400);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card-solid rounded-xl overflow-hidden flex flex-col md:flex-row gap-4 border border-border/50 hover:shadow-xl transition-all group"
      >
        <div className="w-full md:w-32 h-32 shrink-0 overflow-hidden">
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="flex-1 p-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-display font-bold text-foreground text-sm uppercase tracking-tight">{name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} fontSize="inherit" className={i < rating ? "text-yellow-500" : "text-muted"} />
                ))}
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-primary">₹{price}</span>
              <p className="text-[10px] text-muted-foreground uppercase">per night</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <LocationOn fontSize="inherit" /> {location}
            </span>
            <Button size="sm" className="h-7 px-3 text-[10px] gradient-primary-bg border-0" onClick={() => setOpen(true)}>
              Book Now
            </Button>
          </div>
        </div>
      </motion.div>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
          <div className="gradient-hero-bg p-6 text-primary-foreground">
            <DialogHeader>
              <DialogTitle className="text-primary-foreground font-display text-xl flex items-center gap-2">
                <Hotel /> {name}
              </DialogTitle>
              <p className="text-primary-foreground/70 text-sm mt-1">{location}</p>
            </DialogHeader>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === "form" && (
                <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1"><CalendarMonth fontSize="inherit" /> Check-In</label>
                      <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="bg-muted/40 border-0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1"><CalendarMonth fontSize="inherit" /> Check-Out</label>
                      <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="bg-muted/40 border-0" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1"><Person fontSize="inherit" /> Guests</label>
                    <select value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full h-10 rounded-md px-3 text-sm bg-muted/40 border border-border text-foreground">
                      {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>)}
                    </select>
                  </div>
                  {nights > 0 && (
                    <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-primary/5 border border-primary/20">
                      <span className="text-sm text-muted-foreground">{nights} night{nights > 1 ? "s" : ""} × ₹{price}</span>
                      <span className="font-bold text-primary text-lg">₹{totalCost.toLocaleString()}</span>
                    </div>
                  )}
                  <Button onClick={handleConfirm} className="w-full gradient-primary-bg border-0">Continue to Payment</Button>
                </motion.div>
              )}

              {step === "confirm" && (
                <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="rounded-xl bg-muted/40 p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Hotel</span><span className="font-medium">{name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Check-In</span><span className="font-medium">{checkIn}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Check-Out</span><span className="font-medium">{checkOut}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span className="font-medium">{guests}</span></div>
                    <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="font-bold">Total</span><span className="font-bold text-primary text-base">₹{totalCost.toLocaleString()}</span></div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1"><CreditCard fontSize="inherit" /> Card Number (Demo)</label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      maxLength={16}
                      value={cardNum}
                      onChange={(e) => setCardNum(e.target.value.replace(/\D/g, ""))}
                      className="bg-muted/40 border-0 tracking-widest font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>Back</Button>
                    <Button onClick={handlePay} className="flex-1 gradient-primary-bg border-0">Pay ₹{totalCost.toLocaleString()}</Button>
                  </div>
                </motion.div>
              )}

              {step === "booked" && (
                <motion.div key="booked" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
                    <CheckCircle style={{ fontSize: 64 }} className="text-green-500 mx-auto" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-foreground">Booking Confirmed!</h3>
                    <p className="text-sm text-muted-foreground mt-1">Your stay at <span className="text-foreground font-semibold">{name}</span> is reserved.</p>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-4 text-sm text-left space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Booking ID</span><span className="font-mono font-bold">YAI-{Math.floor(100000 + Math.random() * 900000)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span>{checkIn} → {checkOut}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Amount Paid</span><span className="text-green-600 font-bold">₹{totalCost.toLocaleString()}</span></div>
                  </div>
                  <Button onClick={handleClose} className="w-full gradient-primary-bg border-0">Done</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HotelCard;
