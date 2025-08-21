# Bank Details Components

This directory contains components for managing user bank account details for fiat settlement payouts.

## Components

### BankDetailsForm
Main form component that handles bank account information entry and validation.

**Props:**
- `initialData?: BankDetailsFormData` - Pre-populate form with existing data
- `onSubmit: (data: BankDetailsFormData) => Promise<void>` - Handle form submission
- `onCancel?: () => void` - Handle form cancellation
- `isLoading?: boolean` - Show loading state during submission

### BankDropdown
Custom dropdown component for bank selection with predefined bank options.

**Props:**
- `value: string` - Selected bank code
- `onValueChange: (value: string) => void` - Handle bank selection
- `error?: string` - Display validation error
- `disabled?: boolean` - Disable interaction

### AccountNumberInput
Enhanced input component with numeric-only validation and real-time feedback.

**Props:**
- `value: string` - Account number value
- `onChangeText: (text: string) => void` - Handle text changes
- `error?: string` - Display validation error
- `disabled?: boolean` - Disable input

### BankDetailsErrorBoundary
Error boundary component that catches and handles errors gracefully.

## Features

- **Real-time Validation**: Account numbers are validated as the user types
- **Bank Selection**: Dropdown with major US banks (BOA, JPM, WFC, etc.)
- **Security**: Account numbers are encrypted before storage
- **Accessibility**: Full screen reader and keyboard navigation support
- **Error Handling**: Comprehensive error states and recovery options
- **Responsive Design**: Works across different screen sizes

## Usage

```tsx
import { BankDetailsForm } from '@/components/bank-details';

function MyComponent() {
  const handleSubmit = async (data: BankDetailsFormData) => {
    // Save bank details
    await bankDetailsService.saveBankDetails(userId, data);
  };

  return (
    <BankDetailsForm
      initialData={existingData}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      isLoading={isSaving}
    />
  );
}
```

## Validation Rules

- **Bank Code**: Required, must be from predefined list
- **Account Number**: 
  - Required
  - Numeric characters only
  - 8-17 digits (typical US account number range)

## Security Considerations

- Account numbers are encrypted using base64 encoding (demo implementation)
- Sensitive data is masked in display (shows only last 4 digits)
- Form data is cleared from memory after submission
- Requires user authentication to access

## Testing

Run tests with:
```bash
npm test -- bankDetails.test.ts
```

Tests cover:
- Form validation logic
- Input sanitization
- Error handling
- Component rendering
- Accessibility compliance