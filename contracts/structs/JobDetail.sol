// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../enums/JobStatus.sol";
import "./JobMilestoneDetail.sol";

struct JobDetail {
  uint id;
  string name;
  string description;

  uint maxFreelancerAmount;
  uint paymentAmount;

  JobMilestoneDetail milestoneDetail;

  JobStatus currentStatus;

  address client;

  uint projectDeadline;

}
