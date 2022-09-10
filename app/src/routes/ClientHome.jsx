import CheckMetamask from '../components/CheckMetamask.jsx';
import CheckClientNft from '../components/CheckClientNft.jsx';

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';

export default function ClientHome(){
  return (
    <CheckMetamask>
      <CheckClientNft>
        <Container maxWidth="lg" sx={{marginTop: "2em"}}>

          <Box sx={{ flexGrow: 1,marginBottom: "2em" }}>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Unihorn
                </Typography>
                <Button color="inherit">Create Job</Button>
                <Button color="inherit">Profile</Button>
              </Toolbar>
            </AppBar>
          </Box>

          <Typography variant="h4" gutterBottom>
            Your In Progress Jobs
          </Typography>

          <List sx={{ width:"100%" }} component="nav">
            <ListItem button>
              <ListItemText primary="Restaurant Portfolio Web" />
            </ListItem>
            <Divider />
            <ListItem button divider>
              <ListItemText primary="Stock Mobile App" />
            </ListItem>
          </List>

          <Typography sx={{ marginTop:"2em" }} variant="h4" gutterBottom>
            Your Hiring Jobs
          </Typography>

          <List sx={{ width:"100%" }} component="nav">
            <ListItem button>
              <ListItemText primary="Restaurant Portfolio Web" />
            </ListItem>
            <Divider />
            <ListItem button divider>
              <ListItemText primary="Stock Mobile App" />
            </ListItem>
          </List>

        </Container>
      </CheckClientNft>
    </CheckMetamask>
  )
}
