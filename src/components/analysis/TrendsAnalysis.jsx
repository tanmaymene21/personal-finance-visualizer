import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import BudgetOverview from './BudgetOverview';

export default function TrendsAnalysis({ monthlyExpenses, selectedYear }) {
  if (!monthlyExpenses?.length) return null;

  const currentMonth = new Date().toLocaleString('default', { month: 'short' });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <motion.div
        className="lg:col-span-1"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <BudgetOverview
          monthlyExpenses={monthlyExpenses}
          selectedMonth={currentMonth}
          selectedYear={selectedYear}
        />
      </motion.div>

      <motion.div
        className="lg:col-span-2"
        initial={{ x: 20 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-background to-secondary/30 h-full">
          <CardHeader className="border-b border-border/50 bg-secondary/20 backdrop-blur-sm">
            <CardTitle className="text-xl font-semibold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-chart-3 to-chart-1">
                Monthly Expenses ({selectedYear})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[400px]">
            <motion.div
              className="h-full w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyExpenses}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'var(--muted-foreground)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--muted-foreground)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                    tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => `₹${value.toLocaleString()}`}
                    labelFormatter={(label) => [`${label}`, 'Expenses']}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: 'var(--foreground)' }}
                    labelStyle={{ fontWeight: 'bold', color: 'var(--foreground)' }}
                    cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
                  />
                  <Bar
                    dataKey="amount"
                    radius={[4, 4, 0, 0]}
                    fill="url(#colorAmount)"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
