import { useState, MouseEvent, useContext } from "react";
import { AuthContext } from "../authContext";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MapIcon from "@mui/icons-material/Map";
import SearchBar from "./SearchBar";
import axios from "axios";
import ProfilesSearchBar from "./ProfilesSearchBar";
import { useNavigate } from "react-router-dom";

import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  MenuItem,
  Menu,
} from "@mui/material";

interface NavBarProps {
  helloText: string;
  loggedIn: boolean;
}

function NavBar({ helloText, loggedIn }: NavBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { setAuth, setUser, user } = useContext(AuthContext);

  const navigate = useNavigate();

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  async function handleLogout() {
    let logoutRes = await axios.post("/api/logout");
    console.log(logoutRes.status);
    if (logoutRes.status === 200) {
      setUser(null);
      setAuth(false);
      navigate("/");
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ backgroundColor: "#103060" }}>
        <Toolbar>
          <MapIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            onClick={() => {
              loggedIn ? navigate("/dashboard") : navigate("/");
            }}
            noWrap
            component="div"
            sx={{
              display: { xs: "none", sm: "block" },
              cursor: "pointer",
              marginRight: "20px",
            }}
          >
            World Wide Wiz
          </Typography>

          <SearchBar></SearchBar>
          {loggedIn && (
            <>
              <ProfilesSearchBar></ProfilesSearchBar>
              <Box sx={{ flexGrow: 1 }} />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                {helloText}
              </Typography>
              <Box sx={{ display: "flex" }}>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls="account-menu"
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        id="account-menu"
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isMenuOpen}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => navigate(`/profile/${user}`)}>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  );
}

export default NavBar;
