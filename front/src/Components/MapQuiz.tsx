import { MapContainer, GeoJSON } from "react-leaflet";
import data from "../data/countries.json";
import countriesWithRegions from "../data/countries_with_regions.json";
import {
  shuffle,
  filterCountriesByRegion,
  useStableCallback,
  CountriesJSONData,
  CountryColors,
  CountryData,
  quizIds,
} from "./utils";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { Layer, LayerEvent } from "leaflet";
import { AuthContext } from "../authContext";
import NavBar from "./NavBar";

const regions = ["americas", "asia", "africa", "europe", "oceania"];

interface MapQuizProps {
  isFlagsQuiz: boolean;
}

function MapQuiz({ isFlagsQuiz }: MapQuizProps) {
  const { auth, user } = useContext(AuthContext);
  const navigate = useNavigate();
  let [countryColors, setCountryColors] = useState<CountryColors>({});
  let [score, setScore] = useState<number>(0);
  let [dialogOpen, setDialogOpen] = useState<boolean>(false);
  let [flagSrc, setFlagSrc] = useState<string>("");

  const { region } = useParams();

  const mapData: any = data as unknown as CountriesJSONData;
  let countries = mapData.features;

  let filteredCountries = filterCountriesByRegion(
    countries,
    countriesWithRegions,
    region
  );

  const numOfCountries: number = filteredCountries.length;

  let [numOfCountriesRemaining, setNumOfCountriesRemaining] = useState(
    filteredCountries.length
  );

  let [countriesArray, setCountriesArray] = useState<CountryData[]>(
    shuffle(filteredCountries)
  );

  useEffect(() => {
    //might need to find a better solution
    if (!region || (region && !regions.includes(region.toLowerCase()))) {
      navigate("/notfound");
      return;
    }

    if (countriesArray.length === 0) {
      setDialogOpen(true);

      //might remove if statement if it causes problems
      if (auth !== null && user !== null) {
        (async () => {
          const quizIdKey = isFlagsQuiz ? `${region}_flags` : region;
          try {
            if (quizIdKey) {
              await axios.post(`/api/quizscores/`, {
                username: user,
                quizid: quizIds[quizIdKey],
                score: score,
                maxscore: numOfCountries,
              });
            }
          } catch (error) {
            //TODO: Implement error handling
            console.log("ERROR HAS BEEN ENCOUNTERED:");
            console.log(error);
          }
        })();
      }
    } else {
      (async () => {
        try {
          const country_iso: string = countriesArray[0].properties.ISO_A3;
          let response = await axios.get(
            `https://restcountries.com/v3.1/alpha/${country_iso}`
          );

          if (response.status == 200) {
            setFlagSrc(response.data[0].flags.png);
          }
        } catch (error) {
          //TODO: Implement error handling
          console.log("ERROR HAS BEEN ENCOUNTERED:");
          console.log(error);
        }
      })();
    }
  }, [countriesArray]);

  let checkAnswer = (event: LayerEvent) => {
    if (countriesArray.length == 0) {
      let tooltip = event.target
        .bindTooltip(event.target.feature.properties.ADMIN, {
          permanent: true,
        })
        .openTooltip();

      setTimeout(() => {
        event.target.unbindTooltip(tooltip);
      }, 1000);
      return;
    }

    let correctCountryName = countriesArray[0].properties.ADMIN;

    setCountryColors((previousCountryColors) => {
      const updatedColors = { ...previousCountryColors };
      updatedColors[correctCountryName] =
        event.target.feature.properties.ADMIN === correctCountryName
          ? "green"
          : "red";
      return updatedColors;
    });

    if (event.target.feature.properties.ADMIN === correctCountryName) {
      setScore(score + 1);
    } else {
      let tooltip = event.target
        .bindTooltip(event.target.feature.properties.ADMIN, {
          permanent: true,
        })
        .openTooltip();

      setTimeout(() => {
        event.target.unbindTooltip(tooltip);
      }, 1000);
    }
    setCountriesArray((prevCountriesArray) => prevCountriesArray.slice(1));
    setNumOfCountriesRemaining(numOfCountriesRemaining - 1);
  };

  let handleMouseover = (event: LayerEvent) => {
    if (!countryColors[event.target.feature.properties.ADMIN]) {
      let fillColor = "lightgrey";
      event.target.setStyle({
        fillColor: fillColor,
      });
    }
  };

  let handleMouseout = (event: LayerEvent) => {
    event.target.setStyle({
      fillColor: countryColors[event.target.feature.properties.ADMIN] || "grey",
    });
  };

  const stableHandleMouseout = useStableCallback(handleMouseout);
  const stableHandleMouseover = useStableCallback(handleMouseover);
  const stableCheckAnswer = useStableCallback(checkAnswer);

  let onEachCountry = (_: any, layer: Layer) => {
    layer.on({
      click: stableCheckAnswer,
      mouseover: stableHandleMouseover,
      mouseout: stableHandleMouseout,
    });
  };

  return (
    <>
      <NavBar
        helloText={auth !== null && user !== null ? `Hello, ${user}!` : ""}
        loggedIn={auth !== null && user !== null}
      ></NavBar>
      <Grid container justifyContent="center">
        <Grid item>
          <h1 style={{ textAlign: "center" }}>
            {region ? region[0].toUpperCase() + region.slice(1) : ""} Map Quiz
          </h1>
          <Grid container>
            <Grid item xs={4}>
              <div>
                Click on{" "}
                {isFlagsQuiz ? (
                  <>
                    <span>the country with the flag </span>
                    <img
                      style={{
                        width: "80px",
                        height: "50px",
                        border: "1px solid black",
                      }}
                      src={flagSrc}
                      alt="Flag Not Available"
                    />
                  </>
                ) : (
                  <span style={{ fontWeight: "bold" }}>
                    {countriesArray.length > 0 &&
                      countriesArray[0].properties.ADMIN}
                  </span>
                )}
              </div>
            </Grid>
            <Grid item xs={4} alignItems="flex-end">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                Score: {score}/{numOfCountries}
              </div>
            </Grid>
            <Grid item xs={4} alignItems="flex-end">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                  height: "100%",
                }}
              >
                {numOfCountriesRemaining} countries remaining
              </div>
            </Grid>
          </Grid>
          <MapContainer
            style={{
              width: "90vw",
              height: "70vh",
              marginBottom: "5em",
              backgroundColor: "lightblue",
            }}
            center={[53, 20]}
            zoom={4}
            attributionControl={false}
          >
            <GeoJSON
              // @ts-ignore
              data={filteredCountries}
              style={(country) => {
                if (!country) {
                  return {};
                }
                return {
                  color: "black",
                  fillColor: countryColors[country.properties.ADMIN] || "grey",
                  fillOpacity: 1,
                  weight: 2,
                };
              }}
              onEachFeature={onEachCountry}
            />
          </MapContainer>
        </Grid>
      </Grid>
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
      >
        <DialogTitle>Congratulations! You've completed the quiz</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <>
              You got a score of {score}/{numOfCountries}
            </>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogOpen(false);
            }}
            color="primary"
          >
            Review Answers
          </Button>
          <Link to="/">
            <Button
              onClick={() => {
                setDialogOpen(false);
              }}
              color="primary"
            >
              Back to Home
            </Button>
          </Link>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MapQuiz;
