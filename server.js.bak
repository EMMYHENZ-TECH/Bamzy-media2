const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")

const app = express()
const PORT = process.env.PORT || 7860

// Middleware
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, ".")))

// Secret key for JWT
const JWT_SECRET = "your-secret-key"

// Data directory
const DATA_DIR = path.join(__dirname, "data")
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR)
}

// Data files
const USERS_FILE = path.join(DATA_DIR, "users.json")
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json")
const TRANSACTIONS_FILE = path.join(DATA_DIR, "transactions.json")
const PURCHASES_FILE = path.join(DATA_DIR, "purchases.json")
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json")

// Initialize data files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(
    USERS_FILE,
    JSON.stringify([
      {
        id: "1",
        name: "Admin User",
        email: "bamzymediatv@gmail.com",
        password: hashPassword("babcute1000"),
        role: "admin",
        balance: Number.POSITIVE_INFINITY,
        joined: "2023-01-01",
      },
      {
        id: "2",
        name: "Test User",
        email: "user@example.com",
        password: hashPassword("user123"),
        role: "user",
        balance: 100,
        joined: "2023-01-02",
      },
    ]),
  )
}

if (!fs.existsSync(TRANSACTIONS_FILE)) {
  fs.writeFileSync(
    TRANSACTIONS_FILE,
    JSON.stringify([
      {
        id: "1",
        userId: "2",
        type: "fund",
        amount: 100,
        date: "2023-01-03",
        status: "completed",
      },
    ]),
  )
}

if (!fs.existsSync(PURCHASES_FILE)) {
  fs.writeFileSync(
    PURCHASES_FILE,
    JSON.stringify([
      {
        id: "1",
        userId: "2",
        accountId: "3",
        amount: 40,
        date: "2023-01-04",
      },
    ]),
  )
}

if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(
    MESSAGES_FILE,
    JSON.stringify([
      {
        id: "1",
        senderId: "2",
        receiverId: "1",
        message: "Hello admin, I need help with funding my account.",
        timestamp: new Date().toISOString(),
        read: false,
      },
    ]),
  )
}

// Helper functions
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex")
}

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" })
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    req.user = user
    next()
  })
}

function isAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  next()
}

function readDataFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return []
  }
}

function writeDataFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error)
    return false
  }
}

// Routes
// Auth routes
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing required fields" })
  }

  const users = readDataFile(USERS_FILE)

  // Check if email already exists
  if (users.some((user) => user.email === email)) {
    return res.status(400).json({ success: false, message: "Email already exists" })
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: hashPassword(password),
    role: "user",
    balance: 0,
    joined: new Date().toISOString().split("T")[0],
  }

  users.push(newUser)

  if (writeDataFile(USERS_FILE, users)) {
    return res.json({ success: true, message: "User registered successfully" })
  } else {
    return res.status(500).json({ success: false, message: "Failed to register user" })
  }
})

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Missing required fields" })
  }

  const users = readDataFile(USERS_FILE)

  // Find user by email
  const user = users.find((user) => user.email === email)

  if (!user || user.password !== hashPassword(password)) {
    return res.status(401).json({ success: false, message: "Invalid credentials" })
  }

  // Generate token
  const token = generateToken(user)

  // Return user data (without password)
  const { password: _, ...userData } = user

  return res.json({
    success: true,
    message: "Login successful",
    token,
    user: userData,
  })
})

// Account routes
app.get("/api/accounts", authenticateToken, (req, res) => {
  const accounts = readDataFile(ACCOUNTS_FILE)

  // Remove login details for non-admin users
  let filteredAccounts = accounts
  if (req.user.role !== "admin") {
    filteredAccounts = accounts.map((account) => {
      const { loginDetails, ...accountData } = account
      return accountData
    })
  }

  return res.json({ success: true, accounts: filteredAccounts })
})

app.get("/api/accounts/:id", authenticateToken, (req, res) => {
  const { id } = req.params
  const accounts = readDataFile(ACCOUNTS_FILE)

  // Find account by id
  const account = accounts.find((account) => account.id === id)

  if (!account) {
    return res.status(404).json({ success: false, message: "Account not found" })
  }

  // Remove login details for non-admin users
  if (req.user.role !== "admin") {
    const { loginDetails, ...accountData } = account
    return res.json({ success: true, account: accountData })
  }

  return res.json({ success: true, account })
})

