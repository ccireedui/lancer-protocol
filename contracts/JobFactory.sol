// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./nfts/UnihornJobNFT.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IUnihornClientNFT.sol";

contract JobFactory is AccessControl {
  mapping(address => uint[]) public clientAddressToClientJobs;
  mapping(address => uint) public clientAddressToClientJobsLength;
  mapping(uint => address) public jobIdToClientAddress;

  uint[] public jobs;

  UnihornJobNFT public nft;
  IUnihornClientNFT public clientNft;

  constructor(address _clientNft,address _freelancerNft) {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    nft = new UnihornJobNFT(address(this),_freelancerNft);
    clientNft = IUnihornClientNFT(_clientNft);
  }

  function createJob(
      string memory _jobName,
      string memory _jobDescription,
      uint _maxFreelancerAmount,
      uint _paymentAmount,
      uint _bidderMinAmount,
      uint _bidDeadline,
      uint _milestonePhaseAmount,
      uint _milestonePhaseDeadline,
      uint _projectDeadline
  ) external {
    require(clientNft.balanceOf(msg.sender) > 0,"USER ISN'T CLIENT");

    uint id = nft.jobMint(
      msg.sender,
      _jobName,
      _jobDescription,
      _maxFreelancerAmount,
      _paymentAmount,
      _bidderMinAmount,
      _bidDeadline,
      _milestonePhaseAmount,
      _milestonePhaseDeadline,
      _projectDeadline
    );

    jobs.push(id);
    clientAddressToClientJobs[msg.sender].push(id);
    clientAddressToClientJobsLength[msg.sender] += 1;
    jobIdToClientAddress[id] = msg.sender;
  }

  function getClientAllJobs() external view returns(uint[] memory){
    return clientAddressToClientJobs[msg.sender];
  }

  function getAllJobs() external view returns(uint[] memory) {
    return jobs;
  }

  function getJobsLength() external view returns(uint) {
    return jobs.length;
  }

}
