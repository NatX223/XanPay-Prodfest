# Design Document

## Overview

This design outlines the implementation of dynamic wallet address integration in the ReceiveModal component. The solution leverages the existing BusinessContext to replace the static wallet address with the user's actual address from their authenticated business account.

## Architecture

The implementation follows the existing React Native architecture pattern:

```
ReceiveModal Component
    ↓
useBusiness Hook (BusinessContext)
    ↓
BusinessService.getUserBusinessDetails()
    ↓
Backend API (/login endpoint)
    ↓
User's Wallet Address (userAddress field)
```

## Components and Interfaces

### Modified Components

#### ReceiveModal.tsx
- **FundsView Component**: Will be updated to consume business context data
- **Props Enhancement**: No new props required as BusinessContext is globally available
- **State Management**: Will use existing business context state for loading and error handling

### Data Flow

1. **Context Integration**: FundsView will use the `useBusiness` hook to access business details
2. **Address Resolution**: 
   - Primary: `businessDetails.userAddress` (actual wallet address)
   - Fallback: Display "Address not available" message
3. **Loading States**: Utilize `isLoading` from business context
4. **Error Handling**: Use `error` state from business context with retry functionality

## Data Models

### Existing BusinessDetails Interface
```typescript
interface BusinessDetails {
  businessName: string | null;
  businessImage: string | null;
  userAddress: string | null;  // ← This field contains the wallet address
  userBalance: number;
}
```

### Address Display Logic
```typescript
const displayAddress = businessDetails?.userAddress || null;
const isAddressAvailable = displayAddress !== null && displayAddress.trim() !== '';
```

## Error Handling

### Error States
1. **Loading State**: Show loading indicator while business details are being fetched
2. **Network Error**: Display error message with retry button
3. **No Address**: Show "Wallet address not available" message
4. **Invalid Address**: Treat as no address scenario

### Error Recovery
- Utilize existing `refreshBusinessDetails()` function from BusinessContext
- Provide manual retry option for users
- Graceful degradation when address is unavailable

## Testing Strategy

### Unit Tests
1. **Component Rendering**: Test FundsView renders correctly with different business context states
2. **Address Display**: Verify correct address is shown when available
3. **Fallback Behavior**: Test fallback message when address is null/empty
4. **Loading States**: Verify loading indicators appear during data fetch
5. **Error Handling**: Test error states and retry functionality

### Integration Tests
1. **Context Integration**: Test proper consumption of BusinessContext data
2. **QR Code Generation**: Verify QR code contains correct wallet address
3. **Clipboard Functionality**: Test copying actual address to clipboard

### Edge Cases
1. **Null/Empty Address**: Handle gracefully with appropriate messaging
2. **Context Unavailable**: Ensure component doesn't crash if context is missing
3. **Long Addresses**: Test UI layout with various address lengths
4. **Network Failures**: Test behavior during network connectivity issues

## Implementation Approach

### Phase 1: Context Integration
- Import and use `useBusiness` hook in FundsView component
- Replace static address constant with dynamic address from context

### Phase 2: UI State Management
- Implement loading states using business context loading state
- Add error handling with retry functionality
- Update address display logic with fallback messaging

### Phase 3: QR Code Integration
- Update QR code generation to use dynamic address
- Handle QR code display when address is unavailable

### Phase 4: Testing and Validation
- Add comprehensive tests for all scenarios
- Validate clipboard functionality with dynamic addresses
- Test error recovery mechanisms

## Security Considerations

- **Address Validation**: Rely on backend validation of wallet addresses
- **Data Sanitization**: Ensure address data is properly sanitized before display
- **Error Information**: Avoid exposing sensitive error details to users
- **Context Security**: Leverage existing authentication mechanisms in BusinessContext