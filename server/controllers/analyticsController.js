const Transaction = require('../models/Transaction');

// @desc    Get account aggregates
// @route   GET /api/analytics/accounts
// @access  Private
exports.getAccounts = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });

    // Calculate balances by account type
    const accountBalances = {
      checking: 0,
      saving: 0,
      investing: 0,
      cash: 0
    };

    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    let currentMonthBalance = 0;
    let lastMonthBalance = 0;

    transactions.forEach((transaction) => {
      const amount = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
      const accountType = transaction.accountType.toLowerCase();

      if (accountBalances.hasOwnProperty(accountType)) {
        accountBalances[accountType] += amount;
      }

      // Current month
      if (transaction.date >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)) {
        currentMonthBalance += amount;
      }

      // Last month
      if (transaction.date >= lastMonthDate && transaction.date < new Date(new Date().getFullYear(), new Date().getMonth(), 1)) {
        lastMonthBalance += amount;
      }
    });

    const totalBalance = Object.values(accountBalances).reduce((a, b) => a + b, 0);

    // Calculate percentage growth
    const percentageGrowth = lastMonthBalance !== 0
      ? ((currentMonthBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100
      : currentMonthBalance > 0 ? 100 : 0;

    res.status(200).json({
      success: true,
      totalBalance,
      accountBalances,
      percentageGrowth: parseFloat(percentageGrowth.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get timeline data for chart
// @route   GET /api/analytics/timeline
// @access  Private
exports.getTimeline = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query; // 'monthly' or 'weekly'

    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ date: 1 });

    let timelineData = [];

    if (period === 'monthly') {
      // Group by month
      const monthlyData = {};

      transactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }

        const amount = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
        monthlyData[monthKey] += amount;
      });

      // Convert to array and calculate cumulative balance
      let cumulativeBalance = 0;
      timelineData = Object.entries(monthlyData).map(([month, amount]) => {
        cumulativeBalance += amount;
        return {
          month,
          balance: cumulativeBalance,
          amount
        };
      });
    } else if (period === 'weekly') {
      // Group by week
      const weeklyData = {};

      transactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = 0;
        }

        const amount = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
        weeklyData[weekKey] += amount;
      });

      // Convert to array and calculate cumulative balance
      let cumulativeBalance = 0;
      timelineData = Object.entries(weeklyData).map(([week, amount]) => {
        cumulativeBalance += amount;
        return {
          week,
          balance: cumulativeBalance,
          amount
        };
      });
    }

    res.status(200).json({
      success: true,
      period,
      timelineData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get budget data for radar chart
// @route   GET /api/analytics/budget
// @access  Private
exports.getBudget = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id,
      type: 'expense'
    });

    const categoryExpenses = {
      Housing: 0,
      Food: 0,
      Bills: 0,
      Health: 0,
      Travel: 0,
      Shopping: 0,
      Savings: 0
    };

    transactions.forEach((transaction) => {
      if (categoryExpenses.hasOwnProperty(transaction.category)) {
        categoryExpenses[transaction.category] += transaction.amount;
      }
    });

    const totalExpenses = Object.values(categoryExpenses).reduce((a, b) => a + b, 0);

    // Convert to array with percentages
    const budgetData = Object.entries(categoryExpenses).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? parseFloat(((amount / totalExpenses) * 100).toFixed(2)) : 0
    }));

    res.status(200).json({
      success: true,
      totalExpenses,
      budgetData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get financial insights
// @route   GET /api/analytics/insights
// @access  Private
exports.getInsights = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });

    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    let totalIncome = 0;
    let totalExpense = 0;
    let totalSavings = 0;
    let currentMonthIncome = 0;
    let currentMonthExpense = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
        if (transaction.date >= currentMonthStart) {
          currentMonthIncome += transaction.amount;
        }
      } else if (transaction.type === 'expense') {
        totalExpense += transaction.amount;
        if (transaction.date >= currentMonthStart) {
          currentMonthExpense += transaction.amount;
        }
      } else if (transaction.type === 'saving') {
        totalSavings += transaction.amount;
      }
    });

    const netWorth = totalIncome - totalExpense + totalSavings;
    const savingRate = totalIncome > 0 ? parseFloat(((totalSavings / totalIncome) * 100).toFixed(2)) : 0;
    const spendingScore = calculateSpendingScore(totalIncome, totalExpense);

    // Generate financial advice
    const adviceChips = generateAdviceChips(totalIncome, totalExpense, totalSavings, savingRate);

    res.status(200).json({
      success: true,
      spendingScore,
      savingRate,
      netWorth,
      totalIncome,
      totalExpense,
      totalSavings,
      currentMonthIncome,
      currentMonthExpense,
      adviceChips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to calculate spending score (0-100)
const calculateSpendingScore = (income, expense) => {
  if (income === 0) return 0;
  const ratio = (expense / income) * 100;

  if (ratio < 30) return 95; // Excellent
  if (ratio < 50) return 82; // Very Good
  if (ratio < 70) return 65; // Good
  if (ratio < 90) return 45; // Fair
  return 20; // Poor
};

// Helper function to generate advice chips
const generateAdviceChips = (income, expense, savings, savingRate) => {
  const chips = [];

  if (savingRate < 10) {
    chips.push('Increase your savings rate by reducing discretionary spending');
  }

  if (savingRate >= 20) {
    chips.push('Great saving habits! Keep it up!');
  }

  const expenseRatio = income > 0 ? (expense / income) * 100 : 0;
  if (expenseRatio > 80) {
    chips.push('Your expenses are high relative to income');
  }

  if (income > expense * 2) {
    chips.push('You have excellent income to expense ratio');
  }

  if (chips.length === 0) {
    chips.push('Monitor your spending patterns regularly');
  }

  return chips;
};
