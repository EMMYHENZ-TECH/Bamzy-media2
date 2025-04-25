document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  if (!token || !user) {
    window.location.href = "/index.html"
    return
  }

  // Update user info
  document.getElementById("userName").textContent = user.name || "User"
  document.getElementById("userBalance").textContent = `Balance: ₦${formatNumber(user.balance || 0)}`

  // Update cart count
  const cart = JSON.parse(localStorage.getItem("cart") || "[]")
  const cartCount = document.getElementById("cartCount")
  const headerCartCount = document.getElementById("headerCartCount")
  cartCount.textContent = cart.length
  headerCartCount.textContent = cart.length

  // Load purchases
  loadPurchases()

  // Sidebar toggle
  const toggleSidebar = document.getElementById("toggleSidebar")
  const closeSidebar = document.getElementById("closeSidebar")
  const sidebar = document.getElementById("sidebar")

  toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("active")
  })

  closeSidebar.addEventListener("click", () => {
    sidebar.classList.remove("active")
  })

  // Close sidebar when clicking on a menu item (for mobile)
  const menuItems = document.querySelectorAll(".sidebar-menu a")
  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("active")
      }
    })
  })

  // Close sidebar when clicking outside (for mobile)
  document.addEventListener("click", (event) => {
    const isClickInsideSidebar = sidebar.contains(event.target)
    const isClickOnToggle = toggleSidebar.contains(event.target)

    if (!isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains("active")) {
      sidebar.classList.remove("active")
    }
  })

  // Fund account modal
  const fundAccount = document.getElementById("fundAccount")
  const fundModal = document.getElementById("fundModal")
  const closeFundModal = fundModal.querySelector(".close")

  fundAccount.addEventListener("click", (e) => {
    e.preventDefault()
    fundModal.style.display = "block"
  })

  closeFundModal.addEventListener("click", () => {
    fundModal.style.display = "none"
  })

  // Account details modal
  const accountDetailsModal = document.getElementById("accountDetailsModal")
  const closeAccountDetailsModal = accountDetailsModal.querySelector(".close")

  closeAccountDetailsModal.addEventListener("click", () => {
    accountDetailsModal.style.display = "none"
  })

  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === fundModal) {
      fundModal.style.display = "none"
    }
    if (event.target === accountDetailsModal) {
      accountDetailsModal.style.display = "none"
    }
  })

  // Update the fund account modal handler to use the new chat-based funding flow
  // Replace the fund form submission handler with:

  // Handle fund request
  const sendFundRequestBtn = document.getElementById("sendFundRequest")
  if (sendFundRequestBtn) {
    sendFundRequestBtn.addEventListener("click", () => {
      const amount = document.getElementById("fundAmount").value

      if (!amount || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount")
        return
      }

      // Send message to admin
      fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: "1", // Admin ID
          message: `I would like to fund my account with ₦${amount}. My user ID is ${user.id}.`,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Your funding request has been sent to the admin. They will contact you with payment details.")
            fundModal.style.display = "none"

            // Redirect to messages page
            window.location.href = "/messages.html"
          } else {
            alert(data.message || "Failed to send request. Please try again.")
          }
        })
        .catch((error) => {
          console.error("Error:", error)

          // For demo purposes, simulate success
          alert("Your funding request has been sent to the admin. They will contact you with payment details.")
          fundModal.style.display = "none"

          // Redirect to messages page
          window.location.href = "/messages.html"
        })
    })
  }

  // Handle logout
  const logout = document.getElementById("logout")
  logout.addEventListener("click", (e) => {
    e.preventDefault()

    // Clear local storage
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    // Redirect to login page
    window.location.href = "/index.html"
  })
})

// Load purchases from server
function loadPurchases() {
  const token = localStorage.getItem("token")
  const purchasesList = document.getElementById("purchasesList")

  // Send request to server
  fetch("/api/purchases", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        displayPurchases(data.purchases)
      } else {
        purchasesList.innerHTML = `
                <div class="no-purchases">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load purchases. Please try again later.</p>
                </div>
            `
      }
    })
    .catch((error) => {
      console.error("Error:", error)

      // For demo purposes, we'll display mock purchases
      // In a real application, you would handle the error properly

      const mockPurchases = [
        {
          id: "1",
          account: {
            id: "3",
            platform: "twitter",
            image: "https://via.placeholder.com/300",
            followers: 8000,
            loginDetails: "Username: twitter_user1\nPassword: password123",
          },
          amount: 40000,
          date: "2023-01-04",
        },
        {
          id: "2",
          account: {
            id: "4",
            platform: "instagram",
            image: "https://via.placeholder.com/300",
            followers: 15000,
            loginDetails: "Username: insta_user2\nPassword: password123",
          },
          amount: 75000,
          date: "2023-02-15",
        },
        {
          id: "3",
          account: {
            id: "5",
            platform: "tiktok",
            image: "https://via.placeholder.com/300",
            followers: 20000,
            loginDetails: "Username: tiktok_user2\nPassword: password123\nEmail: tiktok@example.com",
          },
          amount: 100000,
          date: "2023-03-20",
        },
      ]

      displayPurchases(mockPurchases)
    })
}

