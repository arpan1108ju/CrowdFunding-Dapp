// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
    }

    mapping(uint256 => Campaign) public campaigns; // id to campaign

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
        address indexed donator,
        uint256 amount
    );

    event CampaignAmountUpdated(
        uint256 indexed campaignId,
        uint256 amountCollected
    );

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        Campaign storage campaign = campaigns[numberOfCampaigns];

        require(_deadline > block.timestamp, "The deadline should be a date in the future.");
        require(_owner == msg.sender, "only owner creates the contract");

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;

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

    function donateToCampaign(uint256 _id) public payable {
        require(_id < numberOfCampaigns, "Invalid id");

        uint256 amount = msg.value;

        Campaign storage campaign = campaigns[_id];

        require(amount > 0, "Cannot donate 0 ether");
        require(campaign.amountCollected + amount <= campaign.target, "Should not exceed campaign target");

        (bool sent, ) = payable(campaign.owner).call{value: amount}("");

        if (sent) {
            campaign.amountCollected += amount;
            campaign.donators.push(msg.sender);
            campaign.donations.push(amount);

            emit DonationReceived(_id, msg.sender, amount);
            emit CampaignAmountUpdated(_id, campaign.amountCollected);
        }
        else {
           revert("Failed to send Ether to the campaign owner.");
        }
    }

    function getDonators(uint256 _id)
        public
        view
        returns (address[] memory, uint256[] memory)
    {
        require(_id < numberOfCampaigns, "Invalid id");
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for (uint256 i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];

            allCampaigns[i] = item;
        }

        return allCampaigns;
    }
}
