const User = require('../models/User');
const Loan = require('../models/Loan');

// ✅ Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// ✅ Get all loans (admin only)
const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate('borrowerId', 'fullName email');
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
};

// ✅ Admin report generation (e.g., stats)
const report = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const loanCount = await Loan.countDocuments();
    const totalAmount = await Loan.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      users: userCount,
      loans: loanCount,
      totalLoanedAmount: totalAmount[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

module.exports = {
  getAllUsers,
  getAllLoans,
  report
};
