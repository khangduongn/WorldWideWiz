import axios, { AxiosResponse } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Question } from "./utils";
import { useContext, useEffect, useState } from "react";
import { Input } from "@mui/joy";
import { Box, Button } from "@mui/material";
import { AuthContext } from "../authContext";
import NavBar from "./NavBar";


function TakeQuiz() {

    const { quizID } = useParams();
    let quizIDN: number;
    if (quizID) quizIDN = parseInt(quizID);

    const [questions, setQuestions] = useState<Question[]>([]);
    const quizLength: number = questions.length;

    const [questionIndex, setQuestionIndex] = useState<number>(-1);
    const [questionQuestion, setQuestionQuestion] = useState<string>("");
    const [questionAnswer, setQuestionAnswer] = useState<string>("");
    const [questionOptions, setQuestionOptions] = useState<string[]>([]);
    const [questionScore, setQuestionScore] = useState<number>(0);
    const [helloText, setHelloText] = useState<string>("");

    const [answer, setAnswer] = useState<string>("");
    const [questionScores, setQuestionScores] = useState<number[]>([]);

    const { user, auth } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // if (!auth) navigate("/");
        (async () => {
            const res: AxiosResponse<{questions: Question[]}> = await axios.get(`/api/questions/${quizID}`);
            console.log(res.data.questions);
            setQuestions(res.data.questions);
            setQuestionIndex(0);
        })();
    }, [])

    useEffect(() => {
        auth ? setHelloText(`Hello, ${user}!`) : navigate("/login");
      }, [auth]);

    useEffect(() => {
        if (questionIndex >= 0 && questionIndex < quizLength) {
            setQuestionQuestion(questions[questionIndex].question);
            setQuestionAnswer(questions[questionIndex].answer);
            setQuestionOptions(questions[questionIndex].options);
            setQuestionScore(questions[questionIndex].score);

            // if (questionOptions.length === 0) {
            //     setCurrentQuestionType("input");
            // }
            // else if (questionOptions[0] == "True" && questionOptions[1] == "False") {
            //     setCurrentQuestionType("true-false");
            // }
            // else {
            //     setCurrentQuestionType("multiple-choice");
            // }
        }
    }, [questionIndex]);

    if (questionIndex < quizLength) {
        return (
            <>
                <NavBar helloText={helloText} loggedIn={true} />
                <Box sx={{height: "80vh", width: "100vw", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                    <Box sx={{backgroundColor: "whites", height: "50vh", width: "40vw", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderStyle: "outset", borderRadius: "4px", borderWidth: "2px"}}>
                        <Box sx={{position: "absolute", left: "1vw", top: "8vh"}}>
                            <h2>Question {questionIndex + 1} | {questionScore} Points</h2>
                        </Box>
                        <Box sx={{width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3vh"}}>
                            <h1>{questionQuestion}</h1>
                            <Box>
                                {questionOptions.length == 0 ? 
                                <Box sx={{display: "flex", alignItems: "center", justifyContent: "center", gap: "1vw"}}>
                                    <Input value={answer} onChange={(e) => setAnswer(e.target.value)}></Input> 
                                    <Button onClick={() => {
                                        const currentScores = questionScores;
                                        answer == questionAnswer ? currentScores.push(questionScore) : currentScores.push(0);
                                        setAnswer("");
                                        setQuestionScores(currentScores);
                                        setQuestionIndex(questionIndex + 1);
                                    }} variant="contained" color="secondary">Submit Answer</Button>
                                </Box> : questionOptions[0] == "True" && questionOptions[1] == "False" ?
                                    <Box sx={{display: "flex", gap: "1vw"}}>
                                        <Button onClick={() => {
                                            const currentScores = questionScores;
                                            "True" == questionAnswer ? currentScores.push(questionScore) : currentScores.push(0);
                                            setQuestionScores(currentScores);
                                            setQuestionIndex(questionIndex + 1);
                                        }} variant="contained" color="success">True</Button>
                                        <Button onClick={() => {
                                            const currentScores = questionScores;
                                            "False" == questionAnswer ? currentScores.push(questionScore) : currentScores.push(0);
                                            setQuestionScores(currentScores);
                                            setQuestionIndex(questionIndex + 1);
                                        }} variant="contained" color="error">False</Button>
                                    </Box>
                                :
                                <Box sx={{display: "flex", gap: "0.5vw"}}>
                                    {questionOptions.map((option) => (
                                        <Button onClick={() => {
                                            const currentScores = questionScores;
                                            option == questionAnswer ? currentScores.push(questionScore) : currentScores.push(0);
                                            setQuestionScores(currentScores);
                                            setQuestionIndex(questionIndex + 1);
                                        }} variant="contained" color="info">{option}</Button>
                                    ))}
                                </Box>}
                            </Box>
                        </Box>
                    </Box>
                </Box>
                    
            </>
        )
    }
    else {
        const playerScore: number = questionScores.reduce((acc, currentValue) => {return acc + currentValue}, 0);
        const totalScore: number = questions.map((question) => question.score).reduce((acc, currentValue) => {return acc + currentValue}, 0);
        const percentage: number = playerScore/totalScore;
        return (
            <>
                <NavBar helloText={helloText} loggedIn={true} />
                <Box sx={{height: "80vh", width: "100vw", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                    <Box sx={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "5%", borderStyle: "outset", borderRadius: "4px", borderWidth: "2px"}}>
                        <h1>Total Score: {playerScore} | {(percentage*100).toFixed(2)}%</h1>
                        {/* <h2>Score by Question</h2> */}
                        {/* <>
                            {questionScores.map((score) => {
                                <h3>{score}</h3>
                            })}
                        </> */}
                        {percentage < 0.5 && <h2>That was terrible, sorry. Try again!</h2>}
                        {percentage >= 0.5 && percentage < 0.75 && <h2>Eh, that wasn't too bad. You should definitely brush up on the topic!</h2>}
                        {percentage >= 0.75 && percentage < 0.90 && <h2>Nice try! You'll get even better next time!</h2>}
                        {percentage >= 0.90 && percentage < 1 && <h2>Wow, almost perfect!</h2>}
                        {percentage == 1 && <h2>Wow, a perfect score! Congratulations, that's impressive!</h2>}
                        <Button onClick={async () => {
                            console.log({ username: user, score: totalScore, quizid: quizIDN });
                            await axios.post("/api/quizscores", { username: user, score: playerScore, quizid: quizIDN, maxscore: totalScore });
                            navigate("/dashboard"); // Navigate to new page: /leaderboard/:quizID maybe?
                        }} variant="contained" color="secondary">Save and Exit</Button>
                    </Box>
                </Box>
            </>
        )
    }
            
}

export default TakeQuiz;