import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../authContext";
import axios from "axios";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import {
  Grid,
  Card,
  CardContent,
  Input,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Button,
  ButtonGroup,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  RemoveCircleOutline,
  AddCircleOutline,
  Delete,
} from "@mui/icons-material";
import NavBar from "./NavBar";

interface Question {
  question: string;
  answer: string;
  options: string[];
  score: number;
  order: number;
  type: "multiple-choice" | "true-false" | "short-answer";
  [key: string]: string | number | string[];
}

interface QuestionWithQuizId {
  question: string;
  answer: string;
  options: string[];
  score: number;
  order: number;
  quizid: number;
}

function CreateQuizUI() {
  const { auth, user } = useContext(AuthContext);
  const [helloText, setHelloText] = useState<string>("");
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState<boolean>(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] =
    useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [numQuestions, setNumQuestions] = useState<number>(1);
  const [quizName, setQuizName] = useState<string>("");
  const [quizDescription, setQuizDescription] = useState<string>("");
  const [createQuizData, setCreateQuizData] = useState<Question[]>([
    {
      question: "",
      answer: "",
      options: [],
      score: 0,
      order: 0,
      type: "short-answer",
    },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    auth ? setHelloText(`Hello, ${user}!`) : navigate("/login");
  }, [auth]);

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newCreateQuizData = Array.from(createQuizData);

    //remove the question at the source index
    const [reorderedQuestion] = newCreateQuizData.splice(
      result.source.index,
      1
    );

    //place the question back at the destination index
    newCreateQuizData.splice(result.destination.index, 0, reorderedQuestion);

    newCreateQuizData.forEach((question, index) => {
      question.order = index;
    });

    setCreateQuizData(newCreateQuizData);
  };

  const handleAddQuestion = () => {
    setNumQuestions(numQuestions + 1);
    setCreateQuizData([
      ...createQuizData,
      {
        question: "",
        answer: "",
        options: [],
        score: 0,
        order: numQuestions,
        type: "short-answer",
      },
    ]);
  };

  const handleInputChange = (
    question_index: number,
    property_name: string,
    value: string
  ) => {
    const newCreateQuizData: Question[] = [...createQuizData];

    newCreateQuizData[question_index][property_name] = value;

    setCreateQuizData(newCreateQuizData);
  };

  const handleOptionsChange = (
    question_index: number,
    option_index: number,
    value: string
  ) => {
    const newCreateQuizData: Question[] = [...createQuizData];

    if (
      newCreateQuizData[question_index].answer ==
      newCreateQuizData[question_index].options[option_index]
    ) {
      newCreateQuizData[question_index].answer = value;
    }
    newCreateQuizData[question_index].options[option_index] = value;
    setCreateQuizData(newCreateQuizData);
  };

  const handleTypeChange = (question_index: number, new_type: string) => {
    const newCreateQuizData: Question[] = [...createQuizData];
    if (new_type === "short-answer" || new_type === "multiple-choice") {
      newCreateQuizData[question_index].options = [];
      newCreateQuizData[question_index].answer = "";
      newCreateQuizData[question_index].type = new_type;
    } else if (new_type === "true-false") {
      newCreateQuizData[question_index].options = ["true", "false"];
      newCreateQuizData[question_index].answer = "true";
      newCreateQuizData[question_index].type = new_type;
    }
    setCreateQuizData(newCreateQuizData);
  };

  const handleDeleteQuestion = (question_index: number) => {
    const newCreateQuizData: Question[] = [...createQuizData];
    newCreateQuizData.splice(question_index, 1);
    newCreateQuizData.forEach((question, index) => {
      question.order = index;
    });
    setCreateQuizData(newCreateQuizData);
    setNumQuestions(numQuestions - 1);
  };

  async function handleCreateQuiz() {
    try {
      const errors: string[] = [];

      if (quizName === "") {
        errors.push("Quiz needs a name");
      }

      createQuizData.forEach((question) => {
        if (question.question === "") {
          errors.push(`Question ${question.order + 1} is empty`);
        }

        if (question.answer === "") {
          errors.push(`Question ${question.order + 1} has no answer`);
        }

        if (question.score < 0) {
          errors.push(
            `Question ${question.order + 1} cannot have negative points`
          );
        }

        if (question.order < 0) {
          errors.push(
            `Question ${question.order + 1} cannot have a negative order`
          );
        }

        if (question.options.length == 0) {
          if (
            question.type == "multiple-choice" ||
            question.type == "true-false"
          )
            errors.push(
              `Question ${question.order + 1} does not have any choices`
            );
        } else {
          let numEmptyOptions = 0;
          question.options.forEach((option) => {
            if (option.trim() === "") {
              numEmptyOptions += 1;
            }
          });

          if (numEmptyOptions !== 0) {
            errors.push(
              `Question ${
                question.order + 1
              } cannot have ${numEmptyOptions} blank option(s)`
            );
          }

          if (question.answer.trim() === "") {
            errors.push(
              `Question ${
                question.order + 1
              } cannot have an answer belonging to an option that is blank`
            );
          }
        }
      });

      if (createQuizData.length === 0) {
        errors.push("Your quiz needs questions");
      }

      if (errors.length !== 0) {
        //need to print error
        setMessage(errors.join("\n"));
        setOpenErrorSnackbar(true);
        return;
      }

      const response = await axios.post(`/api/quizzes/`, {
        name: quizName,
        description: quizDescription,
        username: user,
      });

      if (response.status == 201) {
        const quizid = response.data.quiz.id;

        let newCreateQuizData: QuestionWithQuizId[] = createQuizData.map(
          (question) => {
            let { type, score, ...questionWithoutTypeAndScore } = question;
            return {
              ...questionWithoutTypeAndScore,
              score: parseInt(score.toString()),
              quizid: quizid,
            };
          }
        );
        console.log(newCreateQuizData);
        const responseQuestions = await axios.post(`/api/questions/many`, {
          questions: newCreateQuizData,
        });

        if (responseQuestions.status != 201) {
          setMessage(responseQuestions.data.error);
          setOpenErrorSnackbar(true);
          return;
        }

        setMessage("");
        setOpenErrorSnackbar(false);
        setOpenSuccessSnackbar(true);
        setCreateQuizData([
          {
            question: "",
            answer: "",
            options: [],
            score: 0,
            order: 0,
            type: "short-answer",
          },
        ]);
        setQuizName("");
        setQuizDescription("");
      } else {
        setMessage(response.data.error);
        setOpenErrorSnackbar(true);
      }
    } catch (error) {
      //TODO: Implement error handling
      console.log("ERROR HAS BEEN ENCOUNTERED:");
      console.log(error);
    }
  }

  return (
    <>
      <NavBar helloText={helloText} loggedIn={true} />
      <Grid container justifyContent="center">
        <Grid item>
          <h1>Create a Quiz</h1>
          <Card
            style={{
              backgroundColor: "#e3f2fd",
              padding: "20px",
              width: "760px",
              marginBottom: "10px",
              borderTop: "6px solid #103060",
            }}
          >
            <Grid container>
              <Grid item xs={4}>
                <InputLabel className="questionLabel">Quiz Name</InputLabel>
                <Input
                  type="text"
                  name="quizName"
                  value={quizName}
                  style={{ width: "80%" }}
                  onChange={(e) => setQuizName(e.target.value)}
                />
              </Grid>
              <Grid item xs={8}>
                <InputLabel className="questionLabel">Description</InputLabel>
                <Input
                  type="text"
                  name="quizDescription"
                  value={quizDescription}
                  style={{ width: "100%" }}
                  onChange={(e) => setQuizDescription(e.target.value)}
                />
              </Grid>
            </Grid>
          </Card>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <Grid
                  container
                  direction="column"
                  spacing={2}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {createQuizData.map((question, index) => (
                    <Draggable
                      key={index}
                      draggableId={index.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <Grid
                          item
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                        >
                          <Card
                            style={{
                              width: "800px",
                              backgroundColor: "#e3f2fd",
                              borderRadius: "5px",
                            }}
                          >
                            <CardContent>
                              <h2>Question {index + 1}</h2>
                              <Grid container spacing={2} marginBottom={3}>
                                <Grid item xs={6}>
                                  <InputLabel>Question</InputLabel>
                                  <Input
                                    type="text"
                                    name="question"
                                    value={question.question}
                                    style={{ width: "90%" }}
                                    onChange={(e) =>
                                      handleInputChange(
                                        index,
                                        e.target.name,
                                        e.target.value
                                      )
                                    }
                                  />
                                </Grid>
                                <Grid item xs={3}>
                                  <InputLabel>Points</InputLabel>
                                  <Input
                                    type="number"
                                    name="score"
                                    value={question.score}
                                    style={{ width: "80%" }}
                                    inputProps={{ min: 0 }}
                                    onChange={(e) =>
                                      handleInputChange(
                                        index,
                                        e.target.name,
                                        e.target.value
                                      )
                                    }
                                  />
                                </Grid>
                                <Grid item xs={2}>
                                  <FormControl>
                                    <InputLabel id="select-type-label">
                                      Type
                                    </InputLabel>
                                    <Select
                                      labelId="select-type-label"
                                      name="type"
                                      label="Type"
                                      value={question.type}
                                      onChange={(e) =>
                                        handleTypeChange(index, e.target.value)
                                      }
                                    >
                                      <MenuItem value="multiple-choice">
                                        Multiple Choice
                                      </MenuItem>
                                      <MenuItem value="true-false">
                                        True/False
                                      </MenuItem>
                                      <MenuItem value="short-answer">
                                        Short Answer
                                      </MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                              </Grid>
                              {question.type === "multiple-choice" && (
                                <>
                                  <InputLabel>Options</InputLabel>

                                  {question.options.map(
                                    (option, choice_index) => (
                                      <Input
                                        key={choice_index}
                                        type="text"
                                        value={option}
                                        style={{
                                          display: "block",
                                          width: "70%",
                                          marginBottom: "20px",
                                        }}
                                        onChange={(e) =>
                                          handleOptionsChange(
                                            index,
                                            choice_index,
                                            e.target.value
                                          )
                                        }
                                      />
                                    )
                                  )}
                                  <Grid>
                                    <ButtonGroup
                                      style={{ marginBottom: "10px" }}
                                    >
                                      <IconButton
                                        onClick={() => {
                                          const newCreateQuizData = [
                                            ...createQuizData,
                                          ];
                                          newCreateQuizData[index].options.push(
                                            ""
                                          );
                                          setCreateQuizData(newCreateQuizData);
                                        }}
                                      >
                                        <AddCircleOutline />
                                      </IconButton>
                                      <IconButton
                                        onClick={() => {
                                          const newCreateQuizData = [
                                            ...createQuizData,
                                          ];
                                          if (
                                            newCreateQuizData[index].answer ==
                                            newCreateQuizData[index].options[
                                              newCreateQuizData[index].options
                                                .length - 1
                                            ]
                                          ) {
                                            if (
                                              newCreateQuizData[index].options
                                                .length <= 1
                                            ) {
                                              newCreateQuizData[index].answer =
                                                "";
                                            } else {
                                              newCreateQuizData[index].answer =
                                                newCreateQuizData[
                                                  index
                                                ].options[0];
                                            }
                                          }
                                          newCreateQuizData[
                                            index
                                          ].options.pop();
                                          setCreateQuizData(newCreateQuizData);
                                        }}
                                      >
                                        <RemoveCircleOutline />
                                      </IconButton>
                                    </ButtonGroup>
                                  </Grid>
                                  <FormControl>
                                    <InputLabel id="multiple-choice-select-label">
                                      Answer
                                    </InputLabel>
                                    <Select
                                      label="Answer"
                                      labelId="multiple-choice-select-label"
                                      style={{ width: "200px" }}
                                      name="answer"
                                      value={question.answer}
                                      onChange={(e) =>
                                        handleInputChange(
                                          index,
                                          e.target.name,
                                          e.target.value
                                        )
                                      }
                                    >
                                      {question.options.map(
                                        (option, op_index) => (
                                          <MenuItem
                                            style={{ height: "40px" }}
                                            key={op_index}
                                            value={option}
                                          >
                                            {option}
                                          </MenuItem>
                                        )
                                      )}
                                    </Select>
                                  </FormControl>
                                </>
                              )}
                              {question.type === "true-false" && (
                                <FormControl>
                                  <InputLabel id="true-false-select-label">
                                    Answer
                                  </InputLabel>
                                  <Select
                                    name="answer"
                                    labelId="true-false-select-label"
                                    label="Answer"
                                    value={question.answer}
                                    onChange={(e) =>
                                      handleInputChange(
                                        index,
                                        e.target.name,
                                        e.target.value
                                      )
                                    }
                                  >
                                    <MenuItem value="true">True</MenuItem>
                                    <MenuItem value="false">False</MenuItem>
                                  </Select>
                                </FormControl>
                              )}
                              {question.type === "short-answer" && (
                                <>
                                  <InputLabel>Answer</InputLabel>
                                  <Input
                                    type="text"
                                    name="answer"
                                    style={{ width: "95%" }}
                                    value={question.answer}
                                    onChange={(e) =>
                                      handleInputChange(
                                        index,
                                        e.target.name,
                                        e.target.value
                                      )
                                    }
                                  />
                                </>
                              )}
                              <Grid
                                container
                                justifyContent="center"
                                marginTop={3}
                              >
                                <IconButton
                                  onClick={() => handleDeleteQuestion(index)}
                                >
                                  <Delete />
                                </IconButton>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Grid>
              )}
            </Droppable>
          </DragDropContext>
          <Grid container style={{ width: "800px" }} justifyContent="center">
            <IconButton color="primary" onClick={handleAddQuestion}>
              <AddCircleOutline />
            </IconButton>
          </Grid>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              style={{ backgroundColor: "#103060" }}
              onClick={handleCreateQuiz}
            >
              Create Quiz
            </Button>
          </div>
        </Grid>
      </Grid>
      <Snackbar
        open={openErrorSnackbar}
        onClose={() => setOpenErrorSnackbar(false)}
        message={message}
        ContentProps={{
          style: {
            backgroundColor: "#d32f2f",
          },
        }}
        style={{
          height: "auto",
          lineHeight: "28px",
          whiteSpace: "pre-line",
        }}
      />
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSuccessSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSuccessSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Quiz created successfully!
        </Alert>
      </Snackbar>
    </>
  );
}

export default CreateQuizUI;
