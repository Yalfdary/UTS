import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { WalletClient } from '@bsv/sdk'
import './LandingPage.css'

// Extended Window interface for BSV wallet detection
declare global {
  interface Window {
    bsvWallet?: any
    metanet?: any
    panda?: any
    MetanetClient?: any
    OneKeyWallet?: any
    YourWallet?: any
  }
}

interface CertificateStatus {
  isChecking: boolean
  checkingButton: 'user' | 'admin' | null
  hasCertificate: boolean
  errorMessage: string | null
}

function LandingPage() {
  const navigate = useNavigate()
  const [walletStatus, setWalletStatus] = useState<{
    isAvailable: boolean
    walletType: string | null
    isChecking: boolean
  }>({
    isAvailable: false,
    walletType: null,
    isChecking: true
  })

  const [certificateStatus, setCertificateStatus] = useState<CertificateStatus>({
    isChecking: false,
    checkingButton: null,
    hasCertificate: false,
    errorMessage: null
  })

  useEffect(() => {
    // Function to detect BSV wallet presence using WalletClient from @bsv/sdk
    const detectWallet = async () => {
      console.log('Checking for wallets using WalletClient...')

      try {
        // Try to create a WalletClient instance to check for wallet availability
        const walletClient = new WalletClient()
        console.log('WalletClient instance created:', walletClient)

        // Check if wallet is available through WalletClient
        if (walletClient) {
          console.log('BSV Wallet detected via WalletClient!')
          setWalletStatus({
            isAvailable: true,
            walletType: 'BSV Desktop Wallet',
            isChecking: false
          })
          return
        }
      } catch (error) {
        console.log('WalletClient check failed:', error)
      }

      // Fallback: Check window objects for wallet extensions
      console.log('Checking window objects...')
      console.log('window.metanet:', window.metanet)
      console.log('window.MetanetClient:', window.MetanetClient)
      console.log('window.bsvWallet:', window.bsvWallet)
      console.log('window.panda:', window.panda)

      // Check for various BSV wallet extensions
      const hasMetanetWallet = typeof window.metanet !== 'undefined' || typeof window.MetanetClient !== 'undefined'
      const hasBsvWallet = typeof window.bsvWallet !== 'undefined'
      const hasPandaWallet = typeof window.panda !== 'undefined'
      const hasOneKeyWallet = typeof window.OneKeyWallet !== 'undefined'
      const hasYourWallet = typeof window.YourWallet !== 'undefined'

      if (hasMetanetWallet) {
        console.log('Metanet wallet detected!')
        setWalletStatus({
          isAvailable: true,
          walletType: 'Metanet Desktop Wallet',
          isChecking: false
        })
      } else if (hasBsvWallet) {
        console.log('BSV Wallet detected!')
        setWalletStatus({
          isAvailable: true,
          walletType: 'BSV Wallet',
          isChecking: false
        })
      } else if (hasPandaWallet) {
        console.log('Panda Wallet detected!')
        setWalletStatus({
          isAvailable: true,
          walletType: 'Panda Wallet',
          isChecking: false
        })
      } else if (hasOneKeyWallet) {
        console.log('OneKey Wallet detected!')
        setWalletStatus({
          isAvailable: true,
          walletType: 'OneKey Wallet',
          isChecking: false
        })
      } else if (hasYourWallet) {
        console.log('YourWallet detected!')
        setWalletStatus({
          isAvailable: true,
          walletType: 'YourWallet',
          isChecking: false
        })
      } else {
        console.log('No wallet detected')
        setWalletStatus({
          isAvailable: false,
          walletType: null,
          isChecking: false
        })
      }
    }

    // Initial check
    detectWallet()

    // Check multiple times as wallet extensions may inject at different times
    const timeouts = [
      setTimeout(() => detectWallet(), 500),
      setTimeout(() => detectWallet(), 1000),
      setTimeout(() => detectWallet(), 2000),
      setTimeout(() => detectWallet(), 3000)
    ]

    // Listen for wallet injection events
    const handleWalletReady = () => {
      console.log('Wallet ready event fired')
      detectWallet()
    }

    // Listen for various wallet events
    window.addEventListener('bsvWalletReady', handleWalletReady)
    window.addEventListener('metanetReady', handleWalletReady)
    window.addEventListener('load', handleWalletReady)

    // Check if document is already loaded
    if (document.readyState === 'complete') {
      detectWallet()
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
      window.removeEventListener('bsvWalletReady', handleWalletReady)
      window.removeEventListener('metanetReady', handleWalletReady)
      window.removeEventListener('load', handleWalletReady)
    }
  }, [])

  const handleDownloadWallet = () => {
    window.open('https://chromewebstore.google.com/detail/panda-wallet/mlbnicldlpdimbjdcncnklfempedeipj', '_blank')
  }

  /**
   * Verify that the user has a valid certificate in their wallet
   * Uses BSV SDK to check for certificates
   */
  const verifyCertificate = async (buttonRole: 'user' | 'admin'): Promise<boolean> => {
    setCertificateStatus({
      isChecking: true,
      checkingButton: buttonRole,
      hasCertificate: false,
      errorMessage: null
    })

    try {
      // First, check if wallet is available
      if (!walletStatus.isAvailable) {
        setCertificateStatus({
          isChecking: false,
          checkingButton: null,
          hasCertificate: false,
          errorMessage: 'Please install a BSV wallet'
        })
        return false
      }

      console.log('Verifying certificate in wallet...')

      // Create wallet client instance
      const walletClient = new WalletClient()

      // Wait for authentication
      await walletClient.waitForAuthentication()
      console.log('Wallet authenticated successfully')

      // List certificates from the wallet
      // We're looking for any certificates, so we'll query with broad parameters
      const certificateResult = await walletClient.listCertificates({
        certifiers: [], // Empty array means query all certifiers
        types: [] // Empty array means query all certificate types
      })

      console.log('Certificate query result:', certificateResult)

      // Check if user has at least one certificate
      if (certificateResult.totalCertificates > 0 && certificateResult.certificates.length > 0) {
        console.log(`Found ${certificateResult.totalCertificates} certificate(s)`)
        setCertificateStatus({
          isChecking: false,
          checkingButton: null,
          hasCertificate: true,
          errorMessage: null
        })
        return true
      } else {
        console.log('No certificates found in wallet')
        setCertificateStatus({
          isChecking: false,
          checkingButton: null,
          hasCertificate: false,
          errorMessage: 'No certificate found in wallet. Please obtain a certificate first.'
        })
        return false
      }
    } catch (error) {
      console.error('Certificate verification failed:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to verify certificate'
      setCertificateStatus({
        isChecking: false,
        checkingButton: null,
        hasCertificate: false,
        errorMessage: `Certificate verification failed: ${errorMsg}`
      })
      return false
    }
  }

  /**
   * Handle login button click with certificate verification
   */
  const handleLogin = async (role: 'user' | 'admin') => {
    console.log(`Login as ${role} clicked`)

    // Verify certificate before allowing navigation
    const hasCertificate = await verifyCertificate(role)

    if (hasCertificate) {
      console.log(`Certificate verified, navigating to /${role}`)
      navigate(`/${role}`)
    } else {
      console.log('Certificate verification failed, blocking navigation')
    }
  }

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="logo-section">
          <h1 className="logo">UTS
            <div> -new texts goes here-</div> 
          </h1>
        </div>

        {/* Wallet Status Notification */}
        <div className="wallet-status-section">
          {walletStatus.isChecking ? (
            <div className="wallet-status checking">
              <span className="status-icon">🔍</span>
              <span className="status-text">Detecting wallet...</span>
            </div>
          ) : walletStatus.isAvailable ? (
            <div className="wallet-status connected">
              <span className="status-icon">✅</span>
              <span className="status-text">
                Wallet Connected: {walletStatus.walletType}
              </span>
            </div>
          ) : (
            <div className="wallet-status disconnected">
              <span className="status-icon">⚠️</span>
              <span className="status-text">
                No Wallet Detected - Please install a BSV wallet
              </span>
            </div>
          )}
        </div>

        {/* Certificate Status Notification */}
        {certificateStatus.isChecking && (
          <div className="wallet-status-section">
            <div className="wallet-status checking">
              <span className="status-icon">🔄</span>
              <span className="status-text">Verifying certificate...</span>
            </div>
          </div>
        )}

        {certificateStatus.errorMessage && (
          <div className="wallet-status-section">
            <div className="wallet-status disconnected">
              <span className="status-icon">❌</span>
              <span className="status-text">{certificateStatus.errorMessage}</span>
            </div>
          </div>
        )}

        {certificateStatus.hasCertificate && (
          <div className="wallet-status-section">
            <div className="wallet-status connected">
              <span className="status-icon">🎫</span>
              <span className="status-text">Certificate verified successfully!</span>
            </div>
          </div>
        )}

        <div className="download-section">
          <button className="download-btn" onClick={handleDownloadWallet}>
            Download the bsv desktop wallet
          </button>
        </div>

        <div className="login-section">
          <button
            className="login-btn user-btn"
            onClick={() => handleLogin('user')}
            disabled={certificateStatus.isChecking && certificateStatus.checkingButton === 'user'}
          >
            {(certificateStatus.isChecking && certificateStatus.checkingButton === 'user')
              ? 'VERIFYING...'
              : 'LOGIN AS USER'}
          </button>
          <button
            className="login-btn admin-btn"
            onClick={() => handleLogin('admin')}
            disabled={certificateStatus.isChecking && certificateStatus.checkingButton === 'admin'}
          >
            {(certificateStatus.isChecking && certificateStatus.checkingButton === 'admin')
              ? 'VERIFYING...'
              : 'LOGIN AS ADMIN'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
