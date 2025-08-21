export interface BankDetails {
  id?: string;
  userId: string;
  bankCode: string;
  bankName: string;
  accountNumber: string; // Encrypted in storage
  accountNumberMasked: string; // For display (****1234)
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankDetailsFormData {
  bankCode: string;
  accountNumber: string;
  isVerified?: boolean;
  lastUpdated?: Date;
}

export interface BankOption {
  code: string;
  name: string;
  displayName: string;
}

export interface BankDetailsFormProps {
  initialData?: BankDetailsFormData;
  onSubmit: (data: BankDetailsFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export interface BankDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export interface AccountNumberInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
}