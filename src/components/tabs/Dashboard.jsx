'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  TrendingUp,
  PieChart,
  ArrowRight,
  Wallet,
  Loader2,
} from 'lucide-react';
import TrendsAnalysis from '@/components/analysis/TrendsAnalysis';
import CategoryAnalysis from '@/components/analysis/CategoryAnalysis';
import TransactionForm from '@/components/forms/TransactionForm';
import { useRouter } from 'next/navigation';
import Accounts from '@/components/tabs/Accounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('trends');
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedYear] = useState(new Date().getFullYear());
  const router = useRouter();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transactions');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setTransactions(data);
        processTransactions(data);
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

  const processTransactions = (transactions) => {
    processTrends(transactions);
    processCategories(transactions);
  };

  const processTrends = (transactions) => {
    const monthlyTotals = {};
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(selectedYear, i, 1);
      return date.toLocaleString('default', { month: 'short' });
    });

    months.forEach((month) => {
      monthlyTotals[month] = 0;
    });

    transactions.forEach((transaction) => {
      if (transaction.transaction_type === 'expense') {
        const date = new Date(transaction.date);
        const transactionYear = date.getFullYear();
        if (transactionYear === selectedYear) {
          const month = date.toLocaleString('default', { month: 'short' });
          monthlyTotals[month] += Number(transaction.amount);
        }
      }
    });

    const chartData = Object.entries(monthlyTotals).map(([month, amount]) => ({
      month,
      amount,
    }));

    setMonthlyExpenses(chartData);
  };

  const processCategories = (transactions) => {
    const categories = {};

    transactions
      .filter((t) => t.transaction_type === 'expense')
      .forEach((transaction) => {
        const categoryId = transaction.category_id._id;
        if (!categories[categoryId]) {
          categories[categoryId] = {
            _id: categoryId,
            name: transaction.category_id.name,
            amount: 0,
            count: 0,
            transactions: [],
          };
        }
        categories[categoryId].amount += Number(transaction.amount);
        categories[categoryId].count += 1;
        categories[categoryId].transactions.push(transaction);
      });

    const processedData = Object.values(categories)
      .sort((a, b) => b.amount - a.amount)
      .map((category, index) => ({
        ...category,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      }));

    setCategoryData(processedData);
  };

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5 animate-in fade-in">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={fetchTransactions}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }

  const totalIncome = transactions
    .filter((t) => t.transaction_type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="overflow-hidden relative">
          <div className="absolute top-0 right-0 w-16 h-16 -mt-6 -mr-6 bg-primary/10 rounded-full blur-xl"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">
                ₹{totalIncome.toLocaleString()}
              </span>
              <Badge
                variant="outline"
                className="ml-2 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900"
              >
                +
                {
                  transactions.filter((t) => t.transaction_type === 'income')
                    .length
                }{' '}
                transactions
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative">
          <div className="absolute top-0 right-0 w-16 h-16 -mt-6 -mr-7 bg-red-500/10 rounded-full blur-xl"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                ₹{totalExpense.toLocaleString()}
              </span>
              <Badge
                variant="outline"
                className="ml-2 bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900"
              >
                -
                {
                  transactions.filter((t) => t.transaction_type === 'expense')
                    .length
                }{' '}
                transactions
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative">
          <div className="absolute top-0 right-0 w-16 h-16 -mt-6 -mr-6 bg-blue-500/10 rounded-full blur-xl"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span
                className={`text-3xl font-bold ${
                  balance >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                ₹{Math.abs(balance).toLocaleString()}
              </span>
              <span className="ml-1 text-lg">{balance >= 0 ? '' : '-'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-secondary/30 rounded-lg p-1.5 inline-flex">
        <Button
          variant={activeView === 'trends' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('trends')}
          className={`gap-2 ${
            activeView === 'trends' ? '' : 'hover:bg-secondary'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Trends
        </Button>
        <Button
          variant={activeView === 'categories' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('categories')}
          className={`gap-2 ${
            activeView === 'categories' ? '' : 'hover:bg-secondary'
          }`}
        >
          <PieChart className="w-4 h-4" />
          Categories
        </Button>
        <Button
          variant={activeView === 'accounts' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('accounts')}
          className={`gap-2 ${
            activeView === 'accounts' ? '' : 'hover:bg-secondary'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Accounts
        </Button>
      </div>

      <Card className="border-t-4 border-t-primary shadow-sm">
        <CardContent className="pt-6">
          {activeView === 'trends' ? (
            <TrendsAnalysis
              monthlyExpenses={monthlyExpenses}
              selectedYear={selectedYear}
            />
          ) : activeView === 'categories' ? (
            <CategoryAnalysis categoryData={categoryData} />
          ) : (
            <Accounts />
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3">
          <CardTitle className="text-xl font-semibold">
            Recent Transactions
          </CardTitle>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/transactions')}
              className="h-9 w-full xs:w-auto"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 opacity-70" />
            </Button>
            <Button
              size="sm"
              onClick={() => setIsFormOpen(true)}
              className="h-9 w-full xs:w-auto"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Transaction
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-center border border-dashed rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">No transactions yet</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4 max-w-md px-4">
                Start tracking your finances by adding your first transaction
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="py-3 px-4 text-left font-medium text-muted-foreground text-sm">
                      Date
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-muted-foreground text-sm">
                      Category
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-muted-foreground text-sm">
                      Description
                    </th>
                    <th className="py-3 px-4 text-right font-medium text-muted-foreground text-sm">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((transaction, idx) => (
                    <tr
                      key={transaction._id}
                      className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${
                        idx % 2 === 0 ? 'bg-muted/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-sm whitespace-nowrap">
                        {new Date(transaction.date).toLocaleDateString(
                          undefined,
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          },
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: `hsl(var(--chart-${
                                (idx % 5) + 1
                              }))`,
                            }}
                          ></div>
                          {transaction.category_id.name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm max-w-xs truncate">
                        {transaction.description}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-medium whitespace-nowrap">
                        <span
                          className={
                            transaction.transaction_type === 'income'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }
                        >
                          {transaction.transaction_type === 'income'
                            ? '+'
                            : '-'}
                          ₹{Math.abs(transaction.amount).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isFormOpen && (
        <TransactionForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={() => {
            setIsFormOpen(false);
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
}
