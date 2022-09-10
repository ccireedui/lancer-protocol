import { useEffect,useState } from 'react'
import { getFreelancerRelatedContracts } from '../../helpers.js';

import Layout from './Layout';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export default function CheckFreelancerNft({ children }){
  const [hasFreelancerNft,setHasFreelancerNft] = useState(false)

  const [usernameInput,setUsernameInput] = useState("")
  const [linkedInInput,setLinkedInInput] = useState("")
  const [emailInput,setEmailInput] = useState("")

  useEffect(() => {
    checkNft();
  },[])

  async function checkNft(){
    const { nftContract,userAddress } = await getFreelancerRelatedContracts()
    let userNftBN = await nftContract.balanceOf(userAddress)

    if(userNftBN.toNumber() > 0){
      setHasFreelancerNft(true)
    }
  }

  async function mintFreelancerNft(){
    if(usernameInput == "" || linkedInInput == "" || emailInput == ""){
      alert("Some Inputs Empty")
      return;
    }

    const { factoryContract,signer,nftContact,userAddress } = await getFreelancerRelatedContracts()

    let tx = await factoryContract.connect(signer).createFreelancer(usernameInput,linkedInInput,emailInput);
    await tx.wait()
    let userNftBN = await nftContact.balanceOf(userAddress)

    if(userNftBN.toNumber() > 0){
      setHasFreelancerNft(true)
    }
  }

  if(!hasFreelancerNft){
    return (
      <Layout>
        <Typography variant="h2" gutterBottom>
          You Have No Freelancer NFT 
        </Typography>

        <TextField 
          required
          onChange={(e) => { setUsernameInput(e.target.value) }}
          value={usernameInput}
          id="outlined-basic" label="Username" variant="outlined" />
        <TextField 
          required
          onChange={(e) => { setLinkedInInput(e.target.value) }}
          value={linkedInInput}
          type="url"
          id="outlined-basic" label="LinkedIn" variant="outlined" />
        <TextField 
          required
          onChange={(e) => { setEmailInput(e.target.value) }}
          value={emailInput}
          type="email"
          id="outlined-basic" label="Email" variant="outlined" />


        <Button onClick={() => { mintFreelancerNft() }} size="large" color="warning" variant="outlined">
          <Typography variant="h6">Mint Freelancer Nft</Typography>
        </Button>
      </Layout>
    )
  }

  return (
    <>
      { children }
    </>
  )
}
