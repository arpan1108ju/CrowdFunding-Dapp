// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        string campaignType;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        bool withdrawn;
        bool canceled;
    }

    struct PaymentDetail {
        uint256 campaignId;
        uint256 amount;
        uint256 timestamp;
        string paymentType;
    }

    mapping(uint256 => Campaign) public campaigns; // id to campaign
    mapping(address => PaymentDetail[]) public userPayments; // user address to their payment history

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

    event FundsWithdrawn(uint256 indexed campaignId,address indexed owner, uint256 amount);
    event CampaignCanceled(uint256 indexed campaignId,address indexed owner);
    event DonationRefunded(uint256 indexed campaignId,address indexed _donator);

    // Function to create a campaign
    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        string memory _campaignType,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        Campaign storage campaign = campaigns[numberOfCampaigns];

        require(_deadline > block.timestamp, "The deadline should be a date in the future.");
        require(_owner == msg.sender, "Only owner creates the campaign");

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

        emit CampaignCreated(
            numberOfCampaigns,
            _owner,
            _title,
            _target,
            _deadline,
            _image
        );

        numberOfCampaigns++;

        return numberOfCampaigns - 1;
    }

    // Function to donate to a campaign
    function donateToCampaign(uint256 _id) public payable {
        require(_id < numberOfCampaigns, "Invalid id");

        uint256 amount = msg.value;

        Campaign storage campaign = campaigns[_id];

        // require(block.timestamp < campaign.deadline, "Cannot fund after the deadline");
        require(amount > 0, "Cannot donate 0 ether");
        require(campaign.amountCollected + amount <= campaign.target, "Should not exceed campaign target");
        require(!campaign.canceled, "Cannot donate to a canceled campaign");

        campaign.amountCollected += amount;
        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);

        // Add payment details for the donator
        userPayments[msg.sender].push(PaymentDetail({
            campaignId: _id,
            amount: amount,
            timestamp: block.timestamp,
            paymentType : "donation"
        }));

        emit DonationReceived(_id,campaign.owner, msg.sender, amount);
        emit CampaignAmountUpdated(_id,campaign.owner, campaign.amountCollected);
    }

    // Function to withdraw funds (only by owner and after deadline)
    function withdraw(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];

        require(_id < numberOfCampaigns, "Invalid id");
        require(msg.sender == campaign.owner, "Only the owner can withdraw");
        require(block.timestamp >= campaign.deadline, "Cannot withdraw before the deadline");
        require(!campaign.withdrawn, "Funds already withdrawn");
        require(campaign.amountCollected > 0, "No funds to withdraw");

        uint256 amount = campaign.amountCollected;

        (bool sent, ) = payable(campaign.owner).call{value: amount}("");
        require(sent, "Withdrawal failed");

        campaign.withdrawn = true;

        // Add withdrawal details for the owner
        userPayments[msg.sender].push(PaymentDetail({
            campaignId: _id,
            amount: amount,
            timestamp: block.timestamp,
            paymentType : "withdrawal"
        }));

        emit FundsWithdrawn(_id,campaign.owner, amount);
    }

    // Function to get all payment details of a user
    function paymentDetails(address _user)
        public
        view
        returns (PaymentDetail[] memory)
    {
        return userPayments[_user];
    }

    function getDonators(uint256 _id)
        public
        view
        returns (address[] memory, uint256[] memory)
    {
        require(_id < numberOfCampaigns, "Invalid id");
        return (campaigns[_id].donators, campaigns[_id].donations);
    }


    // Function to get all campaigns
    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for (uint256 i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];
            allCampaigns[i] = item;
        }

        return allCampaigns;
    }

     function getCampaignById(uint256 _id) public view returns (Campaign memory) {
        require(_id < numberOfCampaigns, "Invalid id");
        return campaigns[_id];
    }

    function cancelCampaign(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];

        require(_id < numberOfCampaigns, "Invalid id");
        require(msg.sender == campaign.owner, "Only the owner can cancel the campaign");
        require(!campaign.canceled, "Campaign is already canceled");

        // may be a redundant case
        // require(!campaign.withdrawn, "Cannot cancel a campaign after funds are withdrawn");
        
        require(block.timestamp < campaign.deadline, "Cannot cancel after the deadline");

        // Refund all donors
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