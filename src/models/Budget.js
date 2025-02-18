import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      // Not required for overall budget
    },
    budget_type: {
      type: String,
      required: true,
      enum: ['overall', 'category'],
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

// Compound index to ensure unique budgets per user, month, year, and category/overall
BudgetSchema.index(
  {
    user_id: 1,
    month: 1,
    year: 1,
    category_id: 1,
    budget_type: 1,
  },
  { unique: true },
);

export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);
