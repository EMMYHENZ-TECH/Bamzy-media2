document.addEventListener("DOMContentLoaded", () => {
  // Toggle between login and register forms
  const loginForm = document.querySelector(".login-form")
  const registerForm = document.querySelector(".register-form")
  const showRegisterBtn = document.getElementById("showRegister")
  const showLoginBtn = document.getElementById("showLogin")

  if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", (e) => {
      e.preventDefault()
      loginForm.style.display = "none"
      registerForm.style.display = "block"
    })
  }

  if (showLoginBtn) {
    showLoginBtn.addEventListener("click", (e) => {
      e.preventDefault()
      registerForm.style.display = "none"
      loginForm.style.display = "block"
    })
  }

  // Handle login form submission
  const loginFormElement = document.getElementById("loginForm")
  if (loginFormElement) {
    loginFormElement.addEventListener("submit", (e) => {
      e.preventDefault()

      const email = document.getElementById("email").value
      const password = document.getElementById("password").value

      // Simple validation
      if (!email || !password) {
        alert("Please fill in all fields")
        return
      }

      // Send login request to server
      fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Store user data in localStorage
            localStorage.setItem("user", JSON.stringify(data.user))
            localStorage.setItem("token", data.token)

            // Redirect based on user role
            if (data.user.role === "admin") {
              window.location.href = "/admin.html"
            } else {
              window.location.href = "/dashboard.html"
            }
          } else {
            alert(data.message || "Login failed. Please check your credentials.")
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          alert("An error occurred. Please try again.")
        })
    })
  }

  // Handle register form submission
  const registerFormElement = document.getElementById("registerForm")
  if (registerFormElement) {
    registerFormElement.addEventListener("submit", (e) => {
      e.preventDefault()

      const name = document.getElementById("regName").value
      const email = document.getElementById("regEmail").value
      const password = document.getElementById("regPassword").value
      const confirmPassword = document.getElementById("regConfirmPassword").value

      // Simple validation
      if (!name || !email || !password || !confirmPassword) {
        alert("Please fill in all fields")
        return
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match")
        return
      }

      // Send register request to server
      fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Registration successful! Please login.")
            // Switch to login form
            registerForm.style.display = "none"
            loginForm.style.display = "block"
          } else {
            alert(data.message || "Registration failed. Please try again.")
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          alert("An error occurred. Please try again.")
        })
    })
  }

  // Check if user is already logged in
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  if (token && user) {
    // Redirect based on user role
    if (window.location.pathname === "/" || window.location.pathname === "/login.html") {
      if (user.role === "admin") {
        window.location.href = "/admin.html"
      } else {
        window.location.href = "/dashboard.html"
      }
    }
  }
})
