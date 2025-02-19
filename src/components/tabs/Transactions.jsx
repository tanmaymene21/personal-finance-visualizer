'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import TransactionForm from '@/components/forms/TransactionForm';

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
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setTransactions(data);
      else if (data.error) setError(data.error);
      else setError('Invalid response format from server');
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Transaction fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) setTransactions(transactions.filter((t) => t._id !== id));
    } catch (err) {
      setError('Failed to delete transaction');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 bg-red-50 px-6 py-4 rounded-lg shadow-sm">
          {error}
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );

  return (
    <Card className="mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-2xl font-bold">Transactions</CardTitle>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center p-2.5 sm:px-4 sm:py-2 rounded-full sm:rounded-md"
        >
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Transaction</span>
        </Button>
      </CardHeader>

      <CardContent>
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-600">
                    Date
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-600">
                    Type
                  </th>
                  <th className="hidden md:table-cell py-4 px-4 text-left text-sm font-medium text-gray-600">
                    Category
                  </th>
                  <th className="hidden lg:table-cell py-4 px-4 text-left text-sm font-medium text-gray-600">
                    Account
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-600">
                    Description
                  </th>
                  <th className="py-4 px-4 text-right text-sm font-medium text-gray-600">
                    Amount
                  </th>
                  <th className="py-4 px-4 text-center text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="group hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-4 px-4 text-sm">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      {transaction.transaction_type === 'income' ? (
                        <div className="flex items-center space-x-1">
                          <ArrowUpCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs font-medium text-green-700">
                            Income
                          </span>
                        </div>
                      ) : transaction.transaction_type === 'expense' ? (
                        <div className="flex items-center space-x-1">
                          <ArrowDownCircle className="w-4 h-4 text-red-500" />
                          <span className="text-xs font-medium text-red-700">
                            Expense
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <RefreshCw className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-medium text-blue-700">
                            Transfer
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="hidden md:table-cell py-4 px-4 text-sm text-gray-600">
                      {transaction.category_id.name}
                    </td>
                    <td className="hidden lg:table-cell py-4 px-4 text-sm text-gray-600">
                      {transaction.account.name}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {transaction.description}
                    </td>
                    <td className="py-4 px-4 text-right text-sm font-medium">
                      <span
                        className={`
                          ${
                            transaction.transaction_type === 'income'
                              ? 'text-green-600'
                              : ''
                          }
                          ${
                            transaction.transaction_type === 'expense'
                              ? 'text-red-600'
                              : ''
                          }
                        `}
                      >
                        {transaction.transaction_type === 'income' ? '+' : '-'}₹
                        {Math.abs(transaction.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="transition-colors duration-200 hover:text-blue-600 hover:bg-blue-50"
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
                          className="transition-colors duration-200 hover:text-red-600 hover:bg-red-50"
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
        </div>
      </CardContent>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
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
        </div>
      )}
    </Card>
  );
}
