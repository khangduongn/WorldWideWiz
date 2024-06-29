import {
  useState,
  useEffect,
  useContext,
  ReactNode,
  SyntheticEvent,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, Tab, Typography, Box } from "@mui/material";
import axios from "axios";
import NavBar from "./NavBar";
import { AuthContext } from "../authContext";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { QuizzesWithScoresLinks, quizIds } from "./utils";
import QuizzesCarousel from "./QuizzesCarousel";

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

interface Quiz {
  description: string;
  id: number;
  name: string;
  pregenerated: boolean;
  scores: [{ score: number; maxscore: number }] | [];
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}

// this function takes an array of quizscore objects for a user.
// it removes all duplicate quizscore objects for the same quiz but keepd the quizscore with the highest score for the quiz
function removeDuplicateQuizzesAndKeepMaxScore(
  quizscores: QuizzesWithScoresLinks[]
): QuizzesWithScoresLinks[] {
  const uniqueHighScoresForQuizzes = new Map<number, QuizzesWithScoresLinks>();

  quizscores.forEach((quizscore) => {
    // if the quiz doesn't have a score or if the score for the current quiz is the high score
    if (
      !uniqueHighScoresForQuizzes.has(quizscore.quizid) ||
      quizscore.score > uniqueHighScoresForQuizzes.get(quizscore.quizid)!.score
    ) {
      uniqueHighScoresForQuizzes.set(quizscore.quizid, quizscore);
    }
  });

  return Array.from(uniqueHighScoresForQuizzes.values());
}

function Profile() {
  const [value, setValue] = useState(0);
  const { auth, user } = useContext(AuthContext);
  const [helloText, setHelloText] = useState<string>("");
  const [quizzesWithScores, setQuizzesWithScores] = useState<
    QuizzesWithScoresLinks[]
  >([]);
  const [allQuizzesWithScoresForUser, setAllQuizzesWithScoresForUser] =
    useState<QuizzesWithScoresLinks[]>([]);
  const handleChange = (_: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const navigate = useNavigate();
  useEffect(() => {
    auth ? setHelloText(`Hello, ${user}!`) : navigate("/login");
  }, [auth]);

  const { username } = useParams(); //username of the user being searched

  useEffect(() => {
    (async () => {
      try {
        let response = await axios.get(
          `/api/quizzes/${username}/quizscores/${user}`
        ); //may need to change if added drafted quizzes

        if (response.status == 200) {
          const quizzesWithScoresData: QuizzesWithScoresLinks[] =
            response.data.quizzes.map(
              ({
                id,
                description,
                name,
                scores,
              }: {
                id: number;
                description: string;
                name: string;
                scores: [{ score: number; maxscore: number }] | [];
              }) => ({
                quizid: id,
                name: name,
                description: description,
                score:
                  scores.length !== 0
                    ? Math.max(...scores.map((quizscore) => quizscore.score))
                    : "Not Taken",
                maxscore: scores.length !== 0 ? scores[0].maxscore : 0,
                link: `/takequiz/${id}`,
              })
            );
          setQuizzesWithScores(quizzesWithScoresData);
        }
      } catch (error) {
        //TODO: Implement error handling
        console.log("ERROR HAS BEEN ENCOUNTERED:");
        console.log(error);
      }
    })();

    (async () => {
      try {
        let response = await axios.get(`/api/quizscores/${username}`);

        if (response.status == 200) {
          const allQuizzesWithScoresForUserData = response.data.quizscores.map(
            ({
              quizid,
              score,
              maxscore,
              quiz: { name, description },
            }: {
              quizid: number;
              score: number;
              maxscore: number;
              quiz: Quiz;
            }) => ({
              quizid: quizid,
              name: name,
              description: description,
              score: score,
              maxscore: maxscore,
              link: Object.values(quizIds).includes(quizid)
                ? `/quiz/${Object.keys(quizIds)
                    .find((key) => quizIds[key] === quizid)
                    ?.replace("_", "/")}`
                : `/takequiz/${quizid}`,
            })
          );

          setAllQuizzesWithScoresForUser(
            removeDuplicateQuizzesAndKeepMaxScore(
              allQuizzesWithScoresForUserData
            )
          );
        }
      } catch (error) {
        //TODO: Implement error handling
        console.log("ERROR HAS BEEN ENCOUNTERED:");
        console.log(error);
      }
    })();
  }, [username]);

  return (
    <>
      <NavBar helloText={helloText} loggedIn={true}></NavBar>
      <div style={{ margin: "20px" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AccountCircle sx={{ fontSize: 50 }} />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ marginLeft: 1 }}
          >
            {username}
          </Typography>
        </Box>

        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="Quizzes" {...a11yProps(0)} />
              <Tab label="Scores" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <QuizzesCarousel quizzes={quizzesWithScores} />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <QuizzesCarousel
              quizzes={allQuizzesWithScoresForUser}
              user={username}
            />
          </CustomTabPanel>
        </Box>
      </div>
    </>
  );
}

export default Profile;
