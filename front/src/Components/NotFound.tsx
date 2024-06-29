import NavBar from "./NavBar";
import { AuthContext } from "../authContext";
import { useContext, useEffect, useState } from "react";
function NotFound() {
  const [helloText, setHelloText] = useState<string>("");
  const { auth, user } = useContext(AuthContext);
  useEffect(() => {
    auth && setHelloText(`Hello, ${user}!`);
  }, [auth]);
  return (
    <>
      {auth ? (
        <NavBar helloText={helloText} loggedIn={true}></NavBar>
      ) : (
        <NavBar helloText="" loggedIn={false}></NavBar>
      )}
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>404 - Not Found</h1>
        <p>The page you are looking for does not exist.</p>
      </div>
    </>
  );
}

export default NotFound;
