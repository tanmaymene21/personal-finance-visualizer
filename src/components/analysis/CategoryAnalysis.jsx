import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import CategoryBudgetForm from '../forms/CategoryBudgetForm';
import CategoryForm from '@/components/forms/CategoryForm';

export default function CategoryAnalysis({ categoryData }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryBudgets();
  }, []);

  const fetchCategoryBudgets = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const res = await fetch(
        `/api/budgets?month=${currentMonth}&year=${currentYear}`,
      );
      const data = await res.json();

      const budgets = data.reduce((acc, budget) => {
        if (budget.budget_type === 'category' && budget.category_id) {
          acc[budget.category_id._id] = budget.amount;
        }
        return acc;
      }, {});

      setCategoryBudgets(budgets);
    } catch (error) {
      console.error('Failed to fetch category budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!categoryData?.length || loading) return null;

  const budgetedCategories = categoryData.filter(
    (cat) => categoryBudgets[cat._id],
  );
  const nonBudgetedCategories = categoryData.filter(
    (cat) => !categoryBudgets[cat._id],
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Expense Distribution</CardTitle>
          <Button onClick={() => setIsBudgetFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Set Category Budget
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={2}
                >
                  {categoryData.map((entry, index) => (
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

      {budgetedCategories.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Budgeted Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetedCategories.map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
                budget={categoryBudgets[category._id]}
              />
            ))}
          </div>
        </div>
      )}

      {nonBudgetedCategories.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Non-Budgeted Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nonBudgetedCategories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        </div>
      )}

      {isFormOpen && (
        <CategoryForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={() => {
            setIsFormOpen(false);
            fetchCategoryBudgets();
          }}
        />
      )}

      {isBudgetFormOpen && (
        <CategoryBudgetForm
          categories={categoryData}
          onClose={() => setIsBudgetFormOpen(false)}
          onSubmit={() => {
            setIsBudgetFormOpen(false);
            fetchCategoryBudgets();
          }}
        />
      )}
    </div>
  );
}

function CategoryCard({ category, budget }) {
  const spentPercentage = budget ? (category.amount / budget) * 100 : 0;
  const isOverBudget = budget && category.amount > budget;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{category.name}</span>
          <span className="text-sm font-normal px-2 py-1 bg-muted rounded-full">
            {category.count} transactions
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budget ? (
          <>
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="stroke-muted"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  strokeWidth="8"
                />
                <circle
                  className={cn(
                    'transition-all duration-300',
                    isOverBudget ? 'stroke-destructive' : 'stroke-primary',
                  )}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${
                    Math.min(spentPercentage, 100) * 2.51
                  } 251.2`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-medium">
                  {spentPercentage.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="text-center">
              <span
                className={cn(
                  'font-semibold',
                  isOverBudget && 'text-destructive',
                )}
              >
                ₹{category.amount.toLocaleString()} / ₹{budget.toLocaleString()}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center font-semibold">
            ₹{category.amount.toLocaleString()}
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(`/category/${category.name}`, '_blank')}
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
