// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "../interfaces/IUnihornFreelancerNFT.sol";

import "../structs/JobDetail.sol";
import "../structs/JobBidderDetail.sol";
import "../structs/JobMilestoneDetail.sol";
import "../structs/JobRateDetail.sol";

import "../structs/BidderDetail.sol";
// import "../structs/MilestoneDetail.sol";

import "../enums/JobStatus.sol";

contract UnihornJobNFT is ERC721, AccessControl {
    using Counters for Counters.Counter;

    JobDetail[] public jobDetails;
    JobBidderDetail[] public jobBidderDetails;
    JobMilestoneDetail[] public jobMilestoneDetails;
    JobRateDetail[] public jobRateDetails;

    mapping(uint => BidderDetail[]) public bidders;
    // mapping(uint => MilestoneDetail[]) public milestones;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _tokenIdCounter;

    IUnihornFreelancerNFT public freelancerNft;

    constructor(address _jobFactory,address _freelancerNft) ERC721("UnihornJobNFT", "UNIH-JOB") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, _jobFactory);
        freelancerNft = IUnihornFreelancerNFT(_freelancerNft);
    }

    function jobMint(
      address to,
      string memory _jobName,
      string memory _jobDescription,
      uint _maxFreelancerAmount,
      uint _paymentAmount,
      uint _bidderMinAmount,
      uint _bidDeadline,
      uint _milestonePhaseAmount,
      uint _milestonePhaseDeadline,
      uint _projectDeadline
    ) external onlyRole(MINTER_ROLE) returns(uint) {
      uint256 tokenId = _tokenIdCounter.current();
      _tokenIdCounter.increment();
      _safeMint(to, tokenId);

      JobDetail memory detail;
      JobBidderDetail memory bidder;
      JobMilestoneDetail memory milestone;

      detail.name = _jobName;
      detail.description = _jobDescription;
      detail.maxFreelancerAmount = _maxFreelancerAmount;
      detail.paymentAmount = _paymentAmount;
      detail.currentStatus = JobStatus.Pending;
      detail.projectDeadline = _projectDeadline;
      detail.client = to;

      bidder.bidderMinAmount = _bidderMinAmount;
      bidder.bidDeadline = _bidDeadline;
      
      milestone.milestoneAmount = _milestonePhaseAmount;
      milestone.milestoneDeadline = _milestonePhaseDeadline;

      jobDetails.push(detail);
      jobMilestoneDetails.push(milestone);
      jobBidderDetails.push(bidder);
      jobRateDetails.push(JobRateDetail(0,0,false,false));

      return tokenId;
    }

    // State Changing Functions

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}


    function sentPayment(uint jobId) payable external onlyJobOwner(jobId,msg.sender) onlyPendingStatus(jobId) {
      JobDetail storage detail = jobDetails[jobId];
      require(detail.paymentAmount == msg.value,"PAYMENT AMOUNT WRONG");

      detail.currentStatus = JobStatus.PaymentReceived;
    }

    function startBiddingPhase(uint jobId) external onlyJobOwner(jobId,msg.sender) onlyPaymentReceivedStatus(jobId) {
      JobDetail storage detail = jobDetails[jobId];
      detail.currentStatus = JobStatus.Bidding;
    }

    function freelancerBid(uint jobId) payable external onlyBiddingStatus(jobId) onlyFreelancer(msg.sender) {
      JobDetail memory detail = jobDetails[jobId];
      JobBidderDetail storage jobBiddersDetail = jobBidderDetails[jobId];
      require(bidders[jobId].length < detail.maxFreelancerAmount,"MAX FREELANCER BIDDER REACHED");
      require(jobBiddersDetail.bidderMinAmount <= msg.value,"NOT ABOVE BIDDER MIN AMOUNT");

      BidderDetail memory bidderDetail;
      bidderDetail.bidAmount = msg.value;
      bidderDetail.account = msg.sender;

      bidders[jobId].push(bidderDetail);
    }

    function chooseFreelancerPhase(uint jobId,uint bidderId) external onlyJobOwner(jobId,msg.sender) onlyBiddingStatus(jobId) {
      JobDetail storage detail = jobDetails[jobId];
      JobBidderDetail storage jobBidderDetail = jobBidderDetails[jobId];
      require(bidders[jobId].length > 0,"NOT ENOUGH FREELANCER BIDDERS");

      jobBidderDetail.chosenBidder = bidders[jobId][bidderId];
      jobBidderDetail.chosenBidderId = bidderId;

      jobBidderDetail.chosenBidderAddress = bidders[jobId][bidderId].account;
      jobBidderDetail.chosenBidderAmount = bidders[jobId][bidderId].bidAmount;
      detail.currentStatus = JobStatus.Started;
    }

    function approveMilestone(uint jobId) onlyJobOwner(jobId,msg.sender) onlyStartedStatus(jobId) external {
      JobDetail storage detail = jobDetails[jobId];
      JobMilestoneDetail storage milestoneDetail = jobMilestoneDetails[jobId];

      milestoneDetail.approvedMilestoneAmount += 1;

      uint approvedAmount = milestoneDetail.approvedMilestoneAmount;
      uint maxAmount = milestoneDetail.milestoneAmount;

      if(approvedAmount == maxAmount){
        detail.currentStatus = JobStatus.Rating;
      }   
    }

    function freelancerRateJob(uint jobId,uint rate) onlyFreelancer(msg.sender) onlyRatingStatus(jobId) external {
      require(rate <= 5,"INCORRECT RATE AMOUNT");
      JobDetail storage detail = jobDetails[jobId];
      JobRateDetail storage rateDetail = jobRateDetails[jobId];

      rateDetail.freelancerRate = rate;
      rateDetail.hasFreelancerRated = true;

      if(rateDetail.hasFreelancerRated == true && rateDetail.hasClientRated == true){
        detail.currentStatus = JobStatus.Payment;
      }
    }

    function clientRateJob(uint jobId,uint rate) onlyJobOwner(jobId,msg.sender) onlyRatingStatus(jobId) external {
      require(rate <= 5,"INCORRECT RATE AMOUNT");
      JobDetail storage detail = jobDetails[jobId];
      JobRateDetail storage rateDetail = jobRateDetails[jobId];

      rateDetail.clientRate = rate;
      rateDetail.hasClientRated = true;

      if(rateDetail.hasFreelancerRated == true && rateDetail.hasClientRated){
        detail.currentStatus = JobStatus.Payment;
      }
    }

    function paymentWithdraw(uint jobId) onlyFreelancer(msg.sender) onlyPaymentStatus(jobId) external {
      JobDetail storage detail = jobDetails[jobId];

      (bool success, ) = msg.sender.call{value: address(this).balance}("");
      require(success == true,"PAYMENT ERROR");

      detail.currentStatus = JobStatus.Finished;
    }

    function cancelJob(uint jobId) notPaymentStatus(jobId) external {
      JobDetail storage detail = jobDetails[jobId];
      JobBidderDetail storage jobBidderDetail = jobBidderDetails[jobId];

      (bool freelancerSent, ) = address(jobBidderDetail.chosenBidderAddress).call{value: jobBidderDetail.chosenBidderAmount}("");
      require(freelancerSent == true,"ERROR SENDING FREELANCER CLIENT INITIAL BID AMOUNT");

      (bool clientSent, ) = address(ownerOf(jobId)).call{value: address(this).balance}("");
      require(clientSent == true,"ERROR SENDING JOB CLIENT INITIAL PAYMENT");

      detail.currentStatus = JobStatus.Canceled;
    }

    // Utility

    function getJobMilestoneDetail(uint jobId) view external returns(JobMilestoneDetail memory){
      JobMilestoneDetail storage milestoneDetail = jobMilestoneDetails[jobId];
      return milestoneDetail;
    }

    function getAllBidders(uint jobId) external view returns(BidderDetail[] memory){
      return bidders[jobId];
    }

    // Modifiers

    modifier onlyJobOwner(uint jobId,address _owner) {
      require(ownerOf(jobId) == _owner,"NOT JOB OWNER");
      _;
    }

    modifier onlyFreelancer(address user) {
      require(freelancerNft.balanceOf(user) > 0, "NOT FREELANCER");
      _;
    }

    modifier notPaymentStatus(uint id) {
      JobDetail memory detail = jobDetails[id];
      require(detail.currentStatus != JobStatus.Payment, "CURRENTLy IN PAYMENT STATUS");
      _;
    }

    modifier onlyPaymentStatus(uint id) {
      JobDetail memory detail = jobDetails[id];
      require(detail.currentStatus == JobStatus.Payment, "NOT PAYMENT STATUS");
      _;
    }

    modifier onlyPendingStatus(uint id) {
      JobDetail memory detail = jobDetails[id];
      require(detail.currentStatus == JobStatus.Pending, "NOT PENDING STATUS");
      _;
    }

    modifier onlyRatingStatus(uint id) {
      JobDetail memory detail = jobDetails[id];
      require(detail.currentStatus == JobStatus.Rating, "NOT RATING STATUS");
      _;
    }

    modifier onlyFinishedStatus(uint id) {
      JobDetail memory detail = jobDetails[id];
      require(detail.currentStatus == JobStatus.Finished, "NOT FINISHED STATUS");
      _;
    }

    modifier onlyStartedStatus(uint id) {
      JobDetail memory detail = jobDetails[id];
      require(detail.currentStatus == JobStatus.Started, "NOT STARTED STATUS");
      _;
    }

    modifier onlyPaymentReceivedStatus(uint id) {
      JobDetail memory detail = jobDetails[id];
      require(detail.currentStatus == JobStatus.PaymentReceived, "NOT PAYMENT RECEIVED STATUS");
      _;
    }

    modifier onlyBiddingStatus(uint id) {
      JobDetail memory detail = jobDetails[id];
      require(detail.currentStatus == JobStatus.Bidding, "NOT BIDDING STATUS");
      _;
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
