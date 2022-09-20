import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { moment } from "moment";
import CheckMetamask from "../components/CheckMetamask.jsx";
import CheckClientNft from "../components/CheckClientNft.jsx";

import { getJobRelatedContracts } from "../../helpers.js";

import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { TextField } from "@mui/material";

export default function ClientHome() {
  const [userJobs, setUserJobs] = useState([]);
  const [foundJob, setFoundJob] = useState(null);
  let [bidderBool, setBidderBool] = useState(false);
  const [allBidders, setAllBidders] = useState([]);
  const [foundBidder, setFoundBidder] = useState(null);
  const [jobPaymentInput, setJobPaymentInput] = useState();
  const [jobMilestones, setJobMilestones] = useState([]);
  const [clientRateInput, setClientRateInput] = useState(0);

  let navigate = useNavigate();

  useEffect(() => {
    getAllJobs();
  }, []);

  useEffect(() => {
    if (foundJob != null) {
      if (userJobs.find((i) => i.name == foundJob.name) == undefined) {
        setUserJobs([...userJobs, foundJob]);
      }
    }
  }, [foundJob]);

  useEffect(() => {
    if (bidderBool == true) {
      if (
        allBidders.find((i) => i.address == foundBidder.address) == undefined
      ) {
        setAllBidders([...allBidders, foundBidder]);
      }
    }
  }, [foundBidder]);

  async function getAllJobs() {
    const { provider, factoryContract, nftContract, userAddress } =
      await getJobRelatedContracts();

    let jobsLength = await factoryContract.clientAddressToClientJobsLength(
      userAddress
    );
    let jobs = [];

    for (let i = 0; i < jobsLength; i++) {
      let idBN = await factoryContract
        .connect(userAddress)
        .clientAddressToClientJobs(userAddress, i);
      let job = await nftContract.jobDetails(idBN.toNumber());
      console.log(job);
      if (job.client.toUpperCase() == userAddress.toUpperCase()) {
        setFoundJob({
          id: job.id,
          name: job.name,
          currentStatus: job.currentStatus,
          description: job.description,
          milestoneAmount: job.milestoneDetail.milestoneAmount.toNumber(),
          approvedMilestones:
            job.milestoneDetail.approvedMilestoneAmount.toNumber(),
          maxFreelancerAmount: job.maxFreelancerAmount.toNumber(),
          paymentAmount: job.paymentAmount.toString(),
          projectDeadline: job.projectDeadline.toNumber(),
        });
      }
    }
  }

  // function that gets all bidders
  async function getAllBidders(id) {
    const { signer, factoryContract, nftContract, userAddress } =
      await getJobRelatedContracts();

    let biddersLengthBN = await nftContract.getBiddersLength(id);
    let biddersLength = biddersLengthBN.toNumber();
    let bidders = [];

    for (let i = 0; i < biddersLength; i++) {
      await nftContract.getAllBidders(id).then((bidderData) => {
        setAllBidders((prev) => [...prev, bidderData[i]]);
      });
      // setFoundBidder({
      //   address: bidders[i].account,
      //   biddingAmount: ethers.utils.formatUnits(bidders[i].bidAmount),
      // });
    }
    if (biddersLength == 0) {
      console.log("No bidders yet");
    }
  }

  async function updateStatus(id) {
    const { signer, factoryContract, nftContract, userAddress } =
      await getJobRelatedContracts();

    let idBN = await factoryContract.jobs(id);
    let job = await nftContract.jobDetails(idBN.toNumber());
    if (job.currentStatus == 1) {
      await nftContract.connect(signer).startBiddingPhase(idBN.toNumber());
    } else if (job.currentStatus == 2) {
    }
  }

  async function sendPayment(id) {
    console.log(ethers.utils.parseEther(jobPaymentInput));
    const { provider, userAddress, signer, nftContract } =
      await getJobRelatedContracts();
    const tx = await nftContract.connect(signer).sentPayment(id, {
      value: ethers.utils.parseEther(jobPaymentInput),
    });
    await tx.wait();
  }

  async function chooseFreelancer(jobId, bidderId) {
    const { provider, userAddress, signer, nftContract } =
      await getJobRelatedContracts();
    const tx = await nftContract
      .connect(signer)
      .chooseFreelancerPhase(jobId, bidderId);
    await tx.wait();
    console.log(nftContract.jobDetails(jobId));
  }

  async function sendAllBidBack(jobId) {
    const { provider, userAddress, signer, nftContract } =
      await getJobRelatedContracts();
    const tx = await nftContract.connect(signer).sendAllBid(jobId);
    await tx.wait();
  }

  async function approveMilestones(id) {
    const { provider, userAddress, signer, nftContract } =
      await getJobRelatedContracts();
    const tx = await nftContract.connect(signer).approveMilestone(id);
    await tx.wait();
  }

  async function clientRateJob(id) {
    const { provider, userAddress, signer, nftContract } =
      await getJobRelatedContracts();
    const tx = await nftContract
      .connect(signer)
      .clientRateJob(id, clientRateInput);
    await tx.wait();
  }

  async function cancelJob(id) {
    const { provider, userAddress, signer, nftContract } =
      await getJobRelatedContracts();
    const tx = await nftContract.connect(signer).cancelJob(id);
    await tx.wait();
  }

  return (
    <CheckMetamask>
      <CheckClientNft>
        <Box sx={{ flexGrow: 1, marginBottom: "2em" }}>
          <AppBar position="static" color="primary">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Unihorn
              </Typography>
              <Button
                variant="outlined"
                sx={{ marginRight: "1em" }}
                onClick={() => {
                  navigate("/createJob");
                }}
                color="inherit"
              >
                Create Job
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  navigate("/clientProfile");
                }}
              >
                Profile
              </Button>
            </Toolbar>
          </AppBar>
        </Box>

        <Container maxWidth="lg" sx={{ marginTop: "2em" }}>
          <Typography variant="h4" gutterBottom>
            Your In Progress Jobs
          </Typography>

          <List sx={{ width: "100%" }} component="nav">
            {userJobs.length > 0 &&
              userJobs.map((j, k) => {
                if (0 < j.currentStatus && j.currentStatus < 4) {
                  return (
                    <Stack key={k}>
                      <ListItem button variant="outlined">
                        <ListItemText
                          primary={j.name}
                          secondary={
                            "Description: " +
                            j.description +
                            " | Payment Amount: " +
                            ethers.utils.formatUnits(j.paymentAmount)
                          }
                        />
                        <Button
                          color="primary"
                          sx={{ marginRight: "1em" }}
                          variant="contained"
                          onClick={() => {
                            updateStatus(j.id.toNumber());
                          }}
                        >
                          Update Status
                        </Button>

                        <Button
                          color="error"
                          variant="contained"
                          onClick={() => {
                            cancelJob(j.id.toNumber());
                          }}
                        >
                          Cancel Job
                        </Button>
                      </ListItem>
                      <Divider />
                    </Stack>
                  );
                } else if (j.currentStatus == 4) {
                  return (
                    <Stack key={k}>
                      <ListItem button variant="outlined">
                        <ListItemText
                          primary={j.name}
                          secondary={
                            "Description: " +
                            j.description +
                            " | Payment Amount: " +
                            ethers.utils.formatUnits(j.paymentAmount) +
                            " | Milestones: " +
                            j.milestoneAmount +
                            " / " +
                            j.approvedMilestones
                          }
                        />
                        <Button
                          color="primary"
                          variant="contained"
                          sx={{ marginRight: "1em" }}
                          onClick={() => {
                            approveMilestones(j.id.toNumber());
                          }}
                        >
                          Approve Milestones
                        </Button>
                        <Button
                          color="error"
                          variant="contained"
                          onClick={() => {
                            cancelJob(j.id.toNumber());
                          }}
                        >
                          Cancel Job
                        </Button>
                      </ListItem>
                      <Divider />
                    </Stack>
                  );
                } else if (j.currentStatus == 5) {
                  return (
                    <Stack key={k}>
                      <ListItem button variant="outlined">
                        <ListItemText
                          primary={j.name}
                          secondary={
                            "Description: " +
                            j.description +
                            " | Payment Amount: " +
                            ethers.utils.formatUnits(j.paymentAmount)
                          }
                        />
                        <TextField
                          label="Rating 0-5"
                          variant="standard"
                          type="number"
                          onChange={(e) => {
                            setClientRateInput(e.target.value);
                          }}
                          sx={{ marginRight: "1em" }}
                        />
                        <Button
                          variant="outlined"
                          sx={{ marginRight: "1em" }}
                          onClick={() => {
                            clientRateJob(j.id.toNumber());
                          }}
                        >
                          Rate other party
                        </Button>
                        <Button
                          color="error"
                          variant="contained"
                          onClick={() => {
                            cancelJob(j.id.toNumber());
                          }}
                        >
                          Cancel Job
                        </Button>
                      </ListItem>
                      <Divider />
                    </Stack>
                  );
                } else {
                  return <></>;
                }
              })}
          </List>

          <Typography sx={{ marginTop: "2em" }} variant="h4" gutterBottom>
            Your Hiring Jobs
          </Typography>

          <List sx={{ width: "100%" }} component="nav">
            {userJobs.length > 0 &&
              userJobs.map((j, k) => {
                if (j.currentStatus == 0) {
                  return (
                    <Stack key={k}>
                      <ListItem button>
                        <ListItemText
                          primary={j.name}
                          secondary={
                            "Description: " +
                            j.description +
                            " | Payment Amount: " +
                            ethers.utils.formatUnits(j.paymentAmount)
                          }
                        />
                        <TextField
                          label="Payment Amount (ETH)"
                          variant="standard"
                          type="number"
                          onChange={(e) => {
                            setJobPaymentInput(e.target.value.toString());
                          }}
                          sx={{ marginRight: "1em" }}
                        />
                        <Button
                          variant="outlined"
                          sx={{ marginRight: "1em" }}
                          onClick={() => {
                            sendPayment(j.id.toNumber());
                          }}
                        >
                          Send Payment
                        </Button>
                        <Button
                          color="error"
                          variant="contained"
                          onClick={() => {
                            cancelJob(j.id.toNumber());
                          }}
                        >
                          Cancel Job
                        </Button>
                        {/* <Button
                          color="primary"
                          variant="contained"
                          onClick={() => {
                            updateStatus(j.id.toNumber());
                          }}
                        >
                          Update Status
                        </Button> */}
                      </ListItem>
                      <Divider />
                    </Stack>
                  );
                } else if (j.currentStatus == 2) {
                  return (
                    <Stack key={k}>
                      <ListItem button>
                        <ListItemText
                          primary={j.name}
                          secondary={
                            "Description: " +
                            j.description +
                            " | Payment Amount: " +
                            ethers.utils.formatUnits(j.paymentAmount)
                          }
                        />
                        <Button
                          variant="outlined"
                          sx={{ marginRight: "1em" }}
                          onClick={() => getAllBidders(j.id.toNumber())}
                        >
                          Choose Freelancer
                        </Button>
                        <Button
                          color="primary"
                          variant="contained"
                          sx={{ marginRight: "1em" }}
                          onClick={() => {
                            updateStatus(j.id.toNumber());
                          }}
                        >
                          Update Status
                        </Button>
                        <Button
                          color="error"
                          variant="contained"
                          onClick={() => {
                            cancelJob(j.id.toNumber());
                          }}
                        >
                          Cancel Job
                        </Button>
                      </ListItem>
                      <Divider />
                      <List
                        sx={{ width: "95%", marginX: "auto" }}
                        component="nav"
                      >
                        {allBidders.length > 0
                          ? allBidders.map((b, u) => {
                              return (
                                <Stack key={u}>
                                  <ListItem>
                                    <ListItemText
                                      primary={
                                        "Freelancer Address: " + b.account
                                      }
                                      secondary={
                                        "Bidding Amount: " +
                                        ethers.utils.formatUnits(b.bidAmount)
                                      }
                                    />
                                    <Button
                                      color="primary"
                                      variant="contained"
                                      onClick={() => {
                                        chooseFreelancer(j.id.toNumber(), u);
                                      }}
                                    >
                                      Choose
                                    </Button>
                                  </ListItem>
                                  <Divider />
                                </Stack>
                              );
                            })
                          : null}
                      </List>
                    </Stack>
                  );
                } else if (j.currentStatus == 3) {
                  return (
                    <Stack key={k}>
                      <ListItem button>
                        <ListItemText
                          primary={j.name}
                          secondary={
                            "Description: " +
                            j.description +
                            " | Payment Amount: " +
                            ethers.utils.formatUnits(j.paymentAmount)
                          }
                        />
                        <Button
                          variant="contained"
                          sx={{ marginRight: "1em" }}
                          onClick={() => {
                            sendAllBidBack(j.id.toNumber());
                          }}
                        >
                          Send All Bids Back
                        </Button>
                        {/* <Button
                          color="primary"
                          variant="contained"
                          onClick={() => {
                            updateStatus(j.id.toNumber());
                          }}
                        >
                          Update Status
                        </Button> */}
                      </ListItem>
                      <Divider />
                    </Stack>
                  );
                } else {
                  return <></>;
                }
              })}
          </List>
        </Container>
      </CheckClientNft>
    </CheckMetamask>
  );
}
