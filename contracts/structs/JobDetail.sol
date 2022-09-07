// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../enums/JobStatus.sol";

struct JobDetail {
  string name;
  string description;

  uint maxFreelancerAmount;
  uint paymentAmount;

  JobStatus currentStatus;

  address client;

  uint projectDeadline;

}
