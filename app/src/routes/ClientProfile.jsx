import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import CheckMetamask from "../components/CheckMetamask.jsx";
import CheckClientNft from "../components/CheckClientNft.jsx";

import { getClientRelatedContracts } from "../../helpers.js";
import { getJobRelatedContracts } from "../../helpers.js";

import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";

export default function ClientProfile() {
  const [userJobs, setUserJobs] = useState([]);
  const [user, setUser] = useState(null);
  let navigate = useNavigate();

  useEffect(() => {
    getClientInfo();
  }, []);
  async function getClientInfo() {
    // const jobFactoryContract = await getJobRelatedContracts()
    //   .factoryContract.connect(userAddress)
    //   .getClientAllJobs();
    // console.log(jobFactoryContract);
    let JobRelatedContract = await getJobRelatedContracts();
    let clientJobs =
      await JobRelatedContract.factoryContract.getClientAllJobs();
    const { signer, factoryContract, nftContract, userAddress } =
      await getClientRelatedContracts();
    let clientIdBN = await factoryContract.addressToClientId(userAddress);
    let clientId = clientIdBN.toNumber();
    let client = await nftContract.getClientDetail(clientId);
    setUser({
      username: client.username,
      linkedIn: client.linkedIn,
      email: client.email,
      address: userAddress,
      createdJobs: client.jobsCreated,
    });
    // console.log(user);
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
              <Button variant="outlined" color="inherit">
                Profile
              </Button>
            </Toolbar>
          </AppBar>
        </Box>

        <Container maxWidth="md">
          <Stack
            justifyContent="center"
            spacing={2}
            sx={{ height: "100vh" }}
            alignItems="center"
          >
            <Typography variant="h4" primary="Username" gutterBottom>
              Username: {user.username}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Typography variant="h6">Address {user.address}</Typography>
              <Typography variant="h6">LinkedIn {user.linkedIn}</Typography>
              <Typography variant="h6">E-Mail {user.email}</Typography>
            </Stack>
          </Stack>
        </Container>
      </CheckClientNft>
    </CheckMetamask>
  );
}
