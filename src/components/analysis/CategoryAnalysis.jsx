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
  const [activeCategory, setActiveCategory] = useState(null);

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

  if (!categoryData?.length || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-64 w-full max-w-2xl bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const budgetedCategories = categoryData.filter(
    (cat) => categoryBudgets[cat._id],
  );
  const nonBudgetedCategories = categoryData.filter(
    (cat) => !categoryBudgets[cat._id],
  );

  return (
    <div className="space-y-8 mx-auto px-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Categories
        </h2>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="transition-all hover:scale-105 hover:text-white rounded-full p-2.5"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Expense Distribution</CardTitle>
          <Button
            onClick={() => setIsBudgetFormOpen(true)}
            variant="outline"
            className="hover:bg-primary hover:text-white transition-colors"
          >
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
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary/80">
            Budgeted Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary/80">
            Non-Budgeted Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{category.name}</span>
          <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
            {category.count} transactions
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {budget ? (
          <>
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="stroke-muted"
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  strokeWidth="12"
                />
                <circle
                  className={cn(
                    'transition-all duration-700 ease-out',
                    isOverBudget ? 'stroke-destructive' : 'stroke-primary',
                  )}
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${
                    Math.min(spentPercentage, 100) * 3.51
                  } 351.2`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">
                  {spentPercentage.toFixed(0)}%
                </span>
                <span className="text-sm text-muted-foreground">spent</span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <div className="text-sm text-muted-foreground">Budget Status</div>
              <span
                className={cn(
                  'text-lg font-semibold',
                  isOverBudget ? 'text-destructive' : 'text-primary',
                )}
              >
                ₹{category.amount.toLocaleString()} / ₹{budget.toLocaleString()}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center space-y-2">
            <span className="text-sm text-muted-foreground">Total Spent</span>
            <div className="text-2xl font-bold text-primary">
              ₹{category.amount.toLocaleString()}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
          onClick={() => window.open(`/category/${category.name}`, '_blank')}
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
