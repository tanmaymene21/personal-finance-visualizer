'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import CategoryBudgetForm from '@/components/forms/CategoryBudgetForm';

export default function CategoryDetails({ params }) {
  const unwrappedParams = use(params);
  const categoryName = unwrappedParams.name;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryStats, setCategoryStats] = useState({
    totalAmount: 0,
    transactionCount: 0,
    categoryId: null,
  });
  const [budget, setBudget] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchBudget();
  }, [categoryName]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transactions');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        const categoryTransactions = data.filter(
          (t) =>
            t.transaction_type === 'expense' &&
            t.category_id.name === decodeURIComponent(categoryName),
        );

        setTransactions(categoryTransactions);
        if (categoryTransactions.length > 0) {
          setCategoryStats({
            totalAmount: categoryTransactions.reduce(
              (sum, t) => sum + Number(t.amount),
              0,
            ),
            transactionCount: categoryTransactions.length,
            categoryId: categoryTransactions[0].category_id._id,
          });
        }
      } else {
        setError('Invalid response format from server');
      }
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Transaction fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudget = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const res = await fetch(
        `/api/budgets?month=${currentMonth}&year=${currentYear}`,
      );
      const data = await res.json();

      const categoryBudget = data.find(
        (b) =>
          b.budget_type === 'category' &&
          b.category_id?.name === decodeURIComponent(categoryName),
      );
      setBudget(categoryBudget?.amount || null);
    } catch (error) {
      console.error('Failed to fetch budget:', error);
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;
  if (loading) return <div>Loading...</div>;

  const spentPercentage = budget
    ? (categoryStats.totalAmount / budget) * 100
    : 0;
  const isOverBudget = budget && categoryStats.totalAmount > budget;

  return (
    <div className="p-8 space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{decodeURIComponent(categoryName)} Overview</CardTitle>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {budget ? 'Update Budget' : 'Set Budget'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {budget && (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="stroke-muted"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    strokeWidth="8"
                  />
                  <circle
                    className={cn(
                      'transition-all duration-300',
                      isOverBudget ? 'stroke-destructive' : 'stroke-primary',
                    )}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${
                      Math.min(spentPercentage, 100) * 2.51
                    } 251.2`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-medium">
                    {spentPercentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div
                className={cn(
                  'text-lg font-semibold',
                  isOverBudget && 'text-destructive',
                )}
              >
                ₹{categoryStats.totalAmount.toLocaleString()} / ₹
                {budget.toLocaleString()}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Total Spent</div>
              <div className="text-2xl font-bold">
                ₹{categoryStats.totalAmount.toLocaleString()}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">
                Total Transactions
              </div>
              <div className="text-2xl font-bold">
                {categoryStats.transactionCount}
              </div>
            </div>
          </div>

          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-t">
                    <td className="py-3 px-4">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{transaction.description}</td>
                    <td className="py-3 px-4 text-right text-red-600">
                      ₹{transaction.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isFormOpen && (
        <CategoryBudgetForm
          categories={[
            {
              _id: categoryStats.categoryId,
              name: decodeURIComponent(categoryName),
            },
          ]}
          existingBudget={budget}
          onClose={() => setIsFormOpen(false)}
          onSubmit={() => {
            setIsFormOpen(false);
            fetchBudget();
          }}
        />
      )}
    </div>
  );
}