app.post("/api/accounts", authenticateToken, isAdmin, (req, res) => {
  const { platform, image, year, followers, price, loginDetails, description } = req.body

  if (!platform || !image || !year || !followers || !price || !loginDetails || !description) {
    return res.status(400).json({ success: false, message: "Missing required fields" })
  }

  const accounts = readDataFile(ACCOUNTS_FILE)

  // Create new account
  const newAccount = {
    id: Date.now().toString(),
    platform,
    image,
    year,
    followers,
    price,
    loginDetails,
    description,
    status: "available",
  }

  accounts.push(newAccount)

  if (writeDataFile(ACCOUNTS_FILE, accounts)) {
    return res.json({ success: true, message: "Account added successfully", account: newAccount })
  } else {
    return res.status(500).json({ success: false, message: "Failed to add account" })
  }
})

app.put("/api/accounts/:id", authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params
  const { platform, image, year, followers, price, loginDetails, description, status } = req.body

  if (!platform || !year || !followers || !price || !loginDetails || !description || !status) {
    return res.status(400).json({ success: false, message: "Missing required fields" })
  }

  const accounts = readDataFile(ACCOUNTS_FILE)

  // Find account index
  const accountIndex = accounts.findIndex((account) => account.id === id)

  if (accountIndex === -1) {
    return res.status(404).json({ success: false, message: "Account not found" })
  }

  // Update account
  const updatedAccount = {
    ...accounts[accountIndex],
    platform,
    year,
    followers,
    price,
    loginDetails,
    description,
    status,
  }

  // Update image if provided
  if (image) {
    updatedAccount.image = image
  }

  accounts[accountIndex] = updatedAccount

  if (writeDataFile(ACCOUNTS_FILE, accounts)) {
    return res.json({ success: true, message: "Account updated successfully", account: updatedAccount })
  } else {
    return res.status(500).json({ success: false, message: "Failed to update account" })
  }
})

app.delete("/api/accounts/:id", authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params
  const accounts = readDataFile(ACCOUNTS_FILE)

  // Find account index
  const accountIndex = accounts.findIndex((account) => account.id === id)

  if (accountIndex === -1) {
    return res.status(404).json({ success: false, message: "Account not found" })
  }

  // Remove account
  accounts.splice(accountIndex, 1)

  if (writeDataFile(ACCOUNTS_FILE, accounts)) {
    return res.json({ success: true, message: "Account deleted successfully" })
  } else {
    return res.status(500).json({ success: false, message: "Failed to delete account" })
  }
})

// Transaction routes
app.post("/api/transactions/fund", authenticateToken, (req, res) => {
  const { amount, userId } = req.body

  if (!amount || !userId) {
    return res.status(400).json({ success: false, message: "Missing required fields" })
  }

  // Verify user id matches authenticated user or is admin
  if (req.user.id !== userId && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  const users = readDataFile(USERS_FILE)
  const transactions = readDataFile(TRANSACTIONS_FILE)

  // Find user
  const userIndex = users.findIndex((user) => user.id === userId)

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: "User not found" })
  }

  // Update user balance
  users[userIndex].balance += Number.parseFloat(amount)

  // Create transaction
  const newTransaction = {
    id: Date.now().toString(),
    userId,
    type: "fund",
    amount: Number.parseFloat(amount),
    date: new Date().toISOString().split("T")[0],
    status: "completed",
  }

  transactions.push(newTransaction)

  if (writeDataFile(USERS_FILE, users) && writeDataFile(TRANSACTIONS_FILE, transactions)) {
    return res.json({ success: true, message: "Account funded successfully", transaction: newTransaction })
  } else {
    return res.status(500).json({ success: false, message: "Failed to fund account" })
  }
})

