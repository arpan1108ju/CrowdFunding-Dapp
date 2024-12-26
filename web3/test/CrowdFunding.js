const { expect } = require("chai");
const { ethers , network } = require("hardhat");

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
      "Education",
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
        "Invalid",
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
      "Test",
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
      "Test",
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
      "Workshops",
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
      "Test",
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
      "Test",
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
      "Test",
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

  it("should return the correct campaign details by ID", async function () {
    const now = Math.floor(Date.now() / 1000);
    const deadline = now + 3600; // 1 hour from now
    const target = ethers.parseEther("5"); // 5 ETH target
  
    // Create a new campaign
    await crowdFunding.createCampaign(
      owner.address,
      "Test Campaign",
      "A detailed description for testing getCampaignById.",
      "Education",
      target,
      deadline,
      "https://example.com/image.jpg"
    );
  
    // Fetch the campaign details by ID (ID = 0 for the first campaign)
    const campaign = await crowdFunding.getCampaignById(0);
  
    // Validate the returned campaign details
    expect(campaign.owner).to.equal(owner.address);
    expect(campaign.title).to.equal("Test Campaign");
    expect(campaign.description).to.equal("A detailed description for testing getCampaignById.");
    expect(campaign.target.toString()).to.equal(target.toString());
    expect(campaign.deadline).to.equal(deadline);
    expect(campaign.image).to.equal("https://example.com/image.jpg");
    expect(campaign.amountCollected.toString()).to.equal("0");
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
      "Image 1",
      target1,
      deadline1,
      "https://example.com/image1.jpg"
    );

    await crowdFunding.createCampaign(
      owner.address,
      "Campaign 2",
      "Description for campaign 2.",
      "Image 2",
      target2,
      deadline2,
      "https://example.com/image2.jpg"
    );

    const campaigns = await crowdFunding.getCampaigns();
    expect(campaigns.length).to.equal(2);
    expect(campaigns[0].title).to.equal("Campaign 1");
    expect(campaigns[1].title).to.equal("Campaign 2");
  });

  
// === New Tests for `isDonation` ===
it("should record donation payment details correctly", async function () {
  const now = Math.floor(Date.now() / 1000);
  const deadline = now + 3600;
  const target = ethers.parseEther("5");

  await crowdFunding.createCampaign(
    owner.address,
    "Support Education",
    "A campaign for education support.",
    "Image",
    target,
    deadline,
    "https://example.com/image.jpg"
  );

  const donationAmount = ethers.parseEther("2");
  await crowdFunding
    .connect(addr1)
    .donateToCampaign(0, { value: donationAmount });

  const payments = await crowdFunding.paymentDetails(addr1.address);

  expect(payments.length).to.equal(1);
  expect(payments[0].campaignId).to.equal(0);
  expect(payments[0].amount.toString()).to.equal(donationAmount.toString());
  expect(payments[0].paymentType).to.equal("donation");
});


// === Existing and New Tests Together ===
it("should fail to withdraw if already withdrawn", async function () {
  const now = Math.floor(Date.now() / 1000);
  const deadline = now + 3600;
  const target = ethers.parseEther("5");

  await crowdFunding.createCampaign(
    owner.address,
    "Duplicate Withdraw Test",
    "A campaign for duplicate withdrawal testing.",
    "Image",
    target,
    deadline,
    "https://example.com/image.jpg"
  );

  const donationAmount = ethers.parseEther("5");
  await crowdFunding
    .connect(addr1)
    .donateToCampaign(0, { value: donationAmount });

  // mine 1000 blocks with an interval of 1 minute
  await network.provider.send("hardhat_mine", ["0x3e8", "0x3c"]);

  const block = await ethers.provider.getBlock("latest");
  // console.log('bl tsp 1 ',block.timestamp);

  // Withdraw funds once
  await crowdFunding.connect(owner).withdraw(0);

  // Attempting to withdraw again should fail
  await expect(crowdFunding.connect(owner).withdraw(0)).to.be.revertedWith(
    "Funds already withdrawn"
  );
});



it("should allow the owner to withdraw funds and record withdrawal details", async function () {
  // console.log('bl tsp 2',block.timestamp);
  // console.log('now ',Date.now());
  const block = await ethers.provider.getBlock("latest");
  const now = Math.floor(block.timestamp);
  const deadline = now + 3600;
  const target = ethers.parseEther("5");

  await crowdFunding.createCampaign(
    owner.address,
    "Withdrawal Test",
    "A campaign for withdrawal testing.",
    "Image",
    target,
    deadline,
    "https://example.com/image.jpg"
  );

  const donationAmount = ethers.parseEther("5");
  await crowdFunding
    .connect(addr1)
    .donateToCampaign(0, { value: donationAmount });

  
 // mine 1000 blocks with an interval of 1 minute
  await network.provider.send("hardhat_mine", ["0x3e8", "0x3c"]);

  // Withdraw funds
  await crowdFunding.connect(owner).withdraw(0);

  const payments = await crowdFunding.paymentDetails(owner.address);

  // console.log('payment details');
  // console.log(payments);

  expect(payments.length).to.equal(1);
  expect(payments[0].campaignId).to.equal(0);
  expect(payments[0].amount.toString()).to.equal(donationAmount.toString());
  expect(payments[0].paymentType).to.equal("withdrawal");
});



