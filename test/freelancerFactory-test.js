const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FreelancerFactory - Flow Test", function () {

  beforeEach(async function () {
    let accounts = await ethers.getSigners();
    this.odko = accounts[0] 
    this.FreelancerFactory = await ethers.getContractFactory("FreelancerFactory");
    this.freelancerFactoryContract = await this.FreelancerFactory.deploy();
    await this.freelancerFactoryContract.deployed();
  });

  it("Create Freelancer - Success Test/Failure Test", async function () {

    let tx = await this.freelancerFactoryContract.createFreelancer(
      "mnkhod",
      "https://www.linkedin.com/in/mnkhod/",
      "mnkhod.dev@gmail.com"
    )

    await tx.wait();

    expect(await this.freelancerFactoryContract.freelancersLength()).to.equal(1);

    await expect(this.freelancerFactoryContract.createFreelancer(
      "mnkhzul",
      "https://www.linkedin.com/in/mnkhzul/",
      "mnkhzul.dev@gmail.com"
    )).to.be.revertedWith("ACCOUNT ALREADY HAS NFT");

    let nftId = await this.freelancerFactoryContract.addressToFreelancerId(this.odko.address)
    let nftAddress = await this.freelancerFactoryContract.nft() 
    const nft = await ethers.getContractAt('UnihornFreelancerNFT',nftAddress)
    const nftDetail = await nft.getFreelancerDetail(nftId)


    expect(nftDetail.username).to.equal("mnkhod");
    expect(nftDetail.linkedIn).to.equal("https://www.linkedin.com/in/mnkhod/");
    expect(nftDetail.email).to.equal("mnkhod.dev@gmail.com");
    expect(nftDetail.jobsFinished.length).to.equal(0);
    expect(nftDetail.jobsBidding.length).to.equal(0);
    expect(nftDetail.jobsStarted.length).to.equal(0);
  });

});