app.post("/api/transactions/purchase", authenticateToken, (req, res) => {
  const { accountId, userId } = req.body

  if (!accountId || !userId) {
    return res.status(400).json({ success: false, message: "Missing required fields" })
  }

  // Verify user id matches authenticated user or is admin
  if (req.user.id !== userId && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  const users = readDataFile(USERS_FILE)
  const accounts = readDataFile(ACCOUNTS_FILE)
  const transactions = readDataFile(TRANSACTIONS_FILE)
  const purchases = readDataFile(PURCHASES_FILE)

  // Find user
  const userIndex = users.findIndex((user) => user.id === userId)

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: "User not found" })
  }

  // Find account
  const accountIndex = accounts.findIndex((account) => account.id === accountId)

  if (accountIndex === -1) {
    return res.status(404).json({ success: false, message: "Account not found" })
  }

  // Check if account is available
  if (accounts[accountIndex].status !== "available") {
    return res.status(400).json({ success: false, message: "Account is not available" })
  }

  // Check if user has enough balance
  if (users[userIndex].balance < accounts[accountIndex].price) {
    return res.status(400).json({ success: false, message: "Insufficient balance" })
  }

  // Update user balance
  users[userIndex].balance -= accounts[accountIndex].price

  // Update account status
  accounts[accountIndex].status = "sold"

  // Create transaction
  const newTransaction = {
    id: Date.now().toString(),
    userId,
    type: "purchase",
    amount: accounts[accountIndex].price,
    date: new Date().toISOString().split("T")[0],
    status: "completed",
  }

  // Create purchase
  const newPurchase = {
    id: Date.now().toString(),
    userId,
    accountId,
    amount: accounts[accountIndex].price,
    date: new Date().toISOString().split("T")[0],
  }

  transactions.push(newTransaction)
  purchases.push(newPurchase)

  if (
    writeDataFile(USERS_FILE, users) &&
    writeDataFile(ACCOUNTS_FILE, accounts) &&
    writeDataFile(TRANSACTIONS_FILE, transactions) &&
    writeDataFile(PURCHASES_FILE, purchases)
  ) {
    return res.json({
      success: true,
      message: "Purchase successful",
      transaction: newTransaction,
      purchase: newPurchase,
    })
  } else {
    return res.status(500).json({ success: false, message: "Failed to complete purchase" })
  }
})

app.post("/api/transactions/purchase-cart", authenticateToken, (req, res) => {
  const { cart, userId } = req.body

  if (!cart || !Array.isArray(cart) || cart.length === 0 || !userId) {
    return res.status(400).json({ success: false, message: "Missing required fields" })
  }

  // Verify user id matches authenticated user or is admin
  if (req.user.id !== userId && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  const users = readDataFile(USERS_FILE)
  const accounts = readDataFile(ACCOUNTS_FILE)
  const transactions = readDataFile(TRANSACTIONS_FILE)
  const purchases = readDataFile(PURCHASES_FILE)

  // Find user
  const userIndex = users.findIndex((user) => user.id === userId)

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: "User not found" })
  }

  // Find accounts and calculate total price
  const accountsToPurchase = []
  let totalPrice = 0

  for (const accountId of cart) {
    const account = accounts.find((a) => a.id === accountId)

    if (!account) {
      return res.status(404).json({ success: false, message: `Account ${accountId} not found` })
    }

    if (account.status !== "available") {
      return res.status(400).json({ success: false, message: `Account ${accountId} is not available` })
    }

    accountsToPurchase.push(account)
    totalPrice += account.price
  }

  // Check if user has enough balance
  if (users[userIndex].balance < totalPrice) {
    return res.status(400).json({ success: false, message: "Insufficient balance" })
  }

  // Update user balance
  users[userIndex].balance -= totalPrice

  // Update accounts status
  for (const account of accountsToPurchase) {
    const accountIndex = accounts.findIndex((a) => a.id === account.id)
    accounts[accountIndex].status = "sold"
  }

  // Create transaction
  const newTransaction = {
    id: Date.now().toString(),
    userId,
    type: "purchase",
    amount: totalPrice,
    date: new Date().toISOString().split("T")[0],
    status: "completed",
  }

  transactions.push(newTransaction)

  // Create purchases
  const newPurchases = accountsToPurchase.map((account) => ({
    id: Date.now().toString() + "-" + account.id,
    userId,
    accountId: account.id,
    amount: account.price,
    date: new Date().toISOString().split("T")[0],
  }))

  purchases.push(...newPurchases)

  if (
    writeDataFile(USERS_FILE, users) &&
    writeDataFile(ACCOUNTS_FILE, accounts) &&
    writeDataFile(TRANSACTIONS_FILE, transactions) &&
    writeDataFile(PURCHASES_FILE, purchases)
  ) {
    return res.json({
      success: true,
      message: "Purchase successful",
      transaction: newTransaction,
      purchases: newPurchases,
    })
  } else {
    return res.status(500).json({ success: false, message: "Failed to complete purchase" })
  }
})

