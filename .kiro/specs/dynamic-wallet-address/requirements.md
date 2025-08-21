# Requirements Document

## Introduction

This feature enhances the ReceiveModal component to display the user's actual wallet address from their authenticated business account instead of using a static placeholder address. The wallet address is already available through the BusinessContext but is not currently being utilized in the funds view of the ReceiveModal.

## Requirements

### Requirement 1

**User Story:** As a user, I want to see my actual wallet address in the receive funds view, so that I can share the correct address for receiving crypto payments.

#### Acceptance Criteria

1. WHEN a user opens the ReceiveModal and navigates to the funds view THEN the system SHALL display the user's actual wallet address from their business account
2. WHEN the user's wallet address is not available or null THEN the system SHALL display a fallback message indicating the address is not available
3. WHEN the user copies the wallet address THEN the system SHALL copy the actual wallet address to the clipboard, not a static placeholder

### Requirement 2

**User Story:** As a user, I want the QR code to contain my actual wallet address, so that others can scan it to send payments to the correct address.

#### Acceptance Criteria

1. WHEN the funds view displays a QR code THEN the QR code SHALL contain the user's actual wallet address from their business account
2. WHEN the user's wallet address is not available THEN the QR code SHALL either not be displayed or show an appropriate placeholder state

### Requirement 3

**User Story:** As a user, I want to see loading states while my wallet address is being fetched, so that I understand the system is working to retrieve my information.

#### Acceptance Criteria

1. WHEN the business details are still loading THEN the funds view SHALL display appropriate loading indicators
2. WHEN there is an error fetching business details THEN the system SHALL display an error message with option to retry
3. WHEN the wallet address becomes available THEN the loading state SHALL be replaced with the actual address display