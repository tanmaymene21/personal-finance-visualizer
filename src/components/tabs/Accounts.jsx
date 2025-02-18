import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AccountForm from '@/components/forms/AccountForm';
import AccountCard from '@/components/AccountCard';
import AccountDistribution from '@/components/analysis/AccountDistribution';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const [accountsRes, transactionsRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/transactions'),
      ]);

      if (!accountsRes.ok || !transactionsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [accountsData, transactionsData] = await Promise.all([
        accountsRes.json(),
        transactionsRes.json(),
      ]);

      setAccounts(accountsData);
      setTransactions(transactionsData);
    } catch (err) {
      setError('Failed to fetch accounts');
      console.error('Account fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (error) return <div className="text-red-500">{error}</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Accounts</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      <AccountDistribution accounts={accounts} transactions={transactions} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account._id}
            account={account}
            transactions={transactions}
            onUpdate={fetchAccounts}
          />
        ))}
      </div>

      {isFormOpen && (
        <AccountForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={() => {
            setIsFormOpen(false);
            fetchAccounts();
          }}
        />
      )}
    </div>
  );
}
