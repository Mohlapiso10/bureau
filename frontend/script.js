console.log("✅ script.js is successfully linked!");

const API_BASE_URL = 'http://localhost:5000/api';

// Show message with fallback to alert
function showMessage(msg, isSuccess = true) {
  const box = document.getElementById('message');
  if (box) {
    box.textContent = msg;
    box.style.color = isSuccess ? 'green' : 'red';
    box.style.display = 'block';
    setTimeout(() => {
      box.style.display = 'none';
      box.textContent = '';
    }, 3000);
  } else {
    alert(msg);
  }
}

// Register user
async function registerUser(event) {
  event.preventDefault();
  const fullName = document.getElementById('regFullName')?.value;
  const email = document.getElementById('regEmail')?.value;
  const password = document.getElementById('regPassword')?.value;
  const role = document.getElementById('regRole')?.value;

  console.log("📨 Registering user:", { fullName, email, password, role });

  if (!fullName || !email || !password || !role) {
    return showMessage('❌ Please fill in all fields.', false);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, role })
    });

    const data = await response.json();
    if (response.ok) {
      showMessage('✅ Registration successful! Please login.', true);
      document.getElementById('registerForm').reset();
      setTimeout(() => window.location.href = 'index.html', 2000);
    } else {
      showMessage(data.message || '❌ Registration failed.', false);
    }
  } catch (error) {
    console.error('❌ Error registering:', error);
    showMessage('❌ An error occurred during registration.', false);
  }
}

// Login user
async function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;

  console.log("🔐 Logging in with:", { email });

  if (!email || !password) {
    return showMessage('❌ Email and password are required.', false);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
      // Store token, user role, and userId in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);  
      localStorage.setItem('userId', data.user._id);

      showMessage('✅ Login successful!', true);

      // Redirect based on role
      setTimeout(() => {
        switch (data.user.role) {
          case 'borrower':
            window.location.href = 'borrower.html';
            break;
          case 'lender':
            window.location.href = 'lender.html';
            break;
          case 'admin':
            window.location.href = 'admin.html';
            break;
          default:
            showMessage('❌ Unknown role. Access denied.', false);
        }
      }, 1500);
    } else {
      showMessage(data.message || '❌ Login failed.', false);
    }
  } catch (error) {
    console.error('❌ Error logging in:', error);
    showMessage('❌ An error occurred during login.', false);
  }
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Get auth token
function getToken() {
  return localStorage.getItem('token');
}

// Role-based access guard
function checkAuth(role) {
  const token = getToken();
  const userRole = localStorage.getItem('userRole');
  if (!token || userRole !== role) {
    alert('Access denied. Please login.');
    window.location.href = 'index.html';
  }
}

// Submit loan application
async function submitLoanApplication(event) {
  event.preventDefault();
  const amount = document.getElementById('amount')?.value;
  const reason = document.getElementById('reason')?.value;

  if (!amount || !reason) {
    return showMessage('❌ All fields are required.', false);
  }

  try {
  const response = await fetch(`${API_BASE_URL}/loans/apply`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
     'Authorization': `Bearer ${localStorage.getItem('token')}` // ✅ Important
  },
  body: JSON.stringify({ amount, reason })
});

    const data = await response.json();
    if (response.ok) {
      showMessage('✅ Loan application submitted.', true);
      document.getElementById('loanForm').reset();
      fetchBorrowerLoans();
    } else {
      showMessage(data.message || '❌ Loan application failed.', false);
    }
  } catch (error) {
    console.error('❌ Loan application error:', error);
    showMessage('❌ An error occurred while applying for the loan.', false);
  }
}

// Fetch borrower's loans
async function fetchBorrowerLoans() {
  const token = getToken();
  const userId = localStorage.getItem('userId');

  try {
    const response = await fetch(`${API_BASE_URL}/loans/borrower/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const loans = await response.json();
    const container = document.getElementById('borrowerLoans');
    if (container && Array.isArray(loans)) {
      container.innerHTML = loans.length
        ? loans.map(loan => `
            <div class="loan-card">
              <p><strong>Amount:</strong> ${loan.amount}</p>
              <p><strong>Reason:</strong> ${loan.reason}</p>
              <p><strong>Status:</strong> ${loan.status}</p>
              <p><strong>Date:</strong> ${new Date(loan.createdAt).toLocaleString()}</p>
              <hr>
            </div>
          `).join('')
        : '<p>No loans yet.</p>';
    }
  } catch (error) {
    console.error('❌ Error fetching borrower loans:', error);
    showMessage('❌ Failed to fetch loans.', false);
  }
}

// Fetch all loans for lender
async function fetchLenderLoans() {
  const token = getToken();

  try {
    const response = await fetch(`${API_BASE_URL}/loans/lender`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const loans = await response.json();
    const container = document.getElementById('lenderLoans');
    if (container) {
      container.innerHTML = loans.map(loan => `
        <div>
          <p>Amount: ${loan.amount}</p>
          <p>Status: ${loan.status}</p>
          <p>Borrower ID: ${loan.borrower}</p>
          <button onclick="updateLoanStatus('${loan._id}', 'approved')">Approve</button>
          <button onclick="updateLoanStatus('${loan._id}', 'rejected')">Reject</button>
          <hr>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('❌ Error fetching lender loans:', error);
    showMessage('❌ Could not load lender loans.', false);
  }
}

// Update loan status
async function updateLoanStatus(loanId, status) {
  const token = getToken();
  if (!loanId || !status) return;

  const endpoint = `${API_BASE_URL}/loans/${loanId}/${status}`;

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (response.ok) {
      showMessage(`✅ Loan ${status}.`, true);
      fetchLenderLoans();
    } else {
      showMessage(data.message || '❌ Failed to update loan.', false);
    }
  } catch (error) {
    console.error('❌ Error updating loan status:', error);
    showMessage('❌ An error occurred while updating the loan.', false);
  }
}

// Event listeners on DOM load
document.addEventListener('DOMContentLoaded', () => {
  console.log("📦 DOM is fully loaded!");

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loanForm = document.getElementById('loanForm');
  const clickMeButton = document.getElementById('clickMe');

  if (loginForm) loginForm.addEventListener('submit', loginUser);
  if (registerForm) registerForm.addEventListener('submit', registerUser);
  if (loanForm) loanForm.addEventListener('submit', submitLoanApplication);
  if (clickMeButton) clickMeButton.addEventListener('click', () => alert("✅ Button clicked!"));
});
