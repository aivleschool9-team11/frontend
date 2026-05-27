import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AddBoxIcon from "@mui/icons-material/AddBox";

function Navbar() {
  return (
    <AppBar
      position='static'
      elevation={0}
      sx={{
        backgroundColor: "background.default",
        borderBottom: "1px solid",
        borderColor: "primary.light",
      }}
    >
      <Toolbar
        sx={{ justifyContent: "center", position: "relative", px: "40px" }}
      >
        <Link to='/' style={{ textDecoration: "none" }}>
          <Typography
            variant='body1'
            sx={{
              fontSize: "28px",
              fontWeight: 600,
              letterSpacing: "4px",
              color: "text.primary",
              "&:hover": { color: "primary.main" },
              transition: "color 0.2s",
            }}
          >
            작가의 산책
          </Typography>
        </Link>

        <Box
          sx={{ display: "flex", gap: 1, position: "absolute", right: "40px" }}
        >
          <Button
            component={Link}
            to='/'
            variant='outlined'
            size='small'
            startIcon={<MenuBookIcon />}
            sx={{
              borderColor: "primary.light",
              color: "text.secondary",
              borderRadius: "999px",
              fontSize: "13px",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "rgba(201, 141, 26, 0.08)",
              },
            }}
          >
            도서 목록
          </Button>
          <Button
            component={Link}
            to='/books/new'
            variant='outlined'
            size='small'
            startIcon={<AddBoxIcon />}
            sx={{
              borderColor: "primary.light",
              color: "text.secondary",
              borderRadius: "999px",
              fontSize: "13px",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "rgba(201, 141, 26, 0.08)",
              },
            }}
          >
            도서 등록
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
