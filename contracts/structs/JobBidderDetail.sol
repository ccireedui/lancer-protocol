// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./BidderDetail.sol";

struct JobBidderDetail {
  uint bidderMinAmount;
  uint bidDeadline;
  BidderDetail chosenBidder;
  uint chosenBidderId;
  uint chosenBidderAmount;
  address chosenBidderAddress;
}
