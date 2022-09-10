import { ethers } from "ethers";
import ClientFactoryAbi from './abi/ClientFactory.json';
import UnihornClientNftAbi from './abi/UnihornClientNFT.json';

import FreelancerFactoryAbi from './abi/FreelancerFactory.json';
import UnihornFreelancerNftAbi from './abi/UnihornFreelancerNFT.json';

export const contractAddresses = {
  "clientFactory" : "0x3F638BF778b062ED3e6c4B3081926a24433A86D0",
  "freelancerFactory" : "0xCAF97f4D4a22c1618Da6Cb0cf551eD2Ed34d61d7",
  "jobFactory" : "0x57ff17A85771c29319CA0a5e65cB749cC14801F8",
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
