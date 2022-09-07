// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./interfaces/IUnihornClientNFT.sol";
import "./nfts/UnihornClientNFT.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ClientFactory is AccessControl {
  mapping(address => uint) public addressToClientId;
  mapping(address => bool) public clientHasNft;
  mapping(uint => address) public idToClientAddress;
  uint public clientsLength = 0;

  UnihornClientNFT public nft;

  constructor() {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    nft = new UnihornClientNFT(address(this));
  }

  function createClient(
    string memory _username,
    string memory _linkedIn,
    string memory _email
  ) external {
    require(clientHasNft[msg.sender] == false,"ACCOUNT ALREADY HAS NFT");

    uint id = nft.clientMint(
      msg.sender,
      _username,
      _linkedIn,
      _email
    );

    addressToClientId[msg.sender] = id;
    idToClientAddress[id] = msg.sender;
    clientHasNft[msg.sender] = true;

    clientsLength += 1;
  }

}
