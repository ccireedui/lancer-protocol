// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "../structs/FreelancerDetail.sol";

contract UnihornFreelancerNFT is ERC721, AccessControl {
    using Counters for Counters.Counter;

    FreelancerDetail[] public freelancerDetails;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _tokenIdCounter;

    constructor(address _freelancerFactory) ERC721("UnihornFreelancerNFT", "UNIH-FREELANCER") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, _freelancerFactory);
        _tokenIdCounter.increment();
    }

    function freelancerMint(
      address to,
      string memory _username,
      string memory _linkedIn,
      string memory _email
    ) external onlyRole(MINTER_ROLE) returns(uint)  {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);

        FreelancerDetail memory detail;
        detail.username = _username;
        detail.linkedIn = _linkedIn;
        detail.email = _email;

        freelancerDetails.push(detail);

        return tokenId;
    }

    function getFreelancerDetail(uint id) external view returns(FreelancerDetail memory){
      return freelancerDetails[id-1];
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