it("should allow the owner to cancel the campaign and refund all donators", async function () {
  const block = await ethers.provider.getBlock("latest");
  const now = Math.floor(block.timestamp);
  const deadline = now + 3600; // 1 hour from now
  const target = ethers.parseEther("5");

  // Create a campaign
  await crowdFunding.createCampaign(
    owner.address,
    "Cancel Test",
    "A campaign to test cancellation.",
    "Image",
    target,
    deadline,
    "https://example.com/image.jpg"
  );

  const donationAmount1 = ethers.parseEther("1");
  const donationAmount2 = ethers.parseEther("2");

  // Addr1 and Addr2 donate to the campaign
  await crowdFunding.connect(addr1).donateToCampaign(0, { value: donationAmount1 });
  await crowdFunding.connect(addr2).donateToCampaign(0, { value: donationAmount2 });

  // Capture the balances of the donators before cancellation
  const addr1BalanceBefore = await ethers.provider.getBalance(addr1.address);
  const addr2BalanceBefore = await ethers.provider.getBalance(addr2.address);

  // Cancel the campaign
  const tx = await crowdFunding.connect(owner).cancelCampaign(0);
  const receipt = await tx.wait();

  // Expect event
  expect(receipt.logs[0].fragment.name).to.equal("DonationRefunded");
  expect(receipt.logs[1].fragment.name).to.equal("DonationRefunded");
  expect(receipt.logs[2].fragment.name).to.equal("CampaignCanceled");

  // Check that the campaign is canceled
  const campaign = await crowdFunding.campaigns(0);
  expect(campaign.canceled).to.equal(true);

  // Ensure both donators were refunded
  const addr1BalanceAfter = await ethers.provider.getBalance(addr1.address);
  const addr2BalanceAfter = await ethers.provider.getBalance(addr2.address);

  expect(addr1BalanceAfter - addr1BalanceBefore).to.equal(donationAmount1);
  expect(addr2BalanceAfter - addr2BalanceBefore).to.equal(donationAmount2);

  // Verify the refund details in `userPayments` for addr1 and addr2
  const addr1Payments = await crowdFunding.paymentDetails(addr1.address);
  const addr2Payments = await crowdFunding.paymentDetails(addr2.address);

  expect(addr1Payments.length).to.equal(2);
  expect(addr1Payments[1].paymentType).to.equal("refund");
  expect(addr1Payments[1].amount).to.equal(donationAmount1);

  expect(addr2Payments.length).to.equal(2);
  expect(addr2Payments[1].paymentType).to.equal("refund");
  expect(addr2Payments[1].amount).to.equal(donationAmount2);
});


it("should fail to cancel a non-existent campaign", async function () {
  await expect(crowdFunding.connect(owner).cancelCampaign(99)).to.be.revertedWith("Invalid id");
});

it("should fail to cancel a campaign after the deadline", async function () {
  const block = await ethers.provider.getBlock("latest");
  const now = Math.floor(block.timestamp);
  const deadline = now + 3600;
  const target = ethers.parseEther("5");

  await crowdFunding.createCampaign(
    owner.address,
    "Expired Campaign",
    "A campaign that will expire before cancellation.",
    "Image",
    target,
    deadline,
    "https://example.com/image.jpg"
  );

  const donationAmount = ethers.parseEther("1");
  await crowdFunding.connect(addr1).donateToCampaign(0, { value: donationAmount });

  // mine 1000 blocks with an interval of 1 minute
  await network.provider.send("hardhat_mine", ["0x3e8", "0x3c"]);

  // Attempting to cancel after the deadline should fail
  await expect(crowdFunding.connect(owner).cancelCampaign(0)).to.be.revertedWith("Cannot cancel after the deadline");
});

// it("should fail to cancel a campaign if the owner already withdrew funds", async function () {
//   const block = await ethers.provider.getBlock("latest");
//   const now = Math.floor(block.timestamp);
//   const deadline = now + 3600;
//   const target = ethers.parseEther("5");

//   await crowdFunding.createCampaign(
//     owner.address,
//     "Withdrawn Campaign",
//     "A campaign to test cancel after withdrawal.",
//     target,
//     deadline,
//     "https://example.com/image.jpg"
//   );

//   const donationAmount = ethers.parseEther("5");
//   await crowdFunding.connect(addr1).donateToCampaign(0, { value: donationAmount });

//   // mine 1000 blocks with an interval of 1 minute
//   await network.provider.send("hardhat_mine", ["0x3e8", "0x3c"]);

//   await crowdFunding.connect(owner).withdraw(0);

//   // Attempting to cancel after withdrawal should fail
//   await expect(crowdFunding.connect(owner).cancelCampaign(0)).to.be.revertedWith("Cannot cancel a campaign after funds are withdrawn");
// });

it("should fail to cancel a campaign if already canceled", async function () {
  const block = await ethers.provider.getBlock("latest");
  const now = Math.floor(block.timestamp);
  const deadline = now + 3600;
  const target = ethers.parseEther("5");

  await crowdFunding.createCampaign(
    owner.address,
    "Already Canceled Campaign",
    "A campaign that is already canceled.",
    "Cancel test",
    target,
    deadline,
    "https://example.com/image.jpg"
  );

  // Cancel the campaign once
  await crowdFunding.connect(owner).cancelCampaign(0);

  // Attempting to cancel again should fail
  await expect(crowdFunding.connect(owner).cancelCampaign(0)).to.be.revertedWith("Campaign is already canceled");
});

it("should fail to cancel a campaign by a non-owner", async function () {
  const block = await ethers.provider.getBlock("latest");
  const now = Math.floor(block.timestamp);
  const deadline = now + 3600;
  const target = ethers.parseEther("5");

  await crowdFunding.createCampaign(
    owner.address,
    "Non-Owner Cancel",
    "A campaign that should not be canceled by non-owners.",
    "Cancel test",
    target,
    deadline,
    "https://example.com/image.jpg"
  );

  // Attempting to cancel by someone other than the owner should fail
  await expect(crowdFunding.connect(addr1).cancelCampaign(0)).to.be.revertedWith("Only the owner can cancel the campaign");
});



});
////////
