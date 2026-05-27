import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#c98d1a", // 골드
      dark: "#a87412",
      light: "#ead7b1",
      contrastText: "#fff",
    },
    secondary: {
      main: "#b87912",
      contrastText: "#fff",
    },
    background: {
      default: "#fffdf8", // 따뜻한 흰색/베이지
      paper: "#fffaf3", // 책 카드용 부드러운 배경
    },
    text: {
      primary: "#4b3621", // 짙은 갈색 텍스트
      secondary: "#6b4f3a",
    },
  },
  typography: {
    fontFamily: "'Gowun Batang', 'Noto Sans KR', serif",
    h1: {
      fontFamily: "'Gowun Batang', 'Noto Sans KR', serif",
      fontWeight: 700,
      fontSize: "36px",
      color: "#b87912",
    },
    h2: {
      fontFamily: "'Gowun Batang', 'Noto Sans KR', serif",
      fontWeight: 600,
      fontSize: "22px",
      color: "#5c4033",
    },
    h3: {
      fontFamily: "'Gowun Batang', 'Noto Sans KR', serif",
      fontWeight: 600,
      fontSize: "18px",
      color: "#5c4033",
    },
    body1: {
      fontFamily: "'Gowun Batang', 'Noto Sans KR', serif",
      color: "#4b3621",
      fontSize: "15px",
    },
    body2: {
      fontFamily: "'Gowun Batang', 'Noto Sans KR', serif",
      color: "#6b4f3a",
      fontSize: "14px",
    },
    button: {
      fontFamily: "'Gowun Batang', 'Noto Sans KR', serif",
      fontWeight: "bold",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "none",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(201, 141, 26, 0.2)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            backgroundColor: "#fffdf8",
            "& fieldset": {
              borderColor: "#ead7b1",
              borderWidth: "2px",
            },
            "&:hover fieldset": {
              borderColor: "#c98d1a",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#c98d1a",
              boxShadow: "0 0 10px rgba(201, 141, 26, 0.2)",
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          backgroundColor: "#fff",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ead7b1",
            borderWidth: "2px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c98d1a",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c98d1a",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.05), 0 2px 8px rgba(201,141,26,0.12)",
          backgroundColor: "#fffaf3",
          border: "none",
        },
      },
    },
  },
});

export default theme;