// Display purchases in the UI
function displayPurchases(purchases) {
  const purchasesList = document.getElementById("purchasesList")

  // Sort purchases by date (newest first)
  purchases.sort((a, b) => new Date(b.date) - new Date(a.date))

  if (purchases.length === 0) {
    purchasesList.innerHTML = `
            <div class="no-purchases">
                <i class="fas fa-shopping-bag"></i>
                <p>You haven't purchased any accounts yet.</p>
                <a href="dashboard.html" class="btn-primary">Browse Accounts</a>
            </div>
        `
    return
  }

  let purchasesHTML = ""

  purchases.forEach((purchase) => {
    if (!purchase.account) return

    const account = purchase.account
    const date = new Date(purchase.date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    purchasesHTML += `
            <div class="purchase-item">
                <div class="purchase-header">
                    <div class="purchase-date">
                        <i class="fas fa-calendar-alt"></i> ${date}
                    </div>
                    <div class="purchase-amount">
                        ₦${formatNumber(purchase.amount)}
                    </div>
                </div>
                <div class="purchase-content">
                    <div class="purchase-image">
                        <img src="${account.image}" alt="${account.platform}">
                    </div>
                    <div class="purchase-details">
                        <div class="purchase-platform">
                            <i class="fab fa-${getPlatformIcon(account.platform)}"></i> ${account.platform}
                        </div>
                        <div class="purchase-followers">
                            <i class="fas fa-users"></i> ${formatNumber(account.followers)} followers
                        </div>
                        <div class="purchase-login">
${account.loginDetails}
                        </div>
                        <button class="view-details-btn" data-id="${account.id}">
                            <i class="fas fa-eye"></i> View Full Details
                        </button>
                    </div>
                </div>
            </div>
        `
  })

  purchasesList.innerHTML = purchasesHTML

  // Add event listeners to view details buttons
  const viewDetailsButtons = document.querySelectorAll(".view-details-btn")
  viewDetailsButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const accountId = this.getAttribute("data-id")
      displayAccountDetails(accountId, purchases)
    })
  })
}

// Display account details in modal
function displayAccountDetails(accountId, purchases) {
  const purchase = purchases.find((p) => p.account && p.account.id === accountId)

  if (!purchase || !purchase.account) {
    alert("Account details not found")
    return
  }

  const account = purchase.account
  const accountDetailsContent = document.getElementById("accountDetailsContent")
  const accountDetailsModal = document.getElementById("accountDetailsModal")

  accountDetailsContent.innerHTML = `
        <div class="account-details-image">
            <img src="${account.image}" alt="${account.platform}">
        </div>
        <div class="account-details-info">
            <h3><i class="fab fa-${getPlatformIcon(account.platform)}"></i> ${account.platform}</h3>
            <p><i class="fas fa-users"></i> <strong>Followers:</strong> ${formatNumber(account.followers)}</p>
            <p><i class="fas fa-calendar-alt"></i> <strong>Purchase Date:</strong> ${new Date(
              purchase.date,
            ).toLocaleDateString("en-NG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
            <p><i class="fas fa-money-bill-wave"></i> <strong>Amount Paid:</strong> ₦${formatNumber(purchase.amount)}</p>
            
            <div class="login-details-box">
                <h4><i class="fas fa-key"></i> Login Details</h4>
                <pre>${account.loginDetails}</pre>
            </div>
            
            <div class="account-usage-tips">
                <h4><i class="fas fa-info-circle"></i> Usage Tips</h4>
                <ul>
                    <li>Change the password immediately after login</li>
                    <li>Update the recovery email and phone number</li>
                    <li>Don't share these login details with anyone</li>
                    <li>For any issues, contact our support</li>
                </ul>
            </div>
        </div>
    `

  // Add some CSS for the modal content
  const style = document.createElement("style")
  style.textContent = `
        .account-details-image {
            width: 100%;
            height: 200px;
            overflow: hidden;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        
        .account-details-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .account-details-info h3 {
            margin-top: 0;
            color: #333;
            text-transform: capitalize;
        }
        
        .login-details-box {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        
        .login-details-box h4 {
            margin-top: 0;
            color: #333;
        }
        
        .login-details-box pre {
            background-color: #e9f7fe;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 13px;
            white-space: pre-line;
            margin: 0;
        }
        
        .account-usage-tips {
            background-color: #fff8e1;
            padding: 15px;
            border-radius: 8px;
        }
        
        .account-usage-tips h4 {
            margin-top: 0;
            color: #333;
        }
        
        .account-usage-tips ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .account-usage-tips li {
            margin-bottom: 5px;
        }
    `

  accountDetailsContent.appendChild(style)

  // Show modal
  accountDetailsModal.style.display = "block"
}

// Helper function to get platform icon
function getPlatformIcon(platform) {
  const icons = {
    instagram: "instagram",
    facebook: "facebook",
    twitter: "twitter",
    tiktok: "tiktok",
    youtube: "youtube",
    pinterest: "pinterest",
    linkedin: "linkedin",
    snapchat: "snapchat",
  }

  return icons[platform.toLowerCase()] || "globe"
}

// Helper function to format numbers
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
