'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, PieChart, ArrowRight, Wallet } from 'lucide-react';
import TrendsAnalysis from '@/components/analysis/TrendsAnalysis';
import CategoryAnalysis from '@/components/analysis/CategoryAnalysis';
import TransactionForm from '@/components/forms/TransactionForm';
import { useRouter } from 'next/navigation';
import Accounts from '@/components/tabs/Accounts';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('trends');
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedYear] = useState(new Date().getFullYear());
  const router = useRouter();
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
    // Process for monthly trends
    processTrends(transactions);
    // Process for category analysis
    processCategories(transactions);
  };

  const processTrends = (transactions) => {
    // Process for monthly trends
    processTrends(transactions);
    // Process for category analysis
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

  if (error) return <div className="text-red-500">{error}</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Analysis Type Selector */}
      {/* Analysis Type Selector */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Button
            variant={activeView === 'trends' ? 'default' : 'outline'}
            onClick={() => setActiveView('trends')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Trends
          </Button>
          <Button
            variant={activeView === 'categories' ? 'default' : 'outline'}
            onClick={() => setActiveView('categories')}
          >
            <PieChart className="w-4 h-4 mr-2" />
            Categories
          </Button>
          <Button
            variant={activeView === 'accounts' ? 'default' : 'outline'}
            onClick={() => setActiveView('accounts')}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Accounts
          </Button>
        </div>
      </div>

      {/* Analysis View */}
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

      {/* Recent Transactions */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Transactions</h2>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/transactions')}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              View All
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>
        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((transaction) => (
                <tr key={transaction._id} className="border-t">
                  <td className="py-3 px-4">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">{transaction.category_id.name}</td>
                  <td className="py-3 px-4">{transaction.description}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={
                        transaction.transaction_type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {transaction.transaction_type === 'income' ? '+' : '-'}₹
                      {Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {isFormOpen && (
        <TransactionForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={() => {
            setIsFormOpen(false);
            fetchTransactions();
          }}
        />
      )}
      {/* Transaction Form Modal */}
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
