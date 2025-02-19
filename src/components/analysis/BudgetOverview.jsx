import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function BudgetOverview({
  monthlyExpenses,
  selectedMonth,
  selectedYear,
}) {
  const [budget, setBudget] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [totalSpent, setTotalSpent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        setIsLoading(true);
        const monthNum = new Date(`${selectedMonth} 1`).getMonth() + 1;
        const res = await fetch(
          `/api/budgets?month=${monthNum}&year=${selectedYear}`,
        );
        const data = await res.json();
        const overallBudget = data.find((b) => b.budget_type === 'overall');
        setBudget(overallBudget?.amount || null);
        setNewBudget(overallBudget?.amount || '');
      } catch (error) {
        console.error('Failed to fetch budget:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudget();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const currentMonthExpense = monthlyExpenses.find(
      (expense) => expense.month === selectedMonth,
    );
    setTotalSpent(currentMonthExpense?.amount || 0);
  }, [monthlyExpenses, selectedMonth]);

  const handleSaveBudget = async () => {
    try {
      const monthNum = new Date(`${selectedMonth} 1`).getMonth() + 1;
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget_type: 'overall',
          amount: Number(newBudget),
          month: monthNum,
          year: selectedYear,
        }),
      });

      if (!res.ok) throw new Error('Failed to save budget');

      const data = await res.json();
      setBudget(data.amount);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save budget:', error);
    }
  };

  const isOverBudget = budget && totalSpent > budget;
  const spentPercentage = budget ? (totalSpent / budget) * 100 : 0;
  const displayPercentage = isOverBudget
    ? spentPercentage
    : Math.min(spentPercentage, 100);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = lastDayOfMonth - today.getDate();

  const remaining = budget ? Math.max(budget - totalSpent, 0) : 0;
  const safeToSpendPerDay = remaining / (daysRemaining || 1);

  if (isLoading) {
    return (
      <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-background to-secondary/30">
        <CardContent className="flex items-center justify-center h-48 p-6">
          <motion.div
            className="text-primary flex items-center space-x-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading budget data...</span>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  if (!budget && !isEditing) {
    return (
      <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-background to-secondary/30">
        <CardContent className="flex flex-col items-center justify-center h-48 space-y-4 p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle className="w-12 h-12 text-primary opacity-80" />
          </motion.div>
          <motion.p
            className="text-muted-foreground text-center font-medium"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            No monthly budget set for {selectedMonth} {selectedYear}
          </motion.p>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-primary/90 hover:bg-primary transition-all shadow-md hover:shadow-lg"
            >
              Set Budget
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-background to-secondary/30">
      <CardHeader className="border-b border-border/50 bg-secondary/20 backdrop-blur-sm">
        <CardTitle className="flex items-center text-xl font-semibold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-chart-3">
            {selectedMonth} {selectedYear} Budget
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-6">
          <AnimatePresence mode="wait">
            {isEditing && (
              <motion.div
                className="w-full max-w-xs space-y-3"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full p-2 pl-8 border rounded-md bg-background shadow-sm focus:ring-2 focus:ring-primary/40 transition-all"
                    placeholder="Enter budget amount"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="border-border/50 hover:bg-secondary transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveBudget}
                    className="bg-primary/90 hover:bg-primary transition-all shadow-sm hover:shadow-md"
                  >
                    Save Budget
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="relative w-48 h-48 group cursor-pointer"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => !isEditing && setIsEditing(true)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <svg className="w-full h-full drop-shadow-md" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isOverBudget ? "var(--destructive)" : "var(--chart-2)"} />
                  <stop offset="100%" stopColor={isOverBudget ? "var(--destructive)" : "var(--primary)"} />
                </linearGradient>
              </defs>
              <circle
                className="stroke-muted/50"
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="8"
              />
              <motion.circle
                className={cn(
                  'transition-all duration-500',
                  isHovering && 'filter drop-shadow-md'
                )}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                stroke="url(#progressGradient)"
                initial={{ strokeDasharray: '0 251.2' }}
                animate={{
                  strokeDasharray: `${(displayPercentage * 251.2) / 100} 251.2`,
                  transition: { duration: 1, ease: "easeOut" }
                }}
                transform="rotate(-90 50 50)"
              />
            </svg>

            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                ₹{totalSpent.toLocaleString()}
              </span>
              <span
                className={cn(
                  'text-sm mt-1 font-medium',
                  isOverBudget
                    ? 'text-destructive'
                    : 'text-primary'
                )}
              >
                {spentPercentage.toFixed(0)}%{' '}
                {isOverBudget ? 'overspent' : 'spent'}
              </span>
            </motion.div>

            {isHovering && !isEditing && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Pencil className="w-8 h-8 text-primary drop-shadow-md" />
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.div
              className="p-4 border border-border/40 rounded-lg bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              <div className="text-sm text-muted-foreground">Total Budget</div>
              <div className="font-semibold text-xl mt-1 flex items-baseline">
                <span className="mr-1">₹</span>
                {budget?.toLocaleString() || 'N/A'}
              </div>
            </motion.div>
            <motion.div
              className="p-4 border border-border/40 rounded-lg bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              <div className="text-sm text-muted-foreground">Remaining</div>
              <div
                className={cn(
                  'font-semibold text-xl mt-1 flex items-baseline',
                  isOverBudget ? 'text-destructive' : 'text-chart-2'
                )}
              >
                <span className={cn(
                  'mr-1',
                  isOverBudget ? 'text-destructive' : 'text-chart-2'
                )}>
                  {isOverBudget ? '-₹' : '₹'}
                </span>
                {Math.abs(budget - totalSpent).toLocaleString()}
              </div>
            </motion.div>
            <motion.div
              className="p-4 border border-border/40 rounded-lg bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              <div className="text-sm text-muted-foreground">Safe to Spend/Day</div>
              <div className="font-semibold text-xl mt-1 flex items-baseline">
                <span className="mr-1">₹</span>
                {safeToSpendPerDay.toFixed(0).toLocaleString()}
              </div>
            </motion.div>
            <motion.div
              className="p-4 border border-border/40 rounded-lg bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              <div className="text-sm text-muted-foreground">Days Remaining</div>
              <div className="font-semibold text-xl mt-1">{daysRemaining}</div>
            </motion.div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
