import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function CategoryBudgetForm({
  categories,
  onClose,
  onSubmit,
  existingBudget,
}) {
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log(categories);

  useEffect(() => {
    if (existingBudget) {
      setFormData({
        category_id: categories[0]._id,
        amount: existingBudget.toString(),
      });
    } else if (categories.length === 1) {
      setFormData((prev) => ({
        ...prev,
        category_id: categories[0]._id,
      }));
    }
  }, [existingBudget, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget_type: 'category',
          category_id: formData.category_id,
          amount: Number(formData.amount),
          month: currentMonth,
          year: currentYear,
        }),
      });

      if (!res.ok) throw new Error('Failed to save budget');

      onSubmit();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <CardHeader>
          <CardTitle>
            {existingBudget ? 'Update Category Budget' : 'Set Category Budget'}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                required
                disabled={categories.length === 1}
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
              <label className="text-sm font-medium">Budget Amount</label>
              <input
                type="number"
                className="w-full p-2 border rounded-md bg-background"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="Enter amount"
                required
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? 'Saving...'
                  : existingBudget
                  ? 'Update Budget'
                  : 'Save Budget'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
