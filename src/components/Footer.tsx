import { Box, Container, Link, Typography } from '@mui/material';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[200],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} Westralian People's Museum of Objects of Interest and Reference Library
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          <Link
            href="mailto:contact@example.com"
            sx={{
              color: 'text.primary',
              '&:hover': {
                color: 'primary.dark',
              },
            }}
          >
            Contact
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
