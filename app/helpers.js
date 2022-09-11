import { ethers } from "ethers";
import ClientFactoryAbi from './abi/ClientFactory.json';
import UnihornClientNftAbi from './abi/UnihornClientNFT.json';

import JobFactoryAbi from './abi/JobFactory.json';
import UnihornJobNftAbi from './abi/UnihornJobNFT.json';

import FreelancerFactoryAbi from './abi/FreelancerFactory.json';
import UnihornFreelancerNftAbi from './abi/UnihornFreelancerNFT.json';
import GeneratedAddresses from './genAddresses.json';

export const contractAddresses = {
  "clientFactory" : GeneratedAddresses.clientFactory,
  "freelancerFactory" : GeneratedAddresses.freelancerFactory,
  "jobFactory" : GeneratedAddresses.jobFactory,
}

async function getEtherEssentials(){
  const userAddress = window.ethereum.selectedAddress
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  return {
    provider,
    signer,
    userAddress
  }
}

export async function getClientRelatedContracts(){
  const { provider,signer,userAddress } = await getEtherEssentials()
  const factoryContract = new ethers.Contract(contractAddresses.clientFactory, ClientFactoryAbi, provider);
  const nftAddress = await factoryContract.nft()
  const nftContract = new ethers.Contract(nftAddress, UnihornClientNftAbi, provider);

  return {
    provider,
    signer,
    factoryContract,
    nftAddress,
    nftContract,
    userAddress,
  }
}

export async function getFreelancerRelatedContracts(){
  const { provider,signer,userAddress } = await getEtherEssentials()

  const factoryContract = new ethers.Contract(contractAddresses.freelancerFactory, FreelancerFactoryAbi, provider);
  const nftAddress = await factoryContract.nft()
  const nftContract = new ethers.Contract(nftAddress, UnihornFreelancerNftAbi, provider);

  return {
    provider,
    signer,
    factoryContract,
    nftAddress,
    nftContract,
    userAddress,
  }
}

export async function getJobRelatedContracts(){
  const { provider,signer,userAddress } = await getEtherEssentials()

  const factoryContract = new ethers.Contract(contractAddresses.jobFactory, JobFactoryAbi, provider);
  const nftAddress = await factoryContract.nft()
  const nftContract = new ethers.Contract(nftAddress, UnihornJobNftAbi, provider);

  return {
    provider,
    signer,
    factoryContract,
    nftAddress,
    nftContract,
    userAddress,
  }
}
