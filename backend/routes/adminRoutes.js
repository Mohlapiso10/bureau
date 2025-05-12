// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// GET all users
router.get('/users', adminController.getAllUsers);

// GET all loans
router.get('/loans', adminController.getAllLoans);

// GET admin report
router.get('/report', adminController.report);

module.exports = router;
