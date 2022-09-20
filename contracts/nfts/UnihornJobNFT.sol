// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "../interfaces/IUnihornFreelancerNFT.sol";

import "../nfts/UnihornJobNFT.sol";

import "../structs/JobDetail.sol";
import "../structs/JobBidderDetail.sol";
import "../structs/JobMilestoneDetail.sol";
import "../structs/JobRateDetail.sol";

import "../structs/BidderDetail.sol";
import "../structs/ClientDetail.sol";
// import "../structs/MilestoneDetail.sol";

import "../enums/JobStatus.sol";

contract UnihornJobNFT is ERC721, AccessControl {
    using Counters for Counters.Counter;

    JobDetail[] public jobDetails;
    JobBidderDetail[] public jobBidderDetails;
    JobMilestoneDetail[] public jobMilestoneDetails;
    JobRateDetail[] public jobRateDetails;

    mapping(uint256 => BidderDetail[]) public bidders;
    mapping(address => mapping(uint => bool)) isBidden;
    // mapping(uint => MilestoneDetail[]) public milestones;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _tokenIdCounter;

    IUnihornFreelancerNFT public freelancerNft;

    constructor(address _jobFactory, address _freelancerNft)
        ERC721("UnihornJobNFT", "UNIH-JOB")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, _jobFactory);
        freelancerNft = IUnihornFreelancerNFT(_freelancerNft);
    }

    function jobMint(
        address to,
        string memory _jobName,
        string memory _jobDescription,
        uint256 _maxFreelancerAmount,
        uint256 _paymentAmount,
        uint256 _bidderMinAmount,
        uint256 _bidDeadline,
        uint256 _milestonePhaseAmount,
        uint256 _milestonePhaseDeadline,
        uint256 _projectDeadline
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);

        JobDetail memory detail;
        JobBidderDetail memory bidder;
        JobMilestoneDetail memory milestone;

        detail.id = tokenId;
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
        jobRateDetails.push(JobRateDetail(0, 0, false, false));

        return tokenId;
    }

    // State Changing Functions

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    function sentPayment(uint256 jobId)
        external
        payable
        onlyJobOwner(jobId, msg.sender)
        onlyPendingStatus(jobId)
    {
        JobDetail storage detail = jobDetails[jobId];
        require(detail.paymentAmount == msg.value, "PAYMENT AMOUNT WRONG");
        (bool success, ) = address(this).call{value: msg.value}("");
        require(success == true, "PAYMENT ERROR");

        detail.currentStatus = JobStatus.PaymentReceived;
    }

    function startBiddingPhase(uint256 jobId)
        external
        onlyJobOwner(jobId, msg.sender)
        onlyPaymentReceivedStatus(jobId)
    {
        JobDetail storage detail = jobDetails[jobId];

        detail.currentStatus = JobStatus.Bidding;
    }

    function freelancerBid(uint256 jobId)
        external
        payable
        onlyBiddingStatus(jobId)
        onlyFreelancer(msg.sender)
    {
        JobDetail memory detail = jobDetails[jobId];
        JobBidderDetail storage jobBiddersDetail = jobBidderDetails[jobId];
        require(
            bidders[jobId].length <= detail.maxFreelancerAmount,
            "MAX FREELANCER BIDDER REACHED"
        );
        require(
            jobBiddersDetail.bidderMinAmount <= msg.value,
            "NOT ABOVE BIDDER MIN AMOUNT"
        );
        require(
            isBidden[msg.sender][jobId] == false,
            "FREELANCER ALREADY BIDDED"
        );        
        (bool success, ) = address(this).call{value: msg.value}("");
        require(success == true, "PAYMENT ERROR");

        BidderDetail memory bidderDetail;
        bidderDetail.bidAmount = msg.value;
        bidderDetail.account = msg.sender;
        isBidden[msg.sender][jobId] = true;

        bidders[jobId].push(bidderDetail);
    }

    function chooseFreelancerPhase(uint256 jobId, uint256 bidderId)
        external
        onlyJobOwner(jobId, msg.sender)
        onlyBiddingStatus(jobId)
    {
        JobDetail storage detail = jobDetails[jobId];
        JobBidderDetail storage jobBidderDetail = jobBidderDetails[jobId];
        require(bidders[jobId].length > 0, "NOT ENOUGH FREELANCER BIDDERS");
        require(bidders[jobId].length > bidderId, "BIDDER ID NOT FOUND");
        require(
            jobBidderDetail.chosenBidderAddress == address(0),
            "FREELANCER IS ALREADY CHOSEN"
        );

        jobBidderDetail.chosenBidder = bidders[jobId][bidderId];
        jobBidderDetail.chosenBidderId = bidderId;

        jobBidderDetail.chosenBidderAddress = bidders[jobId][bidderId].account;
        jobBidderDetail.chosenBidderAmount = bidders[jobId][bidderId].bidAmount;
        detail.currentStatus = JobStatus.SendingAllBid;
    }

    function sendAllBid(uint256 jobId)
        external
        payable
        onlyJobOwner(jobId, msg.sender)
        onlySendingAllBidStatus(jobId)
    {
        JobDetail storage detail = jobDetails[jobId];
        uint256 bidderIndex = 0;

        while (bidderIndex < bidders[jobId].length) {
            if (
                bidders[jobId][bidderIndex].account !=
                jobBidderDetails[jobId].chosenBidderAddress
            ) {
                (bool success, ) = bidders[jobId][bidderIndex].account.call{
                    value: bidders[jobId][bidderIndex].bidAmount
                }("");
                require(success == true, "PAYMENT ERROR");
            }
            bidderIndex++;
        }
        detail.currentStatus = JobStatus.Started;
    }

    function approveMilestone(uint256 jobId)
        external
        onlyJobOwner(jobId, msg.sender)
        onlyStartedStatus(jobId)
    {
        JobDetail storage detail = jobDetails[jobId];
        JobMilestoneDetail storage milestoneDetail = jobMilestoneDetails[jobId];

        milestoneDetail.approvedMilestoneAmount += 1;

        uint256 approvedAmount = milestoneDetail.approvedMilestoneAmount;
        uint256 maxAmount = milestoneDetail.milestoneAmount;

        if (approvedAmount == maxAmount) {
            detail.currentStatus = JobStatus.Rating;
        }
    }

    function freelancerRateJob(uint256 jobId, uint256 rate)
        external
        onlyFreelancer(msg.sender)
        onlyRatingStatus(jobId)
    {
        require(rate <= 5, "INCORRECT RATE AMOUNT");
        JobDetail storage detail = jobDetails[jobId];
        JobRateDetail storage rateDetail = jobRateDetails[jobId];

        rateDetail.freelancerRate = rate;
        rateDetail.hasFreelancerRated = true;

        if (
            rateDetail.hasFreelancerRated == true &&
            rateDetail.hasClientRated == true
        ) {
            detail.currentStatus = JobStatus.Payment;
        }
    }

    function clientRateJob(uint256 jobId, uint256 rate)
        external
        onlyJobOwner(jobId, msg.sender)
        onlyRatingStatus(jobId)
    {
        require(rate <= 5, "INCORRECT RATE AMOUNT");
        JobDetail storage detail = jobDetails[jobId];
        JobRateDetail storage rateDetail = jobRateDetails[jobId];

        rateDetail.clientRate = rate;
        rateDetail.hasClientRated = true;

        if (
            rateDetail.hasFreelancerRated == true && rateDetail.hasClientRated
        ) {
            detail.currentStatus = JobStatus.Payment;
        }
    }

    function paymentWithdraw(uint256 jobId)
        external
        onlyFreelancer(msg.sender)
        onlyPaymentStatus(jobId)
    {
        JobDetail storage detail = jobDetails[jobId];

        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success == true, "PAYMENT ERROR");

        detail.currentStatus = JobStatus.Finished;
    }

    function cancelJob(uint256 jobId) external payable notPaymentStatus(jobId) {
        JobDetail storage detail = jobDetails[jobId];
        JobBidderDetail storage jobBidderDetail = jobBidderDetails[jobId];

        (bool freelancerSent, ) = address(jobBidderDetail.chosenBidderAddress)
            .call{value: jobBidderDetail.chosenBidderAmount}("");
        require(
            freelancerSent == true,
            "ERROR SENDING FREELANCER CLIENT INITIAL BID AMOUNT"
        );

        (bool clientSent, ) = address(ownerOf(jobId)).call{
            value: address(this).balance
        }("");
        require(clientSent == true, "ERROR SENDING JOB CLIENT INITIAL PAYMENT");

        detail.currentStatus = JobStatus.Canceled;
    }

    // Utility

    function getJobMilestoneDetail(uint256 jobId)
        external
        view
        returns (JobMilestoneDetail memory)
    {
        JobMilestoneDetail storage milestoneDetail = jobMilestoneDetails[jobId];
        return milestoneDetail;
    }

    function getAllBidders(uint256 jobId)
        external
        view
        returns (BidderDetail[] memory)
    {
        return bidders[jobId];
    }
    
  function getBiddersLength(uint256 jobId) external view returns(uint) {
    return bidders[jobId].length;
  }

    // Modifiers

    modifier onlyJobOwner(uint256 jobId, address _owner) {
        require(ownerOf(jobId) == _owner, "NOT JOB OWNER");
        _;
    }

    modifier onlyFreelancer(address user) {
        require(freelancerNft.balanceOf(user) > 0, "NOT FREELANCER");
        _;
    }

    modifier notPaymentStatus(uint256 id) {
        JobDetail memory detail = jobDetails[id];
        require(
            detail.currentStatus != JobStatus.Payment,
            "CURRENTLY IN PAYMENT STATUS"
        );
        _;
    }

    modifier onlyPaymentStatus(uint256 id) {
        JobDetail memory detail = jobDetails[id];
        require(
            detail.currentStatus == JobStatus.Payment,
            "NOT PAYMENT STATUS"
        );
        _;
    }

    modifier onlyPendingStatus(uint256 id) {
        JobDetail memory detail = jobDetails[id];
        require(
            detail.currentStatus == JobStatus.Pending,
            "NOT PENDING STATUS"
        );
        _;
    }

    modifier onlyRatingStatus(uint256 id) {
        JobDetail memory detail = jobDetails[id];
        require(detail.currentStatus == JobStatus.Rating, "NOT RATING STATUS");
        _;
    }

    modifier onlyFinishedStatus(uint256 id) {
        JobDetail memory detail = jobDetails[id];
        require(
            detail.currentStatus == JobStatus.Finished,
            "NOT FINISHED STATUS"
        );
        _;
    }

    modifier onlySendingAllBidStatus(uint256 id) {
        JobDetail memory detail = jobDetails[id];
        require(
            detail.currentStatus == JobStatus.SendingAllBid,
            "NOT ALLBIDSENT STATUS"
        );
        _;
    }

    modifier onlyStartedStatus(uint256 id) {
        JobDetail memory detail = jobDetails[id];
        require(
            detail.currentStatus == JobStatus.Started,
            "NOT IN PROGRESS STATUS"
        );
        _;
    }

    modifier onlyPaymentReceivedStatus(uint256 id) {
        JobDetail memory detail = jobDetails[id];
        require(
            detail.currentStatus == JobStatus.PaymentReceived,
            "NOT PAYMENT RECEIVED STATUS"
        );
        _;
    }

    modifier onlyBiddingStatus(uint256 id) {
        JobDetail memory detail = jobDetails[id];
        require(
            detail.currentStatus == JobStatus.Bidding,
            "NOT BIDDING STATUS"
        );
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
