# Requirements Document

## Introduction

This feature involves refactoring the existing invoice creation functionality from a modal-based approach to a dedicated page-based approach. Currently, users can create invoices through the ReceiveModal component, but this should be moved to a standalone page that provides better user experience and navigation flow. The new page should not appear in the main tab navigation but should be accessible when users select the invoice option from the receive modal.

## Requirements

### Requirement 1

**User Story:** As a user, I want to access invoice creation through a dedicated page instead of a modal, so that I have more screen space and better navigation experience.

#### Acceptance Criteria

1. WHEN a user clicks on the "Invoice" option in the ReceiveModal THEN the system SHALL navigate to a dedicated invoice creation page
2. WHEN the invoice creation page is displayed THEN the system SHALL provide the same functionality as the current modal invoice view
3. WHEN the invoice creation page is accessed THEN the system SHALL NOT display it as a tab in the main navigation

### Requirement 2

**User Story:** As a user, I want to navigate back from the invoice creation page to the previous screen, so that I can easily return to my previous context.

#### Acceptance Criteria

1. WHEN a user is on the invoice creation page THEN the system SHALL provide a back navigation option
2. WHEN a user presses the back button THEN the system SHALL return to the previous screen (dashboard or wherever the ReceiveModal was opened from)
3. WHEN navigation occurs THEN the system SHALL maintain proper navigation stack management

### Requirement 3

**User Story:** As a user, I want the invoice creation page to have all the same features as the current modal, so that I don't lose any functionality.

#### Acceptance Criteria

1. WHEN the invoice creation page loads THEN the system SHALL display product ID input field
2. WHEN the invoice creation page loads THEN the system SHALL display quantity input field
3. WHEN the invoice creation page loads THEN the system SHALL display available products list
4. WHEN a user selects a product THEN the system SHALL show product preview with pricing
5. WHEN a user creates an invoice THEN the system SHALL process it using the existing InvoiceService
6. WHEN invoice creation is successful THEN the system SHALL show success feedback and navigate back

### Requirement 4

**User Story:** As a user, I want the ReceiveModal to be simplified after the invoice functionality is moved, so that it focuses on its remaining purpose.

#### Acceptance Criteria

1. WHEN the ReceiveModal is displayed THEN the system SHALL still show the "Invoice" option
2. WHEN a user clicks the "Invoice" option THEN the system SHALL close the modal and navigate to the invoice page
3. WHEN the ReceiveModal is displayed THEN the system SHALL maintain the "Funds" option with existing functionality
4. WHEN the modal height is calculated THEN the system SHALL adjust for the removal of the invoice view content