import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './UserDashboard.css'

const API_BASE_URL = 'http://localhost:3000/api'

function UserDashboard() {
  const navigate = useNavigate()
  const [selectedToken, setSelectedToken] = useState('')
  const [amount, setAmount] = useState('')
  const [transactionType, setTransactionType] = useState<'buy' | 'redeem'>('buy')
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Calculate price automatically when amount changes
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const calculatedPrice = parseFloat(amount) * 0.0001 // Example calculation
      setPrice(calculatedPrice)
    } else {
      setPrice(null)
    }
  }, [amount])

  const handleBuyRedeem = async () => {
    if (!selectedToken || !amount) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Simulate buy/redeem transaction
      await new Promise(resolve => setTimeout(resolve, 1500))
      const action = transactionType === 'buy' ? 'bought' : 'redeemed'
      setSuccessMessage(`Successfully ${action} ${amount} tokens`)

      // Reset form
      setSelectedToken('')
      setAmount('')
      setPrice(null)
    } catch {
      setError('Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    navigate('/')
  }

  return (
    <div className="user-dashboard-container">
      <div className="user-dashboard-header">
        <div className="logo-box">
          <span className="logo-text">UTS</span>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          LOGOUT
        </button>
      </div>

      <div className="user-dashboard-content">
        <div className="token-form">
          {error && (
            <div className="message error-msg">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="message success-msg">
              {successMessage}
            </div>
          )}

          <div className="form-group">
            <label>TRANSACTION TYPE:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="transactionType"
                  value="buy"
                  checked={transactionType === 'buy'}
                  onChange={(e) => setTransactionType(e.target.value as 'buy' | 'redeem')}
                  className="radio-input"
                />
                <span>Buy</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="transactionType"
                  value="redeem"
                  checked={transactionType === 'redeem'}
                  onChange={(e) => setTransactionType(e.target.value as 'buy' | 'redeem')}
                  className="radio-input"
                />
                <span>Redeem</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tokenSelect">SELECT TOKEN:</label>
            <select
              id="tokenSelect"
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="form-control"
            >
              <option value="">-- Select a token --</option>
              <option value="token1">Token 1</option>
              <option value="token2">Token 2</option>
              <option value="token3">Token 3</option>
              <option value="custom">Custom Token</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">AMOUNT:</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="form-control"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>PRICE:</label>
            <div className="price-display">
              {price !== null ? `${price.toFixed(8)} BSV` : '---'}
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleBuyRedeem}
            disabled={loading || price === null}
          >
            {loading ? 'PROCESSING...' : transactionType === 'buy' ? 'BUY' : 'REDEEM'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
