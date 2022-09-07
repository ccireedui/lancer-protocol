// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

struct JobRateDetail {
  uint clientRate;
  uint freelancerRate;

  bool hasClientRated;
  bool hasFreelancerRated;
}
