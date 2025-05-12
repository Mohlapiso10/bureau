const Loan = require('../models/Loan');
const User = require('../models/User');

// Example interest calculation logic
function calculateInterestRate(amount) {
  if (amount <= 1000) return 0.05;
  if (amount <= 5000) return 0.1;
  return 0.15;
}

// Apply for a loan
const applyForLoan = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const borrower = req.user;

    if (!amount || !reason) {
      return res.status(400).json({ error: 'Amount and term are required.' });
    }

    const interestRate = 10; // 10% interest
    const interest = (amount * interestRate) / 100;
    const totalPayable = amount + interest;

    const newLoan = new Loan({
      amount,
      reason,
      interestRate,
      totalPayable,
      status: 'Pending',
      borrowerId: borrower._id,
    });

    await newLoan.save();

    res.status(201).json({
      message: 'Loan application submitted successfully.',
      loan: newLoan
    });
  } catch (err) {
    console.error('Error applying for loan:', err);
    res.status(500).json({ error: 'Server error while applying for loan.' });
  }
};

// Get all loans (Lenders/Admin)
const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate('borrowerId', 'fullName email').lean();
    const result = loans.map(loan => ({
      ...loan,
      borrowerName: loan.borrowerId?.fullName || 'Unknown',
      borrowerEmail: loan.borrowerId?.email || 'N/A'
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching loans', error: err.message });
  }
};

// Get loans of a specific borrower
const getMyLoans = async (req, res) => {
  try {
    const borrowerId = req.params.id;
    const loans = await Loan.find({ borrowerId }).sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching your loans', error: err.message });
  }
};

// Approve a loan
const approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    res.json(loan);
  } catch (err) {
    res.status(500).json({ message: 'Error approving loan', error: err.message });
  }
};

// Reject a loan
const rejectLoan = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    res.json(loan);
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting loan', error: err.message });
  }
};

// Delete a loan
const deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndDelete(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    res.json({ message: 'Loan deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting loan', error: err.message });
  }
};

module.exports = {
  applyForLoan,
  getAllLoans,
  getMyLoans,
  approveLoan,
  rejectLoan,
  deleteLoan
};
