# Certificate Verification Testing Guide

## Quick Start

### Prerequisites
1. BSV wallet installed (Panda Wallet, Metanet, etc.)
2. Wallet unlocked and accessible
3. Development server running

### Start Development Server
```bash
cd /Users/adoncumi/Documents/OPEN\ RUN\ ASIA\ 2025/overlay-express-examples/fractionalize-app/frontend
npm run dev
```

Access the application at: http://localhost:5173 (or the port shown in terminal)

## Test Scenarios

### Test 1: No Wallet Installed
**Setup**: Disable or uninstall BSV wallet extension

**Expected Behavior**:
1. Page shows: "⚠️ No Wallet Detected - Please install a BSV wallet"
2. Click "LOGIN AS USER" or "LOGIN AS ADMIN"
3. Should show: "❌ Please install a BSV wallet"
4. Navigation should be blocked
5. User remains on landing page

**Console Logs**:
```
Checking for wallets using WalletClient...
No wallet detected
Login as user clicked
```

---

### Test 2: Wallet Installed but No Certificates
**Setup**:
- BSV wallet installed and unlocked
- No certificates in wallet (or empty wallet)

**Expected Behavior**:
1. Page shows: "✅ Wallet Connected: [Wallet Type]"
2. Click "LOGIN AS USER"
3. Button changes to "VERIFYING..."
4. Button becomes disabled (grayed out, no hover effect)
5. Shows: "🔄 Verifying certificate..."
6. After check completes, shows: "❌ No certificate found in wallet. Please obtain a certificate first."
7. Navigation is blocked
8. Button re-enables with "LOGIN AS USER" text

**Console Logs**:
```
Login as user clicked
Verifying certificate in wallet...
Wallet authenticated successfully
Certificate query result: { totalCertificates: 0, certificates: [] }
No certificates found in wallet
Certificate verification failed, blocking navigation
```

---

### Test 3: Wallet with Valid Certificates
**Setup**:
- BSV wallet installed and unlocked
- At least one certificate present in wallet

**Expected Behavior**:
1. Page shows: "✅ Wallet Connected: [Wallet Type]"
2. Click "LOGIN AS USER"
3. Button changes to "VERIFYING..."
4. Button becomes disabled
5. Shows: "🔄 Verifying certificate..."
6. After check completes, shows: "🎫 Certificate verified successfully!"
7. Navigation proceeds to /user
8. User is redirected to User Dashboard

**Console Logs**:
```
Login as user clicked
Verifying certificate in wallet...
Wallet authenticated successfully
Certificate query result: { totalCertificates: 1, certificates: [...] }
Found 1 certificate(s)
Certificate verified, navigating to /user
```

---

### Test 4: Admin Login Flow
**Setup**: Same as Test 3

**Expected Behavior**:
1. Follow same steps as Test 3
2. Navigation proceeds to /admin instead of /user
3. User is redirected to Admin Dashboard

**Console Logs**:
```
Login as admin clicked
Verifying certificate in wallet...
...
Certificate verified, navigating to /admin
```

---

### Test 5: Wallet Authentication Timeout
**Setup**:
- BSV wallet installed but locked
- Or wallet not responding

**Expected Behavior**:
1. Page shows: "✅ Wallet Connected: [Wallet Type]"
2. Click "LOGIN AS USER"
3. Shows: "🔄 Verifying certificate..."
4. After timeout, shows: "❌ Certificate verification failed: [error details]"
5. Navigation is blocked

**Console Logs**:
```
Login as user clicked
Verifying certificate in wallet...
Certificate verification failed: [timeout or auth error]
Certificate verification failed, blocking navigation
```

---

### Test 6: Multiple Login Attempts
**Setup**: Any configuration

**Expected Behavior**:
1. Click "LOGIN AS USER"
2. While verification is in progress (showing "VERIFYING...")
3. Try clicking the button again
4. Button should remain disabled
5. Only one verification process should run
6. No duplicate error messages

---

### Test 7: Switch Between User and Admin
**Setup**: Wallet with certificates

**Expected Behavior**:
1. Click "LOGIN AS USER"
2. Verification completes successfully
3. Navigate to /user
4. Go back to landing page
5. Click "LOGIN AS ADMIN"
6. Should verify again (not cached)
7. Navigate to /admin

---

## Browser Developer Tools Testing

### Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Click login button
4. Should NOT see any HTTP requests to backend
5. All verification happens client-side via wallet extension

### Console Tab
Enable verbose logging:
1. Open Developer Tools (F12)
2. Go to Console tab
3. Click login button
4. Should see detailed logs:
   - "Login as [role] clicked"
   - "Verifying certificate in wallet..."
   - "Wallet authenticated successfully"
   - Certificate query results
   - Navigation decision

