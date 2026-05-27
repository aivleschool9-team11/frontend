import { Box, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      component='footer'
      sx={{
        borderTop: "1px solid #ead7b1",
        padding: "14px 40px",
        backgroundColor: "#fffdf8",
      }}
    >
      <Typography variant='caption' sx={{ color: "#aaa" }}>
        ©2026 AivleSchool Library, All rights reserved
      </Typography>
    </Box>
  );
}

export default Footer;
