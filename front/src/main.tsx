import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout.tsx";
import "./styles/index.css";
import LogIn from "./Components/LogIn.tsx";
import HomePage from "./Components/HomePage.tsx";
import SignUp from "./Components/SignUp.tsx";
import Dashboard from "./Components/Dashboard.tsx";
import CreateQuiz from "./Components/CreateQuiz.tsx";
import MapQuiz from "./Components/MapQuiz.tsx";
import NotFound from "./Components/NotFound.tsx";
import Profile from "./Components/Profile.tsx";
import TakeQuiz from "./Components/TakeQuiz.tsx";

let router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/login",
        element: <LogIn />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/createquiz",
        element: <CreateQuiz />,
      },
      {
        path: "/takequiz/:quizID",
        element: <TakeQuiz />,
      },
      {
        path: "/quiz/:region",
        element: <MapQuiz isFlagsQuiz={false} />,
      },
      {
        path: "/quiz/:region/flags",
        element: <MapQuiz isFlagsQuiz={true} />,
      },
      {
        path: "/profile/:username",
        element: <Profile />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
