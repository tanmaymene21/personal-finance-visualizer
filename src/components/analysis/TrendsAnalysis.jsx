import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import BudgetOverview from './BudgetOverview';

export default function TrendsAnalysis({ monthlyExpenses, selectedYear }) {
  if (!monthlyExpenses?.length) return null;

  const currentMonth = new Date().toLocaleString('default', { month: 'short' });

  return (
    <div className="space-y-8">
      {/* Budget Overview */}
      <BudgetOverview
        monthlyExpenses={monthlyExpenses}
        selectedMonth={currentMonth}
        selectedYear={selectedYear}
      />

      {/* Monthly Expenses Chart */}
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
