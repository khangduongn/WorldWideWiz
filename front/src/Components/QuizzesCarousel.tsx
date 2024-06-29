import { useState } from "react";
import { Grid, IconButton, Container } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
} from "@mui/material";
import { QuizzesWithScoresLinks } from "./utils";
import { useNavigate } from "react-router-dom";

interface QuizzesCarouselProps {
  quizzes: QuizzesWithScoresLinks[];
  user?: string;
}
function QuizzesCarousel({ quizzes, user }: QuizzesCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);
  const navigate = useNavigate();
  const scrollLeft = () => {
    setStartIndex((prevIndex) => Math.max(prevIndex - 4, 0));
  };

  const scrollRight = () => {
    setStartIndex((prevIndex) => Math.min(prevIndex + 4, quizzes.length));
  };

  return (
    <Container maxWidth="xl" sx={{ margin: 0 }}>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item>
          <IconButton onClick={scrollLeft} disabled={startIndex === 0}>
            <ArrowBackIos />
          </IconButton>
        </Grid>
        <Grid item xs={10}>
          <Grid container spacing={2}>
            {quizzes.slice(startIndex, startIndex + 4).map((quiz, i) => (
              <Grid key={i} item xs={3}>
                <Card sx={{ height: "100%" }}>
                  <CardActionArea onClick={() => navigate(quiz.link)}>
                    <CardContent>
                      <Typography variant="h5">{quiz.name}</Typography>
                      <Box borderBottom={1} mt={1} mb={1} />
                      <Typography variant="body1">
                        Description: {quiz.description}
                      </Typography>
                      <Typography variant="body1">
                        {user ? `${user}'s` : "Your"} score:{" "}
                        {typeof quiz.score === "string"
                          ? quiz.score
                          : `${quiz.score}/${quiz.maxscore} (${(
                              (quiz.score / quiz.maxscore) *
                              100
                            ).toFixed(2)}%)`}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item>
          <IconButton
            onClick={scrollRight}
            disabled={startIndex >= quizzes.length - 4}
          >
            <ArrowForwardIos />
          </IconButton>
        </Grid>
      </Grid>
    </Container>
  );
}

export default QuizzesCarousel;
