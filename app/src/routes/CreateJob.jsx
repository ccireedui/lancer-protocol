import { useState } from 'react'
import CheckMetamask from "../components/CheckMetamask.jsx";
import CheckClientNft from "../components/CheckClientNft.jsx";
import Container from "@mui/material/Container";
import TextField from '@mui/material/TextField';
import Button from "@mui/material/Button";

import moment from 'moment';
import { useNavigate } from "react-router-dom";

import { getJobRelatedContracts } from '../../helpers.js';

export default function CreateJob(){
  let navigate = useNavigate();
  const [jobNameInput,setJobNameInput] = useState("Business Portfolio Web")
  const [jobDescInput,setJobDescInput] = useState("Website")
  const [freelancerMaxAmountInput,setFreelancerMaxAmountInput] = useState(3)
  const [minBidAmountInput,setMinBidAmountInput] = useState(2)
  const [paymentAmountInput,setPaymentAmountInput] = useState(3)
  const [biddingDeadlineInput,setBiddingDeadlineInput] = useState("2022-09-09")
  const [milestoneMaxAmountInput,setMilestoneMaxAmountInput] = useState(2)
  const [milestoneDeadlineInput,setMilestoneDeadlineInput] = useState("2022-09-15")
  const [projectDeadlineInput,setProjectDeadlineInput] = useState("2022-09-25")

  async function handleJobMint(){
    const { factoryContract,nftContract,signer,userAddress } = await getJobRelatedContracts()

    try{
      let biddingDeadline = moment(biddingDeadlineInput).unix()
      let milestoneDeadline = moment(milestoneDeadlineInput).unix()
      let projectDeadline = moment(projectDeadlineInput).unix()

      let tx = await factoryContract.connect(signer).createJob(
        jobNameInput,
        jobDescInput,
        freelancerMaxAmountInput,
        paymentAmountInput,
        minBidAmountInput,
        biddingDeadline,
        milestoneMaxAmountInput,
        milestoneDeadline,
        projectDeadline,
      )

      await tx.wait()
      navigate("/client")
    }catch(e){
      console.log(e)
    }
  }

  return (
    <CheckMetamask>
      <CheckClientNft>
        <Container maxWidth="lg" sx={{ marginTop: "2em" }}>
          <h1 className="text-2xl">Create Job</h1>

          <div className="flex mt-10 flex-col gap-5">
            <TextField 
              required
              fullWidth
              onChange={(e) => { setJobNameInput(e.target.value) }}
              value={jobNameInput}
              label="Job Name" variant="outlined" />

            <TextField 
              required
              fullWidth
              onChange={(e) => { setJobDescInput(e.target.value) }}
              value={jobDescInput}
              label="Job Description" variant="outlined" />

            <TextField 
              required
              fullWidth
              type="number"
              value={freelancerMaxAmountInput}
              onChange={(e) => { setFreelancerMaxAmountInput(e.target.value) }}
              label="Freelancer Max Amount" variant="outlined" />

            <TextField 
              required
              fullWidth
              type="number"
              onChange={(e) => { setPaymentAmountInput(e.target.value) }}
              value={paymentAmountInput}
              label="Payment Amount (ETH)" variant="outlined" />

            <TextField 
              required
              fullWidth
              type="number"
              onChange={(e) => { setMinBidAmountInput(e.target.value) }}
              value={minBidAmountInput}
              label="Min Bidder Amount (ETH)" variant="outlined" />

            <TextField 
              required
              fullWidth
              type="date"
              value={biddingDeadlineInput}
              onChange={(e) => { setBiddingDeadlineInput(e.target.value) }}
              label="Bidding Deadline" variant="standard" />

            <TextField 
              required
              fullWidth
              type="number"
              onChange={(e) => { setMilestoneMaxAmountInput(e.target.value) }}
              value={milestoneMaxAmountInput}
              label="Milestone Max Amount" variant="outlined" />

            <TextField 
              required
              fullWidth
              type="date"
              value={milestoneDeadlineInput}
              onChange={(e) => { setMilestoneDeadlineInput(e.target.value) }}
              label="Milestone Deadline" variant="standard" />

            <TextField 
              required
              fullWidth
              type="date"
              value={projectDeadlineInput}
              onChange={(e) => { setProjectDeadlineInput(e.target.value) }}
              label="Project Deadline" variant="standard" />
          </div>

          <div className="mt-10 flex flex-col gap-4">
            <Button size="large" color="success" variant="outlined" fullWidth onClick={() => { handleJobMint() }}>Mint Job</Button>
            <Button size="large" color="warning" variant="outlined" fullWidth onClick={() => { navigate("/client") }}>Go Back</Button>
          </div>

        </Container>
      </CheckClientNft>
    </CheckMetamask>
  )
}