// Admin routes
app.get("/api/admin/stats", authenticateToken, isAdmin, (req, res) => {
  const accounts = readDataFile(ACCOUNTS_FILE)
  const users = readDataFile(USERS_FILE)
  const transactions = readDataFile(TRANSACTIONS_FILE)
  const messages = readDataFile(MESSAGES_FILE)

  const totalAccounts = accounts.length
  const accountsSold = accounts.filter((account) => account.status === "sold").length

  // Calculate total revenue from purchase transactions
  const totalRevenue = transactions
    .filter((transaction) => transaction.type === "purchase")
    .reduce((total, transaction) => total + transaction.amount, 0)

  const totalUsers = users.filter((user) => user.role === "user").length

  // Count unread messages for admin
  const unreadMessages = messages.filter((msg) => msg.receiverId === "1" && !msg.read).length

  return res.json({
    success: true,
    stats: {
      totalAccounts,
      accountsSold,
      totalRevenue,
      totalUsers,
      unreadMessages,
    },
  })
})

app.get("/api/admin/activity", authenticateToken, isAdmin, (req, res) => {
  const transactions = readDataFile(TRANSACTIONS_FILE)
  const users = readDataFile(USERS_FILE)
  const accounts = readDataFile(ACCOUNTS_FILE)
  const messages = readDataFile(MESSAGES_FILE)

  // Get recent transactions
  const recentTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  // Format activity items
  const activity = recentTransactions.map((transaction) => {
    const user = users.find((user) => user.id === transaction.userId)

    if (transaction.type === "fund") {
      return {
        type: "user",
        title: `${user.name} funded their account`,
        time: transaction.date,
        amount: transaction.amount,
      }
    } else if (transaction.type === "purchase") {
      return {
        type: "sale",
        title: `${user.name} purchased an account`,
        time: transaction.date,
        amount: transaction.amount,
      }
    }
  })

  // Add recent account additions
  const recentAccounts = accounts.sort((a, b) => Number.parseInt(b.id) - Number.parseInt(a.id)).slice(0, 3)

  recentAccounts.forEach((account) => {
    activity.push({
      type: "account",
      title: `New ${account.platform} account added`,
      time: "Recently",
      amount: account.price,
    })
  })

  // Add recent messages
  const recentMessages = messages
    .filter((msg) => msg.receiverId === "1")
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3)

  recentMessages.forEach((message) => {
    const user = users.find((user) => user.id === message.senderId)
    activity.push({
      type: "message",
      title: `New message from ${user ? user.name : "Unknown user"}`,
      time: new Date(message.timestamp).toLocaleDateString(),
      read: message.read,
    })
  })

  // Sort by most recent
  activity.sort((a, b) => {
    if (a.time === "Recently") return -1
    if (b.time === "Recently") return 1
    return new Date(b.time) - new Date(a.time)
  })

  return res.json({
    success: true,
    activity: activity.slice(0, 5),
  })
})

app.get("/api/admin/transactions", authenticateToken, isAdmin, (req, res) => {
  const transactions = readDataFile(TRANSACTIONS_FILE)
  const users = readDataFile(USERS_FILE)

  // Format transactions
  const formattedTransactions = transactions.map((transaction) => {
    const user = users.find((user) => user.id === transaction.userId)

    return {
      id: transaction.id,
      user: user ? user.name : "Unknown",
      type: transaction.type,
      amount: transaction.amount,
      date: transaction.date,
      status: transaction.status,
    }
  })

  return res.json({
    success: true,
    transactions: formattedTransactions,
  })
})

app.get("/api/admin/users", authenticateToken, isAdmin, (req, res) => {
  const users = readDataFile(USERS_FILE)

  // Format users (remove passwords)
  const formattedUsers = users.map((user) => {
    const { password, ...userData } = user
    return userData
  })

  return res.json({
    success: true,
    users: formattedUsers,
  })
})

// Purchases routes
app.get("/api/purchases", authenticateToken, (req, res) => {
  const purchases = readDataFile(PURCHASES_FILE)
  const accounts = readDataFile(ACCOUNTS_FILE)

  // Filter purchases by user id
  const userPurchases = purchases.filter((purchase) => purchase.userId === req.user.id)

  // Format purchases with account details
  const formattedPurchases = userPurchases.map((purchase) => {
    const account = accounts.find((account) => account.id === purchase.accountId)

    return {
      id: purchase.id,
      account: account
        ? {
            id: account.id,
            platform: account.platform,
            image: account.image,
            followers: account.followers,
            loginDetails: account.loginDetails,
          }
        : null,
      amount: purchase.amount,
      date: purchase.date,
    }
  })

  return res.json({
    success: true,
    purchases: formattedPurchases,
  })
})

