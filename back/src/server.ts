import express, {
  CookieOptions,
  RequestHandler,
  Request,
  Response,
} from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import crypto from "crypto";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as url from "url";

// let __dirname = require('url').pathToFileURL(__filename).toString();

const prisma = new PrismaClient();

let app = express();

let port = 3000;
let host = "localhost";
let protocol = "http";

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
  })
);

app.use(express.static("public"));

let authorize: RequestHandler = async (req: Request, res, next) => {
  try {
    let token: string = req.cookies.token;
    if (token === undefined) throw new Error();
    await prisma.token.findFirstOrThrow({ where: { token: token } });
  } catch (error) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  next();
};

app.listen(port, host, () => {
  console.log(`${protocol}://${host}:${port}`);
});

//
// GET REQUESTS
//

// get all users by username
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
    });
    return res.status(200).json({ users: users });
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

// get user by username
app.get("/api/users/:username", async (req, res) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { username: req.params.username },
    });
    return res.status(200).json({ user: user });
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

// get all quizzes created by a user with the scores from a player
app.get(
  "/api/quizzes/:username/quizscores/:playerUsername",
  async (req, res) => {
    const { username, playerUsername } = req.params;

    try {
      const quizzesWithScores = await prisma.quiz.findMany({
        where: {
          username: username,
        },
        select: {
          scores: {
            where: {
              username: playerUsername,
            },
            select: {
              score: true,
              maxscore: true,
            },
          },
          id: true,
          name: true,
          description: true,
        },
      });
      return res.status(200).json({ quizzes: quizzesWithScores });
    } catch (err) {
      let error = err as Object;
      return res.status(400).json({ error: error.toString() });
    }
  }
);

