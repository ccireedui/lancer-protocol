// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// Pending  - 0
// PaymentReceived - 1,
// Bidding  - 2
// Started  - 3
// Rating - 4
// Payment - 5
// Finished - 6
// Canceled - 7
enum JobStatus {
  Pending,
  PaymentReceived,
  Bidding,
  Started,
  Rating,
  Payment,
  Finished,
  Canceled
}
