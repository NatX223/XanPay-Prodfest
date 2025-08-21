# Paycrest API Issue Resolution

## Problem
The `/withdrawFiat` endpoint was failing with error:
```
code: 'ERR_BAD_REQUEST',
data: {
  status: 'error',
  message: 'Failed to validate payload'
}
```

## Root Causes Identified

### 1. Missing Rate Field
The Paycrest API requires a `rate` field in the order payload, but it was removed from the request.

### 2. Missing Bank Details
The merchant documents didn't have the required bank details (`bank`, `accountNum`, `accountName`) that were being referenced in the order payload.

### 3. Missing Address ID
The `addressId` field was not being stored when creating merchant accounts, but was being used in withdrawal operations.

### 4. Token Configuration Issue
The API key appears to have access to the rate endpoint but not the order creation endpoint for USDC tokens. This suggests either:
- API key permissions issue
- Environment mismatch (sandbox vs production)
- Token not configured for this specific API key

## Fixes Implemented

### 1. Fixed Rate Field
- Added the `rate` field back to the order payload using the response from `fetchRate()`

### 2. Added Bank Details Validation
- Added validation to check if merchant has bank details before attempting withdrawal
- Added `/updateBankDetails` endpoint to allow merchants to set their bank information

### 3. Fixed Address ID Storage
- Modified `/createAccount` endpoint to store the `addressId` from BlockRadar response
- Added validation to ensure `addressId` exists before withdrawal

### 4. Improved Error Handling
- Added specific error handling for token configuration issues
- Added detailed logging for debugging API responses
- Added user-friendly error messages

## API Endpoints Added

### POST /updateBankDetails
Allows merchants to update their bank details for fiat withdrawals.

**Request Body:**
```json
{
  "bank": "Bank Name",
  "accountNum": "1234567890",
  "accountName": "Account Holder Name"
}
```

## Current Status
- The payload validation issues have been resolved
- Bank details can now be properly configured
- Better error handling is in place
- The token configuration issue with Paycrest needs to be resolved with their support team

## Next Steps
1. Contact Paycrest support about the token configuration issue
2. Test with merchants who have proper bank details configured
3. Consider implementing a fallback or alternative payment provider if needed