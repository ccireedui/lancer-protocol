import { useState,useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import CheckMetamask from "../components/CheckMetamask.jsx";
import CheckClientNft from "../components/CheckClientNft.jsx";

import { getJobRelatedContracts } from '../../helpers.js';

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

export default function ClientHome() {
  const [userJobs,setUserJobs] = useState([])
  const [foundJob,setFoundJob] = useState(null)
  let navigate = useNavigate();

  useEffect(() => {
    getAllJobs()
  },[])

  useEffect(() => {
    if(foundJob != null){
      if(userJobs.find((i) => i.name == foundJob.name) == undefined){
        setUserJobs([...userJobs,foundJob])
      }
    }
  },[foundJob])

  async function getAllJobs(){
    const { provider,factoryContract,nftContract,userAddress } = await getJobRelatedContracts()

    let jobsLength = await factoryContract.getJobsLength()
    let jobs = []

    for (let i = 0; i < jobsLength; i++) {
      let idBN = await factoryContract.jobs(i)
      let job = await nftContract.jobDetails(idBN.toNumber())
      if(job.client.toUpperCase() == userAddress.toUpperCase()){
        setFoundJob({
          name: job.name,
          currentStatus: job.currentStatus,
          description: job.description,
          maxFreelancerAmount: job.maxFreelancerAmount.toNumber(),
          paymentAmount: job.paymentAmount.toNumber(),
          projectDeadline: job.projectDeadline.toNumber()
        })
      }
    }
  }

  return (
    <CheckMetamask>
      <CheckClientNft>
        <Box sx={{ flexGrow: 1, marginBottom: "2em" }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Unihorn
              </Typography>
              <Button onClick={() => { navigate("/createJob") }} color="inherit">Create Job</Button>
              <Button color="inherit">Profile</Button>
            </Toolbar>
          </AppBar>
        </Box>

        <Container maxWidth="lg" sx={{ marginTop: "2em" }}>
          <Typography variant="h4" gutterBottom>
            Your In Progress Jobs
          </Typography>

          <List sx={{ width: "100%" }} component="nav">
            { userJobs.length > 0 && userJobs.map((j,k) => {
              if(j.currentStatus != 0){
                return (
                  <div key={k}>
                    <ListItem button>
                      <ListItemText primary={j.name} />
                    </ListItem>
                    <Divider />
                  </div>
                )
              }else{ return (<></>) }
            }) }
          </List>

          <Typography sx={{ marginTop: "2em" }} variant="h4" gutterBottom>
            Your Hiring Jobs
          </Typography>

          <List sx={{ width: "100%" }} component="nav">
            { userJobs.length > 0 && userJobs.map((j,k) => {
              if(j.currentStatus == 0){
                return (
                  <div key={k}>
                    <ListItem button>
                      <ListItemText primary={j.name} />
                    </ListItem>
                    <Divider />
                  </div>
                )
              }else{ return (<></>) }
            }) }
          </List>
        </Container>
      </CheckClientNft>
    </CheckMetamask>
  );
}
