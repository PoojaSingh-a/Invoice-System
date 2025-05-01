const API_BASE_URL = "http://localhost:3000/api";

// Register form handling
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirmPassword").value;
    const errorEl = document.getElementById("registerError");
    const successEl = document.getElementById("registerSuccess");
    errorEl.classList.add("hidden");
    successEl.classList.add("hidden");

    if (password !== confirmPassword) {
      errorEl.textContent = "Passwords do not match.";
      errorEl.classList.remove("hidden");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        errorEl.textContent = data.message || "Registration failed.";
        errorEl.classList.remove("hidden");
        return;
      }
      successEl.textContent = "Registration successful! You can now login.";
      successEl.classList.remove("hidden");
      registerForm.reset();
    } catch (error) {
      errorEl.textContent = "Error connecting to server.";
      errorEl.classList.remove("hidden");
    }
  });
}

// Login form handling
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errorEl = document.getElementById("loginError");
    errorEl.classList.add("hidden");

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        errorEl.textContent = data.message || "Login failed.";
        errorEl.classList.remove("hidden");
        return;
      }
      // Save token to localStorage
      localStorage.setItem("authToken", data.token);
      // Redirect to dashboard
      window.location.href = "dashboard.html";
    } catch (error) {
      errorEl.textContent = "Error connecting to server.";
      errorEl.classList.remove("hidden");
    }
  });
}

// Dashboard logout handling
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("authToken");
    window.location.href = "index.html";
  });
}

// Protect dashboard page
if (window.location.pathname.endsWith("dashboard.html")) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "index.html";
  }
}
