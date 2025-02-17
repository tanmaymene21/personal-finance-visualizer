'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TransactionForm({ transaction, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    transaction_type: 'expense',
    category_id: '',
    amount: '',
    description: '',
    account: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch accounts and categories
    const fetchData = async () => {
      try {
        const [accountsRes, categoriesRes] = await Promise.all([
          fetch('/api/accounts'),
          fetch('/api/categories'),
        ]);
        const [accountsData, categoriesData] = await Promise.all([
          accountsRes.json(),
          categoriesRes.json(),
        ]);
        setAccounts(accountsData);
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      }
    };

    // If editing, populate form with transaction data
    if (transaction) {
      setFormData({
        ...transaction,
        category_id: transaction.category_id._id,
        account: transaction.account._id,
        date: new Date(transaction.date).toISOString().split('T')[0],
      });
    }

    fetchData();
  }, [transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = transaction
        ? `/api/transactions/${transaction._id}`
        : '/api/transactions';

      const res = await fetch(url, {
        method: transaction ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save transaction');

      onSubmit();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-background p-6 rounded-lg w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <h3 className="text-lg font-semibold mb-4">
          {transaction ? 'Edit Transaction' : 'New Transaction'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Type</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.transaction_type}
              onChange={(e) =>
                setFormData({ ...formData, transaction_type: e.target.value })
              }
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Category</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Account</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.account}
              onChange={(e) =>
                setFormData({ ...formData, account: e.target.value })
              }
              required
            >
              <option value="">Select Account</option>
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Amount</label>
            <input
              type="number"
              step="0.01"
              className="w-full p-2 border rounded"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Description</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : transaction ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