// Messages routes
app.get("/api/messages", authenticateToken, (req, res) => {
  const messages = readDataFile(MESSAGES_FILE)
  const users = readDataFile(USERS_FILE)

  // Get user's conversations (either as sender or receiver)
  const userMessages = messages.filter((msg) => msg.senderId === req.user.id || msg.receiverId === req.user.id)

  // Get unique conversation partners
  const conversationPartners = new Set()
  userMessages.forEach((msg) => {
    if (msg.senderId === req.user.id) {
      conversationPartners.add(msg.receiverId)
    } else {
      conversationPartners.add(msg.senderId)
    }
  })

  // Format conversations
  const conversations = Array.from(conversationPartners).map((partnerId) => {
    const partner = users.find((user) => user.id === partnerId)
    const conversation = userMessages
      .filter(
        (msg) =>
          (msg.senderId === req.user.id && msg.receiverId === partnerId) ||
          (msg.senderId === partnerId && msg.receiverId === req.user.id),
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    const unreadCount = conversation.filter((msg) => msg.receiverId === req.user.id && !msg.read).length

    return {
      partnerId,
      partnerName: partner ? partner.name : "Unknown",
      partnerRole: partner ? partner.role : "unknown",
      lastMessage: conversation[conversation.length - 1],
      unreadCount,
    }
  })

  return res.json({
    success: true,
    conversations,
  })
})

app.get("/api/messages/:partnerId", authenticateToken, (req, res) => {
  const { partnerId } = req.params
  const messages = readDataFile(MESSAGES_FILE)

  // Get conversation with partner
  const conversation = messages
    .filter(
      (msg) =>
        (msg.senderId === req.user.id && msg.receiverId === partnerId) ||
        (msg.senderId === partnerId && msg.receiverId === req.user.id),
    )
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  // Mark messages as read
  let updated = false
  messages.forEach((msg) => {
    if (msg.receiverId === req.user.id && msg.senderId === partnerId && !msg.read) {
      msg.read = true
      updated = true
    }
  })

  if (updated) {
    writeDataFile(MESSAGES_FILE, messages)
  }

  return res.json({
    success: true,
    messages: conversation,
  })
})

app.post("/api/messages", authenticateToken, (req, res) => {
  const { receiverId, message } = req.body

  if (!receiverId || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields" })
  }

  const messages = readDataFile(MESSAGES_FILE)
  const users = readDataFile(USERS_FILE)

  // Verify receiver exists
  const receiver = users.find((user) => user.id === receiverId)
  if (!receiver) {
    return res.status(404).json({ success: false, message: "Receiver not found" })
  }

  // Create new message
  const newMessage = {
    id: Date.now().toString(),
    senderId: req.user.id,
    receiverId,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  }

  messages.push(newMessage)

  if (writeDataFile(MESSAGES_FILE, messages)) {
    return res.json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    })
  } else {
    return res.status(500).json({ success: false, message: "Failed to send message" })
  }
})

// Admin fund user route
app.post("/api/admin/fund-user", authenticateToken, isAdmin, (req, res) => {
  const { userId, amount } = req.body

  if (!userId || !amount) {
    return res.status(400).json({ success: false, message: "Missing required fields" })
  }

  const users = readDataFile(USERS_FILE)
  const transactions = readDataFile(TRANSACTIONS_FILE)

  // Find user
  const userIndex = users.findIndex((user) => user.id === userId)

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: "User not found" })
  }

  // Update user balance
  users[userIndex].balance += Number.parseFloat(amount)

  // Create transaction
  const newTransaction = {
    id: Date.now().toString(),
    userId,
    type: "fund",
    amount: Number.parseFloat(amount),
    date: new Date().toISOString().split("T")[0],
    status: "completed",
  }

  transactions.push(newTransaction)

  if (writeDataFile(USERS_FILE, users) && writeDataFile(TRANSACTIONS_FILE, transactions)) {
    return res.json({
      success: true,
      message: "User account funded successfully",
      transaction: newTransaction,
    })
  } else {
    return res.status(500).json({ success: false, message: "Failed to fund user account" })
  }
})

// Serve HTML files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"))
})

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"))
})

app.get("/cart", (req, res) => {
  res.sendFile(path.join(__dirname, "cart.html"))
})

app.get("/purchases", (req, res) => {
  res.sendFile(path.join(__dirname, "purchases.html"))
})

app.get("/messages", (req, res) => {
  res.sendFile(path.join(__dirname, "messages.html"))
})

app.get("/admin/fund", (req, res) => {
  res.sendFile(path.join(__dirname, "admin-fund.html"))
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
