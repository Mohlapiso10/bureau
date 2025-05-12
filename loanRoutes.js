const express = require('express');
const router = express.Router();

const {
  applyForLoan,
  getAllLoans,
  getMyLoans,
  approveLoan,
  rejectLoan,
  deleteLoan
} = require('../controllers/loanController');

const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Loan routes
router.post('/apply', verifyToken, applyForLoan);
router.get('/all', verifyToken, isAdmin, getAllLoans);
router.get('/borrower/:id', verifyToken, getMyLoans);
router.put('/approve/:id', verifyToken, isAdmin, approveLoan);
router.put('/reject/:id', verifyToken, isAdmin, rejectLoan);
router.delete('/delete/:id', verifyToken, isAdmin, deleteLoan);

module.exports = router;
