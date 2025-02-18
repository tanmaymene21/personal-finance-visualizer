'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CategoryDetails({ params }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryStats, setCategoryStats] = useState({
    totalAmount: 0,
    transactionCount: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, [params.name]);

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
            t.category_id.name === decodeURIComponent(params.name),
        );

        setTransactions(categoryTransactions);
        setCategoryStats({
          totalAmount: categoryTransactions.reduce(
            (sum, t) => sum + Number(t.amount),
            0,
          ),
          transactionCount: categoryTransactions.length,
        });
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

  if (error) return <div className="text-red-500">{error}</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{decodeURIComponent(params.name)} Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
    </div>
  );
}
