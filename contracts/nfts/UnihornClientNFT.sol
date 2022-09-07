// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "../structs/ClientDetail.sol";

contract UnihornClientNFT is ERC721, AccessControl {
    using Counters for Counters.Counter;

    ClientDetail[] public clientDetails;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _tokenIdCounter;

    constructor(address _clientFactory) ERC721("UnihornClientNFT", "UNIH-CLIENT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, _clientFactory);
        _tokenIdCounter.increment();
    }

    function clientMint(
      address to,
      string memory _username,
      string memory _linkedIn,
      string memory _email
    ) external onlyRole(MINTER_ROLE) returns(uint) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);

        ClientDetail memory detail;
        detail.username = _username;
        detail.linkedIn = _linkedIn;
        detail.email = _email;

        clientDetails.push(detail);

        return tokenId;
    }

    function getClientDetail(uint id) external view returns(ClientDetail memory){
      return clientDetails[id-1];
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
