const path = require('path');
const hre = require("hardhat");

async function main() {
  const ClientFactory = await ethers.getContractFactory("ClientFactory");
  const clientFactoryContract = await ClientFactory.deploy();
  await clientFactoryContract.deployed();

  const FreelancerFactory = await ethers.getContractFactory("FreelancerFactory");
  const freelancerFactoryContract = await FreelancerFactory.deploy();
  await freelancerFactoryContract.deployed();

  let clientNftAddress = await clientFactoryContract.nft();
  let freelancerNftAddress = await freelancerFactoryContract.nft();

  const JobFactory = await ethers.getContractFactory("JobFactory");
  const jobFactoryContract = await JobFactory.deploy(clientNftAddress,freelancerNftAddress);
  await jobFactoryContract.deployed();

  console.log("clientFactoryContract deployed to:", clientFactoryContract.address);
  console.log("freelancerFactoryContract deployed to:", freelancerFactoryContract.address);
  console.log("jobFactoryContract deployed to:", jobFactoryContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
