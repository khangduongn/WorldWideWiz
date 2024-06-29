import { Snackbar, Alert } from "@mui/material";
import { Input, Button } from "@mui/joy";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../authContext";
import NavBar from "./NavBar";

function LogIn() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  const { auth, setAuth, setUser } = useContext(AuthContext);

  useEffect(() => {
    if (auth) navigate("/dashboard");
  }, [auth]);

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  async function submitLogin() {
    if (username == "" || password == "") {
      setErrorMessage("Fill in all required fields");
      setOpen(true);
      return;
    }
    const loginRes = await axios.post("/api/login", {
      username: username,
      password: password,
    });
    if (loginRes.status !== 201) {
      setAuth(false);
      setUser(null);
      setErrorMessage(loginRes.data.error);
      setOpen(true);
    } else {
      setAuth(true);
      setUser(username);
      navigate("/dashboard");
    }
  }

  return (
    <>
      <NavBar helloText="" loggedIn={false}></NavBar>
      <div style={{ height: "100vh" }}>
        <div
          style={{
            backgroundImage: "url(/earth.jpg)",
            backgroundSize: "cover",
            backgroundAttachment: "fixed",
            height: "100%",
            backgroundPosition: "center",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  textAlign: "start",
                  paddingLeft: "1vw",
                  color: "white",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                Log In
              </h2>
              <div
                style={{
                  width: "20vw",
                  height: "40vh",
                  padding: "0px 2.5vw 0px 2.5vw",
                  backgroundColor: "whitesmoke",
                  boxShadow: "1vw 1vh",
                  borderStyle: "solid",
                  borderWidth: "2px",
                  borderRadius: "10px",
                  borderColor: "black",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-evenly",
                }}
              >
                <div style={{ textAlign: "start" }}>
                  <div>
                    <h3>Username</h3>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter Username"
                    />
                  </div>
                  <div>
                    <h3>Password</h3>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Username"
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                  }}
                >
                  <Button
                    size="lg"
                    onClick={submitLogin}
                    style={{ backgroundColor: "#103060", borderColor: "black" }}
                  >
                    Log In
                  </Button>
                  <Link to={"/signup"}>Don't have an account?</Link>
                </div>
              </div>
              <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                message={errorMessage}
              >
                <Alert
                  onClose={handleClose}
                  severity="error"
                  variant="filled"
                  sx={{ width: "100%" }}
                >
                  {errorMessage}
                </Alert>
              </Snackbar>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LogIn;
