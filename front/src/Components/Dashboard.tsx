import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../authContext";
import NavBar from "./NavBar";
import QuizzesCarousel from "./QuizzesCarousel";
import axios from "axios";
import { QuizzesWithScoresLinks } from "./utils";
import { quizIds } from "./utils";
import { Box, Grid, Button } from "@mui/material";
import { AddCircleOutline } from "@mui/icons-material";
interface Quiz {
  description: string;
  id: number;
  name: string;
  pregenerated: boolean;
  scores: [{ score: number; maxscore: number }] | [];
}

const mapQuizzes = (
  quizzes: Quiz[],
  pregenerated: boolean
): QuizzesWithScoresLinks[] =>
  quizzes
    .filter((quiz: Quiz) => quiz.pregenerated === pregenerated)
    .map((quiz: Quiz) => ({
      quizid: quiz.id,
      name: quiz.name,
      description: quiz.description,
      score:
        quiz.scores.length !== 0
          ? Math.max(...quiz.scores.map((quizscore) => quizscore.score))
          : "Not Taken",
      maxscore: quiz.scores.length !== 0 ? quiz.scores[0].maxscore : 0,
      link: Object.values(quizIds).includes(quiz.id)
        ? `/quiz/${Object.keys(quizIds)
            .find((key) => quizIds[key] === quiz.id)
            ?.replace("_", "/")}`
        : `/takequiz/${quiz.id}`,
    }));

function Dashboard() {
  const { auth, user } = useContext(AuthContext);

  const [helloText, setHelloText] = useState<string>("");
  const [yourQuizzesWithScoresData, setYourQuizzesWithScoresData] = useState<
    QuizzesWithScoresLinks[]
  >([]);
  const [quizScores, setQuizScores] = useState<QuizzesWithScoresLinks[]>([]);
  const [pregeneratedQuizzes, setPregeneratedQuizzes] = useState<
    QuizzesWithScoresLinks[]
  >([]);
  const [usergeneratedQuizzes, setUsergeneratedQuizzes] = useState<
    QuizzesWithScoresLinks[]
  >([]);

  const navigate = useNavigate();

  useEffect(() => {
    auth ? setHelloText(`Hello, ${user}!`) : navigate("/login");
  }, [auth]);

  useEffect(() => {
    (async () => {
      try {
        let response = await axios.get(
          `/api/quizzes/${user}/quizscores/${user}`
        );

        if (response.status == 200) {
          const yourQuizzesWithScoresData: QuizzesWithScoresLinks[] =
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
          setYourQuizzesWithScoresData(yourQuizzesWithScoresData);
        }
      } catch (error) {
        //TODO: Implement error handling
        console.log("ERROR HAS BEEN ENCOUNTERED:");
        console.log(error);
      }
    })();

    (async () => {
      try {
        let response = await axios.get(`/api/quizzes/quizscores/${user}`);

        if (response.status == 200) {
          setPregeneratedQuizzes(mapQuizzes(response.data.quizzes, true));
          setUsergeneratedQuizzes(mapQuizzes(response.data.quizzes, false));
        }
      } catch (error) {
        //TODO: Implement error handling
        console.log("ERROR HAS BEEN ENCOUNTERED:");
        console.log(error);
      }
    })();

    (async () => {
      try {
        //get quiz history
        let response = await axios.get(`/api/quizscores/${user}`);

        if (response.status == 200) {
          const quizzesData = response.data.quizscores.map(
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
          setQuizScores(quizzesData.reverse());
        }
      } catch (error) {
        //TODO: Implement error handling
        console.log("ERROR HAS BEEN ENCOUNTERED:");
        console.log(error);
      }
    })();
  }, []);

  return (
    <>
      <NavBar helloText={helloText} loggedIn={true} />
      <Grid
        container
        style={{ marginRight: "40px", marginLeft: "50px" }}
        justifyContent={"center"}
      >
        <Grid item>
          <Grid container alignContent="center" spacing={2}>
            <Grid item>
              <h2>My Quizzes</h2>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<AddCircleOutline />}
                style={{
                  marginTop: "23px",
                  color: "#103060",
                  border: "1px solid #103060",
                }}
                onClick={() => navigate("/createquiz")}
              >
                Create Quiz
              </Button>
            </Grid>
          </Grid>
          {yourQuizzesWithScoresData.length != 0 && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <QuizzesCarousel quizzes={yourQuizzesWithScoresData} />
              </Box>
            </>
          )}

          {pregeneratedQuizzes.length != 0 && (
            <>
              <h2>Quizzes from us</h2>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <QuizzesCarousel quizzes={pregeneratedQuizzes} />
              </Box>
            </>
          )}

          {usergeneratedQuizzes.length != 0 && (
            <>
              <h2>Quizzes from users</h2>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <QuizzesCarousel quizzes={usergeneratedQuizzes} />
              </Box>
            </>
          )}

          {quizScores.length != 0 && (
            <>
              <h2>Quiz History</h2>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <QuizzesCarousel quizzes={quizScores} />
              </Box>
            </>
          )}
        </Grid>
      </Grid>
    </>
  );
}

export default Dashboard;
