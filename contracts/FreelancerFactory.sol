// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./interfaces/IUnihornFreelancerNFT.sol";
import "./nfts/UnihornFreelancerNFT.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract FreelancerFactory is AccessControl {
  mapping(address => uint) public addressToFreelancerId;
  mapping(address => bool) public freelancerHasNft;
  mapping(uint => address) public idToFreelancerAddress;
  uint public freelancersLength = 0;

  UnihornFreelancerNFT public nft;

  constructor() {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    nft = new UnihornFreelancerNFT(address(this));
  }

  function createFreelancer(
      string memory _username,
      string memory _linkedIn,
      string memory _email
  ) external {
    require(freelancerHasNft[msg.sender] == false,"ACCOUNT ALREADY HAS NFT");

    uint id = nft.freelancerMint(
      msg.sender,
      _username,
      _linkedIn,
      _email
    );

    addressToFreelancerId[msg.sender] = id;
    idToFreelancerAddress[id] = msg.sender;
    freelancerHasNft[msg.sender] = true;

    freelancersLength += 1;
  }

}
