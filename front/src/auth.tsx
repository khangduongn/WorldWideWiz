import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { AuthContext } from "./authContext";

function AuthProvider({ children }: any) {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<number | null>(null);

  const [cookies] = useCookies(["loggedIn"]);

  useEffect(() => {
    const isAuth = async () => {
      cookies.loggedIn ? setAuth(true) : setAuth(false);
      try {
        const res = await axios.get("/api/logincheck");
        if (res.status === 200) {
          setUser(res.data);
        }
      } catch (error) {
        let err = error as Object;
        console.log(err.toString());
        setUser(null);
      }
    };

    isAuth();
  }, [auth]);

  return (
    <AuthContext.Provider
      value={{ auth, setAuth, user, setUser, currentQuiz, setCurrentQuiz }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
