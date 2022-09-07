const { expect } = require("chai");
const { ethers } = require("hardhat");
const moment = require("moment");

describe("JobFactory - Flow Test", function () {

  beforeEach(async function () {
    let accounts = await ethers.getSigners();
    this.odko = accounts[0] // JobFactory Owner
    this.zulaa = accounts[1] // Client

    this.amaraa = accounts[2] // FreeLancer
    this.boldoo = accounts[3] // FreeLancer
    this.nymaa = accounts[4] // FreeLancer

    this.ClientFactory = await ethers.getContractFactory("ClientFactory");
    this.clientFactoryContract = await this.ClientFactory.deploy();
    await this.clientFactoryContract.deployed();

    this.FreelancerFactory = await ethers.getContractFactory("FreelancerFactory");
    this.freelancerFactoryContract = await this.FreelancerFactory.deploy();
    await this.freelancerFactoryContract.deployed();

    this.clientNftAddress = await this.clientFactoryContract.nft() 
    this.freelancerNftAddress = await this.freelancerFactoryContract.nft() 

    this.JobFactory = await ethers.getContractFactory("JobFactory");
    this.jobFactoryContract = await this.JobFactory.deploy(this.clientNftAddress,this.freelancerNftAddress);
    await this.jobFactoryContract.deployed();

    await (await this.clientFactoryContract.connect(this.zulaa).createClient(
      "zulaa",
      "https://www.linkedin.com/in/zulaa/",
      "zulaa@gmail.com"
    )).wait()

    await (await this.freelancerFactoryContract.connect(this.amaraa).createFreelancer(
      "amaraa",
      "https://www.linkedin.com/in/amaraa/",
      "amaraa@gmail.com"
    )).wait()

    await (await this.freelancerFactoryContract.connect(this.boldoo).createFreelancer(
      "boldoo",
      "https://www.linkedin.com/in/boldoo/",
      "boldoo@gmail.com"
    )).wait()

    await (await this.freelancerFactoryContract.connect(this.nymaa).createFreelancer(
      "nymaa",
      "https://www.linkedin.com/in/nymaa/",
      "nymaa@gmail.com"
    )).wait()

    this.zulaaClientNftId = await this.clientFactoryContract.addressToClientId(this.zulaa.address)
    this.clientNft = await ethers.getContractAt('UnihornClientNFT',this.clientNftAddress)
    this.zulaaNftDetail = await this.clientNft.getClientDetail(this.zulaaClientNftId)
    let jobNftAddress = await this.jobFactoryContract.nft()
    this.jobNft = await ethers.getContractAt('UnihornJobNFT',jobNftAddress)
  });

  it("Create Job - Success Test/Failure Test", async function () {

    let blockNumber = await ethers.provider.getBlockNumber()
    let block = await ethers.provider.getBlock(blockNumber)
    let currentTimestamp = block.timestamp
    let bidderDeadline = moment.unix(currentTimestamp).add(5,"d").unix()
    let milestoneDeadline = moment.unix(currentTimestamp).add(1,"d").unix()
    let projectDeadline = moment.unix(currentTimestamp).add(10,"d").unix()

    await this.jobFactoryContract.connect(this.zulaa).createJob(
      "EnergyDrink Company Portfolio Website",
      "Website",
      2, // maxFreelancerAmount
      ethers.utils.parseEther('10'), // paymentAmount
      ethers.utils.parseEther('5'), // bidderMinAmount
      bidderDeadline,
      2, // milestonePhaseAmount
      milestoneDeadline,
      projectDeadline
    )

    await expect(this.jobFactoryContract.connect(this.amaraa).createJob(
      "Perfume Company Portfolio Website",
      "Website",
      2, // maxFreelancerAmount
      ethers.utils.parseEther('10'), // paymentAmount
      ethers.utils.parseEther('5'), // bidderMinAmount
      bidderDeadline,
      2, // milestonePhaseAmount
      milestoneDeadline,
      projectDeadline
    )).to.be.revertedWith("USER ISN'T CLIENT");

    expect(await this.jobFactoryContract.clientAddressToClientJobsLength(this.zulaa.address)).to.equal(1);
    expect(await this.jobFactoryContract.getJobsLength()).to.equal(1);

    let zulaasJobs = await this.jobFactoryContract.connect(this.zulaa.address).getClientAllJobs()
    let zulaaJobId = zulaasJobs[0].toNumber()

    let zulaaJobDetail = await this.jobNft.jobDetails(zulaaJobId)

    expect(zulaaJobDetail.name).to.equal("EnergyDrink Company Portfolio Website");
    expect(zulaaJobDetail.currentStatus).to.equal(0); // Pending


    // Payment Receive Process
    await expect(this.jobNft.sentPayment(zulaaJobId,{ value: ethers.utils.parseEther('11') })).to.be.revertedWith("NOT JOB OWNER");
    await expect(this.jobNft.connect(this.zulaa).sentPayment(zulaaJobId,{ value: ethers.utils.parseEther('11') })).to.be.revertedWith("PAYMENT AMOUNT WRONG");
    await this.jobNft.connect(this.zulaa).sentPayment(zulaaJobId,{
      value: ethers.utils.parseEther('10')
    })
    await expect(this.jobNft.connect(this.zulaa).sentPayment(zulaaJobId,{ value: ethers.utils.parseEther('11') })).to.be.revertedWith("NOT PENDING STATUS");
    zulaaJobDetail = await this.jobNft.jobDetails(zulaaJobId)
    expect((await this.jobNft.jobDetails(zulaaJobId)).currentStatus).to.equal(1); // PaymentReceived

    // Bidding Process
    await this.jobNft.connect(this.zulaa).startBiddingPhase(zulaaJobId)
    await expect(this.jobNft.connect(this.boldoo).startBiddingPhase(zulaaJobId)).to.be.revertedWith("NOT JOB OWNER");
    expect((await this.jobNft.jobDetails(zulaaJobId)).currentStatus).to.equal(2); // Bidding


    await this.jobNft.connect(this.boldoo).freelancerBid(zulaaJobId,{ value: ethers.utils.parseEther('5') });

    await expect(
      this.jobNft.connect(this.nymaa).freelancerBid(zulaaJobId,{ value: ethers.utils.parseEther('2') })
    ).to.be.revertedWith("NOT ABOVE BIDDER MIN AMOUNT");

    await this.jobNft.connect(this.nymaa).freelancerBid(zulaaJobId,{ value: ethers.utils.parseEther('5') });

    await expect(
      this.jobNft.connect(this.amaraa).freelancerBid(zulaaJobId,{ value: ethers.utils.parseEther('5') })
    ).to.be.revertedWith("MAX FREELANCER BIDDER REACHED");

    await expect(
      this.jobNft.connect(this.nymaa).chooseFreelancerPhase(zulaaJobId,1)
    ).to.be.revertedWith("NOT JOB OWNER");

    // Checking Started
    await this.jobNft.connect(this.zulaa).chooseFreelancerPhase(zulaaJobId,1);
    expect((await this.jobNft.jobDetails(zulaaJobId)).currentStatus).to.equal(3); // Started

    // Milestone
    await this.jobNft.connect(this.zulaa).approveMilestone(zulaaJobId);
    expect((await this.jobNft.jobDetails(zulaaJobId)).currentStatus).to.equal(3); // Started
    await this.jobNft.connect(this.zulaa).approveMilestone(zulaaJobId);
    expect((await this.jobNft.jobDetails(zulaaJobId)).currentStatus).to.equal(4); // Finished

    // Rate
    await this.jobNft.connect(this.zulaa).clientRateJob(zulaaJobId,5);
    await this.jobNft.connect(this.amaraa).freelancerRateJob(zulaaJobId,4);
    expect((await this.jobNft.jobDetails(zulaaJobId)).currentStatus).to.equal(5); // Rating

    console.log(await ethers.provider.getBalance(this.amaraa.address))
    // Payment
    await this.jobNft.connect(this.amaraa).paymentWithdraw(zulaaJobId);

    expect((await this.jobNft.jobDetails(zulaaJobId)).currentStatus).to.equal(6); // Finished
    console.log(await ethers.provider.getBalance(this.amaraa.address))

  });

});

