import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../authContext";
import NavBar from "./NavBar";
import { Button } from "@mui/material";

function HomePage() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <>
      <NavBar helloText="" loggedIn={false}></NavBar>
      <div style={{ height: "100vh" }}>
        <div
          style={{
            backgroundImage: "url(/earth.jpg)",
            backgroundSize: "cover",
            backgroundAttachment: "fixed",
            backgroundPosition: "center",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          <h1>LEARN ABOUT THE WORLD!</h1>
          <Button
            variant="contained"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              padding: "10px 20px",
              borderRadius: "5px",
              margin: "10px",
            }}
            onClick={() => {
              auth ? navigate("/dashboard") : navigate("/login");
            }}
          >
            Log In
          </Button>
          <Button
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              padding: "10px 20px",
              borderRadius: "5px",
              margin: "10px",
            }}
            variant="contained"
            onClick={() => {
              auth ? navigate("/dashboard") : navigate("/signup");
            }}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </>
  );
}

export default HomePage;
