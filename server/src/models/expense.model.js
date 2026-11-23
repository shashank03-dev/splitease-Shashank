import mongoose from 'mongoose'

const MAX_DESCRIPTION_LENGTH = 200

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      maxlength: [
        MAX_DESCRIPTION_LENGTH,
        `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters.`,
      ],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required.'],
      min: [0.01, 'Amount must be greater than 0.'],
      validate: {
        validator: Number.isFinite,
        message: 'Amount must be a finite number.',
      },
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'paidBy is required.'],
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Matches the list query: newest expense first, with a stable tie-breaker.
expenseSchema.index({ date: -1, createdAt: -1 })

const Expense = mongoose.model('Expense', expenseSchema)

export default Expense
export { MAX_DESCRIPTION_LENGTH }
