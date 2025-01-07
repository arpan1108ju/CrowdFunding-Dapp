// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

/**
 * @title CrowdFunding Contract
 * @dev A decentralized crowdfunding platform for creating campaigns, making donations, and managing funds.
 */
contract CrowdFunding {
    struct Campaign {
        address owner;               // Campaign creator's address
        string title;                // Campaign title
        string description;          // Campaign description
        string campaignType;         // Type of campaign
        uint256 target;              // Funding target amount
        uint256 deadline;            // Campaign deadline (timestamp)
        uint256 amountCollected;     // Total amount collected
        string image;                // Image URL for the campaign
        address[] donators;          // List of donator addresses
        uint256[] donations;         // Corresponding donation amounts
        bool withdrawn;              // Whether funds have been withdrawn
        bool canceled;               // Whether the campaign is canceled
    }

    struct PaymentDetail {
        uint256 campaignId;          // Associated campaign ID
        uint256 amount;              // Payment amount
        uint256 timestamp;           // Payment timestamp
        string paymentType;          // Payment type (e.g., "donation", "withdrawal", "refund")
    }

    mapping(uint256 => Campaign) public campaigns; // Maps campaign ID to Campaign struct
    mapping(address => PaymentDetail[]) public userPayments; // Maps user address to their payment history

    uint256 public numberOfCampaigns = 0;

    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed owner,
        string title,
        uint256 target,
        uint256 deadline,
        string image
    );

    event DonationReceived(
        uint256 indexed campaignId,
        address indexed owner,
        address indexed donator,
        uint256 amount
    );

    event CampaignAmountUpdated(
        uint256 indexed campaignId,
        address indexed owner,
        uint256 amountCollected
    );

    event FundsWithdrawn(uint256 indexed campaignId, address indexed owner, uint256 amount);
    event CampaignCanceled(uint256 indexed campaignId, address indexed owner);
    event DonationRefunded(uint256 indexed campaignId, address indexed donator);

    /**
     * @notice Creates a new crowdfunding campaign.
     * @param _owner Address of the campaign creator
     * @param _title Title of the campaign
     * @param _description Description of the campaign
     * @param _campaignType Type of the campaign
     * @param _target Target amount to be raised
     * @param _deadline Deadline for the campaign (timestamp)
     * @param _image URL of the campaign image
     * @return The ID of the created campaign
     */
    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        string memory _campaignType,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        require(_deadline > block.timestamp, "The deadline should be a date in the future.");
        require(_owner == msg.sender, "Only owner creates the campaign");

        Campaign storage campaign = campaigns[numberOfCampaigns];
        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.campaignType = _campaignType;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;
        campaign.withdrawn = false;
        campaign.canceled = false;

        emit CampaignCreated(numberOfCampaigns, _owner, _title, _target, _deadline, _image);
        numberOfCampaigns++;

        return numberOfCampaigns - 1;
    }

    /**
     * @notice Allows users to donate to a specific campaign.
     * @param _id ID of the campaign to donate to
     */
    function donateToCampaign(uint256 _id) public payable {
        require(_id < numberOfCampaigns, "Invalid id");
        require(msg.value > 0, "Cannot donate 0 ether");

        Campaign storage campaign = campaigns[_id];
        require(campaign.amountCollected + msg.value <= campaign.target, "Should not exceed campaign target");
        require(!campaign.canceled, "Cannot donate to a canceled campaign");

        campaign.amountCollected += msg.value;
        campaign.donators.push(msg.sender);
        campaign.donations.push(msg.value);

        userPayments[msg.sender].push(PaymentDetail({
            campaignId: _id,
            amount: msg.value,
            timestamp: block.timestamp,
            paymentType: "donation"
        }));

        emit DonationReceived(_id, campaign.owner, msg.sender, msg.value);
        emit CampaignAmountUpdated(_id, campaign.owner, campaign.amountCollected);
    }

    /**
     * @notice Allows the campaign owner to withdraw funds after the deadline.
     * @param _id ID of the campaign to withdraw funds from
     */
    function withdraw(uint256 _id) public {
        require(_id < numberOfCampaigns, "Invalid id");

        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the owner can withdraw");
        require(block.timestamp >= campaign.deadline, "Cannot withdraw before the deadline");
        require(!campaign.withdrawn, "Funds already withdrawn");
        require(campaign.amountCollected > 0, "No funds to withdraw");

        uint256 amount = campaign.amountCollected;
        (bool sent, ) = payable(campaign.owner).call{value: amount}("");
        require(sent, "Withdrawal failed");

        campaign.withdrawn = true;

        userPayments[msg.sender].push(PaymentDetail({
            campaignId: _id,
            amount: amount,
            timestamp: block.timestamp,
            paymentType: "withdrawal"
        }));

        emit FundsWithdrawn(_id, campaign.owner, amount);
    }

    /**
     * @notice Retrieves the payment history of a user.
     * @param _user Address of the user
     * @return An array of PaymentDetail structs
     */
    function paymentDetails(address _user) public view returns (PaymentDetail[] memory) {
        return userPayments[_user];
    }

    /**
     * @notice Retrieves the list of donators and their donations for a campaign.
     * @param _id ID of the campaign
     * @return Arrays of donator addresses and their corresponding donation amounts
     */
    function getDonators(uint256 _id) public view returns (address[] memory, uint256[] memory) {
        require(_id < numberOfCampaigns, "Invalid id");
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    /**
     * @notice Retrieves all campaigns.
     * @return An array of all Campaign structs
     */
    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for (uint256 i = 0; i < numberOfCampaigns; i++) {
            allCampaigns[i] = campaigns[i];
        }

        return allCampaigns;
    }

    /**
     * @notice Retrieves a campaign by its ID.
     * @param _id ID of the campaign
     * @return The Campaign struct
     */
    function getCampaignById(uint256 _id) public view returns (Campaign memory) {
        require(_id < numberOfCampaigns, "Invalid id");
        return campaigns[_id];
    }

    /**
     * @notice Cancels an active campaign and refunds all donors.
     * @param _id ID of the campaign to cancel
     */
    function cancelCampaign(uint256 _id) public {
        require(_id < numberOfCampaigns, "Invalid id");

        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the owner can cancel the campaign");
        require(!campaign.canceled, "Campaign is already canceled");
        require(block.timestamp < campaign.deadline, "Cannot cancel after the deadline");

         for (uint256 i = 0; i < campaign.donators.length; i++) {
            address donator = campaign.donators[i];
            uint256 donationAmount = campaign.donations[i];

            (bool refunded, ) = payable(donator).call{value: donationAmount}("");
            require(refunded, "Refund failed for one of the donators");
            userPayments[donator].push(PaymentDetail({
            campaignId: _id,
            amount: donationAmount,
            timestamp: block.timestamp,
            paymentType : "refund"
            }));

            emit DonationRefunded(_id,donator);

        }

        campaign.canceled = true;

        emit CampaignCanceled(_id,campaign.owner);
    }


}