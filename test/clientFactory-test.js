const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ClientFactory - Flow Test", function () {

  beforeEach(async function () {
    let accounts = await ethers.getSigners();
    this.odko = accounts[0] 
    this.ClientFactory = await ethers.getContractFactory("ClientFactory");
    this.clientFactoryContract = await this.ClientFactory.deploy();
    await this.clientFactoryContract.deployed();
  });

  it("Create Client - Success Test/Failure Test", async function () {

    let tx = await this.clientFactoryContract.createClient(
      "mnkhod",
      "https://www.linkedin.com/in/mnkhod/",
      "mnkhod.dev@gmail.com"
    )

    await tx.wait();

    expect(await this.clientFactoryContract.clientsLength()).to.equal(1);

    await expect(this.clientFactoryContract.createClient(
      "mnkhzul",
      "https://www.linkedin.com/in/mnkhzul/",
      "mnkhzul.dev@gmail.com"
    )).to.be.revertedWith("ACCOUNT ALREADY HAS NFT");

    let nftId = await this.clientFactoryContract.addressToClientId(this.odko.address)
    let nftAddress = await this.clientFactoryContract.nft() 
    const nft = await ethers.getContractAt('UnihornClientNFT',nftAddress)
    const nftDetail = await nft.getClientDetail(nftId)


    // console.log(nftDetail)
    expect(nftDetail.username).to.equal("mnkhod");
    expect(nftDetail.linkedIn).to.equal("https://www.linkedin.com/in/mnkhod/");
    expect(nftDetail.email).to.equal("mnkhod.dev@gmail.com");
    expect(nftDetail.jobsCreated.length).to.equal(0);
  });

});

