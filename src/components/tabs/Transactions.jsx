'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TransactionForm from '@/components/TransactionForm';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTransactions(transactions.filter((t) => t._id !== id));
      }
    } catch (err) {
      setError('Failed to delete transaction');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (error) return <div className="text-red-500">{error}</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Account</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id} className="border-t">
                <td className="py-3 px-4">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      transaction.transaction_type === 'income'
                        ? 'bg-green-100 text-green-800'
                        : transaction.transaction_type === 'expense'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {transaction.transaction_type}
                  </span>
                </td>
                <td className="py-3 px-4">{transaction.category_id.name}</td>
                <td className="py-3 px-4">{transaction.account.name}</td>
                <td className="py-3 px-4">{transaction.description}</td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={
                      transaction.transaction_type === 'income'
                        ? 'text-green-600'
                        : transaction.transaction_type === 'expense'
                        ? 'text-red-600'
                        : ''
                    }
                  >
                    {transaction.transaction_type === 'income' ? '+' : '-'}₹
                    {Math.abs(transaction.amount).toLocaleString()}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTransaction(transaction);
                        setIsFormOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTransaction(transaction._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <TransactionForm
              transaction={editingTransaction}
              onClose={() => {
                setIsFormOpen(false);
                setEditingTransaction(null);
              }}
              onSubmit={() => {
                setIsFormOpen(false);
                setEditingTransaction(null);
                fetchTransactions();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
