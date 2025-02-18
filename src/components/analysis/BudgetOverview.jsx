import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // Fetch budget data
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        setIsLoading(true);
        const monthNum = new Date(`${selectedMonth} 1`).getMonth() + 1;
        const res = await fetch(
          `/api/budgets?month=${monthNum}&year=${selectedYear}`,
        );
        const data = await res.json();

        // Find overall budget
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

  // Calculate expenses
  useEffect(() => {
    const currentMonthExpense = monthlyExpenses.find(
      (expense) => expense.month === selectedMonth,
    );
    setTotalSpent(currentMonthExpense?.amount || 0);
  }, [monthlyExpenses, selectedMonth]);

  // Save budget to database
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
      // Add error handling UI feedback here
    }
  };

  // Calculate budget metrics
  const isOverBudget = budget && totalSpent > budget;
  const spentPercentage = budget ? (totalSpent / budget) * 100 : 0;
  const displayPercentage = isOverBudget
    ? spentPercentage
    : Math.min(spentPercentage, 100);

  // Calculate days remaining
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = lastDayOfMonth - today.getDate();

  const remaining = budget ? Math.max(budget - totalSpent, 0) : 0;
  const safeToSpendPerDay = remaining / (daysRemaining || 1);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-pulse">Loading budget data...</div>
        </CardContent>
      </Card>
    );
  }

  // Show prompt if no budget is set
  if (!budget && !isEditing) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            No monthly budget set
          </p>
          <Button onClick={() => setIsEditing(true)}>Set Budget</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Budget Edit Form */}
          {isEditing && (
            <div className="w-full max-w-xs space-y-2">
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                placeholder="Enter budget amount"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveBudget}>
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* Circular Progress with Hover Effect */}
          <div
            className="relative w-48 h-48 group cursor-pointer"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => !isEditing && setIsEditing(true)}
          >
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                className="stroke-muted"
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                className={cn(
                  'transition-all duration-300',
                  isOverBudget ? 'stroke-destructive' : 'stroke-primary',
                  isHovering && 'opacity-80',
                )}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(displayPercentage * 251.2) / 100} 251.2`}
                transform="rotate(-90 50 50)"
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">
                ₹{totalSpent.toLocaleString()}
              </span>
              <span
                className={cn(
                  'text-sm',
                  isOverBudget
                    ? 'text-destructive font-medium'
                    : 'text-muted-foreground',
                )}
              >
                {spentPercentage.toFixed(0)}%{' '}
                {isOverBudget ? 'overspent' : 'spent'}
              </span>
            </div>

            {/* Hover Edit Indicator */}
            {isHovering && !isEditing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
                <Pencil className="w-6 h-6 text-primary" />
              </div>
            )}
          </div>

          {/* Budget Details */}
          <div className="w-full grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 border rounded-lg">
              <div className="text-sm text-muted-foreground">Budget</div>
              <div className="font-semibold">
                ₹{budget?.toLocaleString() || 'N/A'}
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-sm text-muted-foreground">Remaining</div>
              <div
                className={cn(
                  'font-semibold',
                  isOverBudget && 'text-destructive',
                )}
              >
                {isOverBudget ? '-' : ''}₹
                {Math.abs(budget - totalSpent).toLocaleString()}
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-sm text-muted-foreground">
                Safe to Spend/Day
              </div>
              <div className="font-semibold">
                ₹{safeToSpendPerDay.toFixed(0).toLocaleString()}
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-sm text-muted-foreground">
                Days Remaining
              </div>
              <div className="font-semibold">{daysRemaining}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
