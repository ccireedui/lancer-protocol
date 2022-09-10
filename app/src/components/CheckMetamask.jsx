import { useEffect,useState } from 'react';

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function CheckMetamask({ children }){
  const [hasMetamask,setHasMetamask] = useState(false)
  const [metamaskConnected,setMetamaskConnected] = useState(false)

  useEffect(() => {
   if(checkBrowserHasMetamask()){
     setHasMetamask(true)
   }
  },[])

  async function handleConnectMetamask(){
    try{
      await ethereum.request({ method: 'eth_requestAccounts' });
      setMetamaskConnected(true)
    }catch(e){
      console.log(e)
    }
  }

  if(!hasMetamask){
    return (
      <Layout>
        <Typography variant="h2" gutterBottom>
          No Metamask Detected
        </Typography>
      </Layout>
    )
  }

  if(!metamaskConnected){
    return (
      <Layout>
        <Typography variant="h2" gutterBottom>
          Metamask Not Connected
        </Typography>
        <Button onClick={handleConnectMetamask} size="large" color="warning" variant="outlined">
          <Typography variant="h6">Connect Metamask</Typography>
        </Button>
      </Layout>
    )
  }

  return (
    <>
      { children }
    </>
  )

  function checkBrowserHasMetamask(){
    if (typeof window.ethereum !== 'undefined') {
      return true
    }

    return false
  }
}

function Layout({ children }){
  return (
    <Container maxWidth="md">
      <Stack
        justifyContent="center"
        spacing={2}
        sx={{ height: "100vh" }}
        alignItems="center"
      >
        { children }
      </Stack>
    </Container>
  )
}
