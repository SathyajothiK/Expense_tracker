const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a transaction title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    merchant: {
      type: String,
      required: [true, 'Please provide a merchant name'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0, 'Amount cannot be negative']
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'saving'],
      required: [true, 'Please specify transaction type'],
      lowercase: true
    },
    category: {
      type: String,
      enum: ['Housing', 'Food', 'Bills', 'Health', 'Travel', 'Shopping', 'Savings'],
      required: [true, 'Please select a category']
    },
    accountType: {
      type: String,
      enum: ['checking', 'saving', 'investing', 'cash'],
      required: [true, 'Please specify account type'],
      lowercase: true
    },
    date: {
      type: Date,
      required: [true, 'Please provide a transaction date'],
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for faster queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, accountType: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
