import { motion } from "framer-motion";
import { AccountBalanceWallet as Wallet, Add as Plus, Delete as Trash2, Edit } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/integrations/firebase/config";
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, orderBy, updateDoc } from "firebase/firestore";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  createdAt: any;
}

const categories = [
  { value: "stay", label: "🏨 Stay", color: "#3b82f6" },
  { value: "food", label: "🍽️ Food", color: "#10b981" },
  { value: "transport", label: "🚗 Transport", color: "#f59e0b" },
  { value: "activities", label: "🎭 Activities", color: "#8b5cf6" },
  { value: "other", label: "📦 Other", color: "#ef4444" },
];

const BudgetPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [category, setCategory] = useState("food");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Firebase Firestore Listener
    const q = query(
      collection(db, "expenses"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      setExpenses(docs);
    }, (error) => {
      console.error(error);
    });

    return () => unsubscribe();
  }, [user]);

  const addExpense = async () => {
    if (!amount || !user) return;
    try {
      await addDoc(collection(db, "expenses"), {
        userId: user.uid,
        category,
        amount: parseFloat(amount),
        description: description || null,
        createdAt: new Date(),
      });
      setAmount("");
      setDescription("");
      toast({ title: "Expense Added", description: `Added ₹${amount} for ${category}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, "expenses", id));
      if (editingId === id) cancelEdit();
      toast({ title: "Deleted", description: "Expense removed successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setCategory(expense.category);
    setAmount(expense.amount.toString());
    setDescription(expense.description || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCategory("food");
    setAmount("");
    setDescription("");
  };

  const updateExpense = async () => {
    if (!amount || !user || !editingId) return;
    try {
      await updateDoc(doc(db, "expenses", editingId), {
        category,
        amount: parseFloat(amount),
        description: description || null,
      });
      cancelEdit();
      toast({ title: "Expense Updated", description: "Productive change! Your record is updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const byCategory = categories.map((c) => ({
    ...c,
    total: expenses.filter((e) => e.category === c.value).reduce((s, e) => s + Number(e.amount), 0),
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
          <Wallet fontSize="large" className="text-accent" /> Smart Budget Planner
        </h1>
        <p className="text-muted-foreground mb-8">Track and visualize your travel expenses with Firebase Sync</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card-solid rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {editingId ? "Edit Expense" : "Add Expense"}
            </h2>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      category === c.value ? "gradient-primary-bg text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <Input type="number" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
              <div className="flex gap-2">
                {editingId && (
                  <Button variant="outline" onClick={cancelEdit} className="w-1/3">
                    Cancel
                  </Button>
                )}
                <Button 
                  onClick={editingId ? updateExpense : addExpense} 
                  className={`${editingId ? "w-2/3" : "w-full"} gradient-primary-bg text-primary-foreground border-0`}
                >
                  {editingId ? <Edit fontSize="small" className="mr-2" /> : <Plus fontSize="small" className="mr-2" />}
                  {editingId ? "Update Expense" : "Add Expense"}
                </Button>
              </div>
            </div>
          </div>

          <div className="glass-card-solid rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Summary</h2>
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-foreground">₹{total.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>

            <div className="w-full flex justify-center mt-4">
              <div className="w-48 h-48">
                {total > 0 ? (
                  <Doughnut 
                    data={{
                      labels: byCategory.filter(c => c.total > 0).map(c => c.label),
                      datasets: [{
                        data: byCategory.filter(c => c.total > 0).map(c => c.total),
                        backgroundColor: byCategory.filter(c => c.total > 0).map(c => c.color),
                        borderWidth: 0,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '65%',
                      plugins: { legend: { display: false } }
                    }} 
                  />
                ) : (
                  <div className="w-full h-full rounded-full border-8 border-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No Data</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3 mt-6">
              {byCategory.filter((c) => c.total > 0).map((c) => (
                <div key={c.value}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></span>
                      {c.label}
                    </span>
                    <span className="text-muted-foreground">₹{c.total.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {expenses.length > 0 && (
          <div className="glass-card-solid rounded-2xl p-6 mt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Expenses</h2>
            <div className="space-y-2">
              {expenses.map((e) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {categories.find((c) => c.value === e.category)?.label} — ₹{Number(e.amount).toLocaleString()}
                    </span>
                    {e.description && <p className="text-xs text-muted-foreground">{e.description}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(e)}>
                      <Edit fontSize="small" className="text-muted-foreground hover:text-accent" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteExpense(e.id)}>
                      <Trash2 fontSize="small" className="text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BudgetPage;
