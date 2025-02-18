import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

export default function AccountDistribution({ accounts, transactions }) {
  const accountBalances = accounts.map((account) => {
    const accountTransactions = transactions.filter(
      (t) => t.account._id === account._id,
    );

    const balance = accountTransactions.reduce((total, transaction) => {
      const amount = Number(transaction.amount);
      if (transaction.transaction_type === 'income') {
        return total + amount;
      } else if (transaction.transaction_type === 'expense') {
        return total - amount;
      }
      return total;
    }, 0);

    return {
      name: account.name,
      value: Math.max(balance, 0), // Only show positive balances in chart
      color: `hsl(var(--chart-${(accounts.indexOf(account) % 5) + 1}))`,
    };
  });

  if (accountBalances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">You Spend more than you Earn</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={accountBalances}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={2}
              >
                {accountBalances.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `₹${value.toLocaleString()}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
