import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

export default function Layout({ children }){
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
