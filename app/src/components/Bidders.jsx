import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";

export default function Bidder({ children }) {
  return (
    <List sx={{ width: "100%" }} component="nav">
      <Container maxWidth="md">
        <Stack
          justifyContent="center"
          spacing={2}
          sx={{ height: "100vh" }}
          alignItems="center"
        >
          {children}
        </Stack>
      </Container>
    </List>
  );
}
