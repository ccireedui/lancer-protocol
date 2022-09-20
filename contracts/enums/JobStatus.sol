// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// Pending  - 0
// PaymentReceived - 1,
// Bidding  - 2
// SentAllBid - 3
// Started  - 4
// Rating - 5
// Payment - 6
// Finished - 7
// Canceled - 8
enum JobStatus {
  Pending,
  PaymentReceived,
  Bidding,
  SendingAllBid,
  Started,
  Rating,
  Payment,
  Finished,
  Canceled
}