### React DevTools
If React DevTools installed:
1. Inspect LandingPage component
2. Check state:
   - `walletStatus`: { isAvailable, walletType, isChecking }
   - `certificateStatus`: { isChecking, hasCertificate, errorMessage }
3. State should update correctly during verification

---

## Visual Testing Checklist

### Loading State
- [ ] "VERIFYING..." text appears on button
- [ ] Button becomes disabled (grayed out)
- [ ] "🔄 Verifying certificate..." status appears below wallet status
- [ ] No hover effect on disabled button
- [ ] Cursor changes to "not-allowed" on disabled button

### Success State
- [ ] "🎫 Certificate verified successfully!" message appears
- [ ] Message has green background
- [ ] Button re-enables
- [ ] Navigation occurs immediately after success message
- [ ] Success message disappears when navigating away

### Error State
- [ ] "❌" error icon appears
- [ ] Error message is clear and specific
- [ ] Message has yellow/warning background
- [ ] Button re-enables after error
- [ ] User can retry by clicking again
- [ ] Error message persists until next verification attempt

---

## Edge Cases to Test

### 1. Rapid Button Clicking
- Click login button multiple times rapidly
- Should only trigger one verification
- Should handle gracefully without errors

### 2. Wallet Connection During Verification
- Start with no wallet
- Click login (shows "no wallet" error)
- Install/enable wallet
- Click login again
- Should now detect wallet and proceed with verification

### 3. Network Interruption
- Start verification process
- Disable network connection
- Should handle timeout gracefully
- Should show appropriate error message

### 4. Browser Refresh During Verification
- Click login button
- Immediately refresh browser
- Page should reload cleanly
- No stuck loading states

---

## Performance Testing

### 1. Verification Speed
- Time from button click to verification complete
- Should complete within 2-5 seconds with good connection
- If slower than 10 seconds, investigate wallet responsiveness

### 2. Multiple Certificates
- Test with wallet containing 1, 5, 10, 50 certificates
- Verification time should not significantly increase
- Query only checks if certificates exist (count > 0)

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Can tab to login buttons
- [ ] Can activate button with Enter or Space
- [ ] Disabled state prevents keyboard activation
- [ ] Focus visible on buttons

### Screen Reader
- [ ] Status messages are announced
- [ ] Button state changes are announced
- [ ] Error messages are accessible
- [ ] Loading state is communicated

---

## Known Issues to Watch For

### 1. Empty Array Parameter Issue
Some wallet implementations may not support empty arrays for certifiers/types:
```typescript
await walletClient.listCertificates({
  certifiers: [], // May not work with all wallets
  types: []
})
```

**Workaround**: If this fails, query with specific parameters or catch the error

### 2. Wallet Not Responding
If `waitForAuthentication()` hangs indefinitely:
- Check wallet is unlocked
- Verify wallet extension is enabled
- Try refreshing page
- Check wallet logs for errors

### 3. Certificate Count Mismatch
Query may return different counts than expected:
- Empty `certifiers` array behavior varies by wallet
- Some wallets may filter revoked certificates automatically
- Check console logs for actual response

---

## Debugging Commands

### Check Wallet Connection
```javascript
// In browser console
const wallet = new WalletClient()
console.log(wallet)
```

### Manual Certificate Query
```javascript
// In browser console
const wallet = new WalletClient()
wallet.waitForAuthentication().then(() => {
  wallet.listCertificates({
    certifiers: [],
    types: []
  }).then(result => {
    console.log('Certificates:', result)
  })
})
```

### Check Component State
```javascript
// In React DevTools console
// Select LandingPage component, then:
$r.state // View component state
```

---

## Success Criteria

Certificate verification is working correctly if:
1. ✅ Wallet detection works (shows connected/disconnected correctly)
2. ✅ Certificate verification runs when login clicked
3. ✅ Loading state displays correctly during verification
4. ✅ Success allows navigation to correct page
5. ✅ Errors block navigation and show clear messages
6. ✅ Users cannot trigger multiple simultaneous verifications
7. ✅ No console errors (except expected "no certificates" messages)
8. ✅ UI remains responsive during verification
9. ✅ Works with different BSV wallet types

---

## Reporting Issues

When reporting issues, include:
1. Browser and version
2. Wallet type and version
3. Number of certificates in wallet
4. Console logs (full output)
5. Screenshot of error state
6. Steps to reproduce
7. Expected vs actual behavior

---

## Next Steps After Testing

If all tests pass:
1. Consider adding backend verification
2. Implement certificate type filtering
3. Add expiration checking
4. Implement revocation checking
5. Add role-based certificate requirements

If tests fail:
1. Check console logs for detailed errors
2. Verify wallet is properly installed and configured
3. Test with different wallet implementations
4. Check network connectivity
5. Review implementation documentation
