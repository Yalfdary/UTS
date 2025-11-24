# Fractionalize App Frontend

A React application for creating and managing fractionalized tokens on the BSV blockchain.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A BSV wallet extension (Panda Wallet, Metanet Desktop Wallet, or compatible BSV wallet)

## Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd fractionalize-app/frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

Start the development server with hot-reload:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Production Build

Build the application for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Features

- **Landing Page**: Wallet detection and authentication
- **User Dashboard**: Buy and redeem tokens
- **Admin Dashboard**: Create and manage tokens with the following features:
  - Select contract type (Fiat Currency, Bonds, Tickets, Coupons)
  - Configure contract parameters
  - Upload contract files to distributed storage (BSV blockchain)
  - Generate tokens with metadata

## Wallet Setup

1. Install a BSV wallet extension:
   - [Panda Wallet](https://chromewebstore.google.com/detail/panda-wallet/mlbnicldlpdimbjdcncnklfempedeipj) (recommended)
   - Metanet Desktop Wallet
   - Other compatible BSV Desktop wallets.

2. Set up your wallet with BSV satoshis for transactions

3. Launch the app - it will automatically detect your wallet

## Usage

1. **Login**: Navigate to the landing page and click either "LOGIN AS USER" or "LOGIN AS ADMIN"
2. **Admin**: Create tokens by filling out the form and uploading contract files
3. **User**: Browse available tokens and purchase or redeem them

## Technology Stack

- React 18
- TypeScript
- Vite
- React Router
- BSV SDK (@bsv/sdk)
- BSV Overlay Services

## Notes

- File uploads are stored on distributed BSV storage (nanostore.babbage.systems)
- All transactions require a connected BSV wallet with sufficient balance
- The app uses certificate verification for authentication
