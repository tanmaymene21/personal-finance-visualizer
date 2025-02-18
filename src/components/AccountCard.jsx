import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import AccountForm from './forms/AccountForm';

export default function AccountCard({ account, transactions, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);

  const accountTransactions = transactions.filter(
    (t) => t.account._id === account._id,
  );

  const balances = accountTransactions.reduce(
    (acc, transaction) => {
      const amount = Number(transaction.amount);
      switch (transaction.transaction_type) {
        case 'income':
          acc.income += amount;
          acc.balance += amount;
          break;
        case 'expense':
          acc.expense += amount;
          acc.balance -= amount;
          break;
        case 'transfer':
          acc.transfers += amount;
          break;
      }
      return acc;
    },
    { income: 0, expense: 0, transfers: 0, balance: 0 },
  );

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      const res = await fetch(`/api/accounts/${account._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">
            {account.name}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={deleteAccount}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground capitalize mb-4">
            {account.type}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Balance</div>
              <div className="font-semibold">
                ₹{balances.balance.toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Income</div>
              <div className="font-semibold text-green-600">
                ₹{balances.income.toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Expenses</div>
              <div className="font-semibold text-red-600">
                ₹{balances.expense.toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Transfers</div>
              <div className="font-semibold text-blue-600">
                ₹{balances.transfers.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <AccountForm
          account={account}
          onClose={() => setIsEditing(false)}
          onSubmit={() => {
            setIsEditing(false);
            onUpdate();
          }}
        />
      )}
    </>
  );
}
