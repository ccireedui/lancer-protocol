import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import CheckMetamask from "../components/CheckMetamask.jsx";
import CheckFreelancerNft from "../components/CheckFreelancerNft";

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

export default function FreelancerHome() {
  const [userJobs, setUserJobs] = useState([]);
  const [foundJob, setFoundJob] = useState(null);
  const [jobBidInput, setJobBidInput] = useState();
  const [freelancerRateInput, setFreelancerRateInput] = useState(0);
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

  async function getAllJobs() {
    const { provider, factoryContract, nftContract, userAddress } =
      await getJobRelatedContracts();

    let jobsLength = await factoryContract.getJobsLength();
    let jobs = [];

    for (let i = 0; i < jobsLength; i++) {
      let idBN = await factoryContract.jobs(i);
      let job = await nftContract.jobDetails(idBN.toNumber());
      if (job.currentStatus != 0) {
        setFoundJob({
          id: job.id,
          name: job.name,
          client: job.client,
          currentStatus: job.currentStatus,
          description: job.description,
          maxFreelancerAmount: job.maxFreelancerAmount.toNumber(),
          paymentAmount: job.paymentAmount.toString(),
          projectDeadline: job.projectDeadline.toNumber(),
        });
      }
      console.log(foundJob);
    }
  }

  async function jobBid(id) {
    const { signer, factoryContract, nftContract, userAddress } =
      await getJobRelatedContracts();
    // console.log(job)
    await nftContract.connect(signer).freelancerBid(id, {
      value: ethers.utils.parseEther(jobBidInput),
    });
  }

  async function freelancerRateJob(id) {
    const { provider, userAddress, signer, nftContract } =
      await getJobRelatedContracts();
    const tx = await nftContract
      .connect(signer)
      .freelancerRateJob(id, freelancerRateInput);
    await tx.wait();
  }

  async function withdrawPayment(id) {
    const { provider, userAddress, signer, nftContract } =
      await getJobRelatedContracts();
    const tx = await nftContract.connect(signer).paymentWithdraw(id);
    await tx.wait();
  }

  return (
    <CheckMetamask>
      <CheckFreelancerNft>
        <Box sx={{ flexGrow: 1, marginBottom: "2em" }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Unihorn
              </Typography>
              <Button color="inherit">Profile</Button>
            </Toolbar>
          </AppBar>
        </Box>

        <Container maxWidth="lg" sx={{ marginTop: "2em" }}>
          <Typography variant="h4" gutterBottom>
            Your Joined Jobs
          </Typography>

          <List sx={{ width: "100%" }} component="nav">
            {userJobs.length > 0 &&
              userJobs.map((j, k) => {
                if (j.currentStatus == 5) {
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
                            setFreelancerRateInput(e.target.value);
                          }}
                          sx={{ marginRight: "1em" }}
                        />
                        <Button
                          variant="outlined"
                          sx={{ marginRight: "1em" }}
                          onClick={() => {
                            freelancerRateJob(j.id.toNumber());
                          }}
                        >
                          Rate other party
                        </Button>
                        <script>console.log(j.id.toNumber())</script>
                      </ListItem>
                      <Divider />
                    </Stack>
                  );
                } else if (j.currentStatus == 6) {
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
                          variant="outlined"
                          sx={{ marginRight: "1em" }}
                          onClick={() => {
                            withdrawPayment(j.id.toNumber());
                          }}
                        >
                          Withdraw Salary
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
            Hiring Jobs
          </Typography>

          <List sx={{ width: "100%" }} component="nav">
            {userJobs.length > 0 &&
              userJobs.map((j, k) => {
                if (j.currentStatus == 2) {
                  // 2 is hiring
                  return (
                    <Stack key={k}>
                      <ListItem button>
                        <ListItemText
                          primary={j.name}
                          secondary={
                            "Description: " +
                            j.description +
                            " | Max lancers: " +
                            j.maxFreelancerAmount +
                            " | Payment: " +
                            ethers.utils.formatUnits(j.paymentAmount) +
                            " | Deadline: " +
                            j.projectDeadline
                          }
                        />
                        <TextField
                          label="Bidding Amount (ETH)"
                          variant="standard"
                          type="number"
                          onChange={(e) => {
                            setJobBidInput(e.target.value);
                          }}
                          sx={{ marginRight: "1em" }}
                        />
                        <Button
                          variant="outlined"
                          sx={{ marginRight: "1em" }}
                          onClick={() => {
                            jobBid(k);
                          }}
                        >
                          Bid
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
        </Container>
      </CheckFreelancerNft>
    </CheckMetamask>
  );
}
