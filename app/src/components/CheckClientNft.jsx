import { useEffect,useState } from 'react'
import { getClientRelatedContracts } from '../../helpers.js';

import Layout from './Layout';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export default function CheckClientNft({ children }){
  const [hasClientNft,setHasClientNft] = useState(false)
  const [usernameInput,setUsernameInput] = useState("")
  const [linkedInInput,setLinkedInInput] = useState("")
  const [emailInput,setEmailInput] = useState("")

  useEffect(() => {
    checkNft();
  },[])

  async function checkNft(){
    const { nftContract,userAddress } = await getClientRelatedContracts()
    let userNftBN = await nftContract.balanceOf(userAddress)

    if(userNftBN.toNumber() > 0){
      setHasClientNft(true)
    }
  }

  async function mintClientNft(){
    if(usernameInput == "" || linkedInInput == "" || emailInput == ""){
      alert("Some Inputs Empty")
      return;
    }

    const { factoryContract,signer,nftContact,userAddress } = await getClientRelatedContracts()

    let tx = await factoryContract.connect(signer).createClient(usernameInput,linkedInInput,emailInput);
    await tx.wait()
    let userNftBN = await nftContact.balanceOf(userAddress)

    if(userNftBN.toNumber() > 0){
      setHasClientNft(true)
    }
  }

  if(!hasClientNft){
    return (
      <Layout>
        <Typography variant="h2" gutterBottom>
          You Have No Client NFT 
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


        <Button onClick={() => { mintClientNft() }} size="large" color="warning" variant="outlined">
          <Typography variant="h6">Mint Client Nft</Typography>
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
