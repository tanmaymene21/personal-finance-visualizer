'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Dashboard() {
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    currentMonth: 0,
    average: 0,
    highest: 0,
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, [selectedYear]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transactions');
      const transactions = await res.json();
      processTransactions(transactions);
    } catch (err) {
      setError('Failed to fetch expenses data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get all available years from transactions
  // Sort descending
  // Create an object to store monthly totals
  // Initialize all months for the selected year with 0
  // Convert to array format for Recharts
  // Calculate totals for each month in the selected year
  // Calculate summary statistics for the selected year
  const processTransactions = (transactions) => {
    const years = [
      ...new Set(transactions.map((t) => new Date(t.date).getFullYear())),
    ];
    setAvailableYears(years.sort((a, b) => b - a));

    const monthlyTotals = {};

    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(selectedYear, i, 1);
      return date.toLocaleString('default', {
        month: 'short',
      });
    });

    months.forEach((month) => {
      monthlyTotals[month] = 0;
    });

    transactions.forEach((transaction) => {
      if (transaction.transaction_type === 'expense') {
        const date = new Date(transaction.date);
        const transactionYear = date.getFullYear();
        console.log(date, transactionYear, selectedYear);

        if (transactionYear === selectedYear) {
          console.log('hello');
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

    const amounts = Object.values(monthlyTotals);
    setSummary({
      currentMonth:
        monthlyTotals[
          new Date().toLocaleString('default', { month: 'short' })
        ] || 0,
      average: amounts.reduce((a, b) => a + b, 0) / amounts.length,
      highest: Math.max(...amounts),
    });
  };

  const handleYearChange = (year) => {
    setSelectedYear(Number(year));
  };

  if (error) return <div className="text-red-500">{error}</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Select
          value={selectedYear.toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              This Month's Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              &#8377;{summary.currentMonth.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              &#8377;{summary.average.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Highest Monthly Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              &#8377;{summary.highest.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses ({selectedYear})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString()}`,
                    'Expenses',
                  ]}
                  labelStyle={{ color: 'black' }}
                />
                <Bar
                  dataKey="amount"
                  fill="rgb(239, 68, 68)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
