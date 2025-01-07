# CrowdFunding Smart Contract Technical Report

## 1. Data Structures

### 1.1 Campaign Structure

The Campaign structure serves as the fundamental data model for each crowdfunding campaign:

**Ownership and Identity**

owner: Address storing campaign creator's wallet address
title: String storing campaign name
description: String containing detailed campaign information
campaignType: String categorizing campaign type
image: String storing campaign image URL

**Financial Parameters**

target: uint256 storing fundraising goal amount
amountCollected: uint256 tracking total received donations
donators: Array of addresses storing all donor wallet addresses
donations: Array of uint256 storing corresponding donation amounts

**Status Tracking**
deadline: uint256 storing campaign end timestamp
withdrawn: Boolean indicating if funds have been withdrawn
canceled: Boolean indicating if campaign is canceled

### 1.2 PaymentDetail Structure

Tracks individual transaction records with:

campaignId: uint256 linking payment to specific campaign
amount: uint256 storing transaction value
timestamp: uint256 recording transaction time
paymentType: String indicating transaction type (donation/withdrawal/refund)

## 2. State Management

### 2.1 Primary State Variables

**Campaign Storage**

- `campaigns`: Mapping from uint256 to Campaign struct
  - Stores all campaign data indexed by campaign ID
  - Enables direct campaign lookup and modification

**Payment History**

- `userPayments`: Mapping from address to PaymentDetail array
  - Maintains user-specific transaction histories
  - Enables payment tracking per user

**Campaign Counter**

- `numberOfCampaigns`: uint256 tracking total campaigns
  - Serves as campaign ID generator
  - Used for validation and enumeration

## 3. Event System

### 3.1 Campaign Lifecycle Events

- `CampaignCreated`: Emitted on new campaign creation
  - Parameters: campaignId, owner, title, target, deadline, image
- `CampaignCanceled`: Emitted when campaign is terminated

  - Parameters: campaignId, owner

- `CampaignAmountUpdated`: Tracks funding changes
  - Parameters: campaignId, owner, amountCollected

### 3.2 Financial Transaction Events

- `DonationReceived`: Records new donations

  - Parameters: campaignId, owner, donator, amount

- `FundsWithdrawn`: Tracks withdrawals

  - Parameters: campaignId, owner, amount

- `DonationRefunded`: Monitors refunds
  - Parameters: campaignId, donator

## 4. Core Functionalities

### 4.1 Campaign Management Functions

**createCampaign()**

- Parameters: owner, title, description, campaignType, target, deadline, image
- Creates new campaign with provided details
- Validates deadline and ownership
- Returns unique campaign ID

**getCampaignById()**

- Parameters: campaign ID
- Returns complete campaign details for specific ID
- Includes validation checks

**getCampaigns()**

- Returns array of all created campaigns
- No parameters required
- Used for campaign listing

### 4.2 Financial Operation Functions

**donateToCampaign()**

- Parameters: campaign ID
- Processes incoming donations
- Updates campaign funding status
- Records donor information
- Emits relevant events

**withdraw()**

- Parameters: campaign ID
- Processes fund withdrawal to campaign owner
- Validates withdrawal conditions
- Updates campaign status
- Records withdrawal transaction

**cancelCampaign()**

- Parameters: campaign ID
- Processes campaign cancellation
- Handles automatic donor refunds
- Updates campaign status
- Records refund transactions

### 4.3 Information Retrieval Functions

**paymentDetails()**

- Parameters: user address
- Returns complete payment history for specific user
- Includes all transaction types

**getDonators()**

- Parameters: campaign ID
- Returns two arrays:
  - Donor addresses
  - Corresponding donation amounts

## 5. Future Enhancement Possibilities

- Implementation of campaign categories
- Advanced payment tracking mechanisms
- Enhanced refund strategies
- Additional campaign management features
- Extended event logging system