// get all quizzes and quiz scores from player (if available)
app.get("/api/quizzes/quizscores/:playerUsername", async (req, res) => {
  const { playerUsername } = req.params;

  try {
    const quizzesWithScores = await prisma.quiz.findMany({
      select: {
        scores: {
          where: {
            username: playerUsername,
          },
          select: {
            score: true,
            maxscore: true,
          },
        },
        id: true,
        name: true,
        description: true,
        pregenerated: true,
      },
    });
    return res.status(200).json({ quizzes: quizzesWithScores });
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

// get all quizzes
app.get("/api/quizzes", async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany();
    return res.status(200).json({ quizzes: quizzes });
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

// get all quizzes created by a user
app.get("/api/quizzes/:username", async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { username: req.params.username },
    });
    return res.status(200).json({ quizzes: quizzes });
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

// get a user's scores on all quizzes
app.get("/api/quizscores/:username", async (req, res) => {
  try {
    const quizscores = await prisma.quizScore.findMany({
      where: { username: req.params.username },
      include: {
        quiz: true,
      },
    });

    return res.status(200).json({ quizscores: quizscores });
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

// get a user's score on a quiz
app.get("/api/quizscores/:username/:quizID", async (req, res) => {
  try {
    const quizscore = await prisma.quizScore.findFirstOrThrow({
      where: {
        username: req.params.username,
        quizid: parseInt(req.params.quizID),
      },
    });
    return res.status(200).json({ quizscore: quizscore });
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

app.get("/api/quizscores/:quizID", async (req, res) => {
  try {
    const quizscore = await prisma.quizScore.findMany({
      where: {
        quizid: parseInt(req.params.quizID),
      },
    });
    return res.status(200).json({ quizscore: quizscore });
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

// get a user's score on a quiz question
app.get("/api/questionscores/:username/:questionID", async (req, res) => {
  try {
    const score = await prisma.questionScore.findFirstOrThrow({
      where: {
        playername: req.params.username,
        questionid: parseInt(req.params.questionID),
      },
    });
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

// get a user's scores on all quiz questions of a quiz
// To do that we have to modify question/(maybe questionscore) schema to add relation to quiz (do we need to do that?)
app.get("/api/questionscores/:username/quiz/:quizID", async (req, res) => {
  return res.json();
});

// get quiz based on id of the quiz
app.get("/api/quizzes/:quizId", async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUniqueOrThrow({
      where: { id: parseInt(req.params.quizId) },
    });
    return res.status(200).json({ quiz: quiz });
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

app.get("/api/questions", async (req, res) => {
  try {
    const questions = await prisma.question.findMany();
    return res.status(200).json({ questions: questions });
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

// get all questions on a quiz
app.get("/api/questions/:quizId", async (req, res) => {
  try {
    console.log("Retrieving questions from quiz with ID:", req.params.quizId);
    const questions = await prisma.question.findMany({
      where: { quizid: { equals: parseInt(req.params.quizId) } },
    });
    return res.status(200).json({ questions: questions });
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

//
// DELETE REQUESTS
//

// delete all quizzes created by user - do we really need this?
app.delete("/api/quizzes/:username", async (req, res) => {
  return res.json();
});

// delete a user's quiz by id
app.delete("/api/quizzes/:quizId", async (req, res) => {
  try {
    await prisma.quiz.delete({ where: { id: parseInt(req.params.quizId) } });
    return res.status(200).json();
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

// delete a user's quiz score (must delete all scores on all questions in the quiz) --> modify when adding quiz to questions
app.delete("/api/quizscores/:username/:quizId", async (req, res) => {
  try {
    await prisma.quizScore.deleteMany({
      where: { username: req.params.username },
    });
    return res.status(200).json();
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

// delete a question on a user's quiz
app.delete("/api/questions/:questionId", async (req, res) => {
  try {
    const qId = parseInt(req.params.questionId);
    console.log("QUESTION ID TO DELETE:", qId);
    await prisma.question.delete({ where: { id: qId } });
    return res.status(200).json();
  } catch (err) {
    let error = err as Object;
    console.log(error.toString());
    return res.status(400).json({ error: error.toString() });
  }
});

// delete all questions on a user's quiz
app.delete("/api/questions/:quizId", async (req, res) => {
  try {
    await prisma.question.deleteMany({
      where: { quizid: parseInt(req.params.quizId) },
    });
    return res.status(200).json();
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

//
// POST REQUESTS
//

// login

let tokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
};

app.get("/api/logincheck", async (req, res) => {
  let { token } = req.cookies;
  if (token === undefined) {
    return res.sendStatus(401);
  }
  let storedSession = await prisma.token.findFirst({ where: { token: token } });
  if (
    storedSession === null ||
    storedSession.token === null ||
    storedSession.token === undefined
  ) {
    return res.status(401).clearCookie("token", tokenCookieOptions).send();
  }
  return res.status(200).send(storedSession.username);
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  // Zod schema validation
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { username: username },
    });
    if (!(await argon2.verify(user.password, password)))
      throw new Error("Username and password don't match");
    const token: string = await crypto.randomBytes(32).toString("hex");
    await prisma.token.create({
      data: {
        username: username,
        token: token,
      },
    });
    return res
      .status(201)
      .cookie("token", token, tokenCookieOptions)
      .cookie("loggedIn", "true")
      .json();
  } catch (error) {
    let err = error as Object;
    return res.status(400).json({ error: err.toString() });
  }
});

// logout
app.post("/api/logout", authorize, async (req, res) => {
  try {
    let token: string = req.cookies.token;
    await prisma.token.deleteMany({ where: { token: token } });
  } catch (err) {
    let error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
  return res.status(200).clearCookie("token").clearCookie("loggedIn").json();
});

//add a user through signup
app.post("/api/signup", async (req, res) => {
  // Zod schema validation
  const { username, password } = req.body;
  const hashedPassword = await argon2.hash(password);
  let existingUser = await prisma.user.findFirst({
    where: { username: username },
  });
  if (existingUser !== null)
    return res.status(400).json({ error: "Username already exists" });
  await prisma.user.create({
    data: {
      username: username,
      password: hashedPassword,
    },
  });
  return res.sendStatus(201);
});

//add a quiz score to a quiz
app.post("/api/quizscores", async (req, res) => {
  // Zod schema validation
  const { username, quizid, score, maxscore } = req.body;

  try {
    await prisma.quizScore.create({
      data: {
        username: username,
        quizid: quizid,
        score: score,
        maxscore: maxscore,
      },
    });

    return res.status(201).json({
      quizscore: {
        username: username,
        quizid: quizid,
        score: score,
        maxscore: maxscore,
      },
    });
  } catch (err) {
    const error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

//add a score to a quiz question
app.post("/api/questionscores", async (req, res) => {
  return res.json();
});

interface NewQuiz {
  name: string;
  description: string;
  username: string;
}

//add a quiz
app.post("/api/quizzes", async (req: Request<NewQuiz>, res) => {
  const { name, description, username } = req.body;
  try {
    const quiz = await prisma.quiz.create({
      data: {
        name: name,
        description: description,
        username: username,
        pregenerated: false,
        scores: {},
        questions: {},
      },
    });
    return res.status(201).json({ quiz: quiz });
  } catch (err) {
    const error = err as Object;
    console.log(error.toString());
    return res.status(400).json({ error: error.toString() });
  }
});

interface NewQuestion {
  question: string;
  answer: string;
  options: string[];
  quizId: number;
  score: number;
  order?: number;
}

//add a question to a quiz
app.post("/api/questions", async (req: Request<NewQuestion>, res) => {
  const { question, answer, options, quizId, score, order } = req.body;
  try {
    const questionRes = await prisma.question.create({
      data: {
        question: question,
        answer: answer,
        options: options,
        quizid: quizId,
        score: score,
        order: order,
      },
    });
    return res.status(201).json(questionRes);
  } catch (err) {
    const error = err as Object;
    console.log(error.toString());
    return res.status(400).json({ error: error.toString() });
  }
});

//add many questions to a quiz
app.post("/api/questions/many", async (req: Request<NewQuestion[]>, res) => {
  const { questions } = req.body;
  try {
    const questionsRes = await prisma.question.createMany({
      data: questions,
    });
    return res.status(201).json({ questions: questionsRes });
  } catch (err) {
    const error = err as Object;
    console.log(error.toString());
    return res.status(400).json({ error: error.toString() });
  }
});

//
// PUT REQUESTS --> Need more info about client side usage to determine request types
//

// edit a user
app.put("api/users", async (req, res) => {
  return res.json();
});

// edit a quiz score
app.put("/api/quizscores", async (req, res) => {
  const { username, quizid, score } = req.body;

  try {
    let existingQuizScore = await prisma.quizScore.findFirst({
      where: { username: username, quizid: quizid },
    });

    if (existingQuizScore === null)
      return res.status(400).json({ error: "Score for quiz does not exist" });

    await prisma.quizScore.update({
      where: {
        id: existingQuizScore.id,
        username: username,
        quizid: quizid,
      },
      data: {
        score,
      },
    });

    return res.status(200).json({
      quizscore: {
        username: username,
        quizid: quizid,
        score: score,
      },
    });
  } catch (err) {
    const error = err as Object;
    return res.status(400).json({ error: error.toString() });
  }
});

app.get("*", (req, res) => { // 2
  res.sendFile("public/index.html", { root: __dirname });
});
