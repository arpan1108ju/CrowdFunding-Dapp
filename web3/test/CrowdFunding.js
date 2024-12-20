const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFunding Contract", function () {
  let CrowdFunding;
  let crowdFunding;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Deploy the CrowdFunding contract
    CrowdFunding = await ethers.deployContract("CrowdFunding");
    [owner, addr1, addr2] = await ethers.getSigners();
    crowdFunding = await CrowdFunding;
  });

  it("should create a campaign successfully", async function () {
    const now = Math.floor(Date.now() / 1000);
    const deadline = now + 3600; // 1 hour from now
    const target = ethers.parseEther("5"); // 5 ETH target

    const tx = await crowdFunding.createCampaign(
      owner.address,
      "Build a School",
      "A campaign to build a school.",
      target,
      deadline,
      "https://example.com/image.jpg"
    );
    const receipt = await tx.wait();


    // expect(receipt.events[0].event).to.equal("CampaignCreated");
    expect(receipt.logs[0].fragment.name).to.equal("CampaignCreated");
    expect(await crowdFunding.numberOfCampaigns()).to.equal(1);
  });

  it("should not create a campaign if deadline is in the past", async function () {
    const now = Math.floor(Date.now() / 1000);
    const pastDeadline = now - 3600; // 1 hour ago
    const target = ethers.parseEther("5");

    await expect(
      crowdFunding.createCampaign(
        owner.address,
        "Invalid Campaign",
        "Past deadline.",
        target,
        pastDeadline,
        "https://example.com/image.jpg"
      )
    ).to.be.revertedWith("The deadline should be a date in the future.");
  });

  
  it("should fail to donate with an invalid campaign ID", async function () {
    const now = Math.floor(Date.now() / 1000);
    const deadline = now + 3600; // 1 hour from now
    const target = ethers.parseEther("5");

    await crowdFunding.createCampaign(
      owner.address,
      "Valid Campaign",
      "A test campaign.",
      target,
      deadline,
      "https://example.com/image.jpg"
    );

    // Trying to donate to an invalid campaign ID (non-existent, e.g., 99)
    await expect(
      crowdFunding.connect(addr1).donateToCampaign(99, { value: ethers.parseEther("1") })
    ).to.be.revertedWith("Invalid id");
  });

  it("should fail to retrieve donators with an invalid campaign ID", async function () {
    const now = Math.floor(Date.now() / 1000);
    const deadline = now + 3600; // 1 hour from now
    const target = ethers.parseEther("5");

    await crowdFunding.createCampaign(
      owner.address,
      "Valid Campaign",
      "A test campaign.",
      target,
      deadline,
      "https://example.com/image.jpg"
    );
    // Trying to get donators for a non-existent campaign ID (e.g., 99)
    await expect(crowdFunding.getDonators(99)).to.be.revertedWith("Invalid id");
  });

  ////////////////////////////////////////////////////////////////////////////


  it("should allow donation to a campaign", async function () {
    const now = Math.floor(Date.now() / 1000);
    const deadline = now + 3600;
    const target = ethers.parseEther("5");

    await crowdFunding.createCampaign(
      owner.address,
      "Support Coding Education",
      "A campaign to fund coding workshops.",
      target,
      deadline,
      "https://example.com/image.jpg"
    );

    const donationAmount = ethers.parseEther("1");
    await crowdFunding
      .connect(addr1)
      .donateToCampaign(0, { value: donationAmount });

    const campaigns = await crowdFunding.getCampaigns();
    expect(campaigns[0].amountCollected.toString()).to.equal(donationAmount.toString());
  });

  it("should fail to donate 0 ether", async function () {
    const now = Math.floor(Date.now() / 1000);
    const deadline = now + 3600;
    const target = ethers.parseEther("5");

    await crowdFunding.createCampaign(
      owner.address,
      "Zero Donation Test",
      "A campaign for testing zero donations.",
      target,
      deadline,
      "https://example.com/image.jpg"
    );

    await expect(
      crowdFunding.connect(addr1).donateToCampaign(0, { value: 0 })
    ).to.be.revertedWith("Cannot donate 0 ether");
  });

  it("should fail to donate if campaign target is exceeded", async function () {
    const now = Math.floor(Date.now() / 1000);
    const deadline = now + 3600;
    const target = ethers.parseEther("2");

    await crowdFunding.createCampaign(
      owner.address,
      "Overfund Test",
      "A campaign for testing overfunding.",
      target,
      deadline,
      "https://example.com/image.jpg"
    );

    const donationAmount = ethers.parseEther("3");
    await expect(
      crowdFunding.connect(addr1).donateToCampaign(0, { value: donationAmount })
    ).to.be.revertedWith("Should not exceed campaign target");
  });

  it("should return the correct list of donators and their donations", async function () {
    const now = Math.floor(Date.now() / 1000);
    const deadline = now + 3600;
    const target = ethers.parseEther("5");

    await crowdFunding.createCampaign(
      owner.address,
      "Donator Test",
      "A campaign for testing donators.",
      target,
      deadline,
      "https://example.com/image.jpg"
    );

    const donation1 = ethers.parseEther("1");
    const donation2 = ethers.parseEther("2");

    await crowdFunding.connect(addr1).donateToCampaign(0, { value: donation1 });
    await crowdFunding.connect(addr2).donateToCampaign(0, { value: donation2 });

    const [donators, donations] = await crowdFunding.getDonators(0);

    expect(donators).to.deep.equal([addr1.address, addr2.address]);
    expect(donations.map((d) => d.toString())).to.deep.equal([
      donation1.toString(),
      donation2.toString(),
    ]);
  });

  it("should return all campaigns", async function () {
    const now = Math.floor(Date.now() / 1000);
    const deadline1 = now + 3600;
    const deadline2 = now + 7200;

    const target1 = ethers.parseEther("3");
    const target2 = ethers.parseEther("4");

    await crowdFunding.createCampaign(
      owner.address,
      "Campaign 1",
      "Description for campaign 1.",
      target1,
      deadline1,
      "https://example.com/image1.jpg"
    );

    await crowdFunding.createCampaign(
      owner.address,
      "Campaign 2",
      "Description for campaign 2.",
      target2,
      deadline2,
      "https://example.com/image2.jpg"
    );

    const campaigns = await crowdFunding.getCampaigns();
    expect(campaigns.length).to.equal(2);
    expect(campaigns[0].title).to.equal("Campaign 1");
    expect(campaigns[1].title).to.equal("Campaign 2");
  });
});
