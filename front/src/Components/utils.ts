import { useCallback, useRef } from "react";

const quizIds: { [key: string]: number } = {
  europe: 1,
  americas: 2,
  asia: 3,
  africa: 4,
  oceania: 5,
  europe_flags: 6,
  americas_flags: 7,
  asia_flags: 8,
  africa_flags: 9,
  oceania_flags: 10,
};

function shuffle(array: any) {
  let currentIndex = array.length;
  let randomIndex;

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

interface countriesJSONWithRegions {
  "name": string,
  "alpha-2": string,
  "alpha-3": string,
  "country-code": string,
  "iso_3166-2": string,
  "region": string,
  "sub-region": string,
  "intermediate-region": string,
  "region-code": string,
  "sub-region-code": string,
  "intermediate-region-code": string
}

function filterCountriesByRegion(countries: CountryData[], countriesWithRegions: countriesJSONWithRegions[], region: string | undefined): CountryData[] {
  return countries.filter((country: { properties: { ISO_A3: any; }; }) => {
    const countryData = countriesWithRegions.find(
      (countryWithRegion: { [x: string]: any; }) =>
        countryWithRegion["alpha-3"] === country.properties.ISO_A3
    );
    return (
      countryData && region &&
      countryData.region.toLowerCase().trim() === region.toLowerCase().trim()
    );
  });
}

function useStableCallback<Args extends unknown[], Return>(
  callback: (...args: Args) => Return
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const stableCallback = useCallback((...args: Args) => {
    return callbackRef.current(...args);
  }, []);

  return stableCallback;
}

type NestedNumberArray = number | NestedNumberArray[];

interface CountryData {
  type: string;
  properties: {
    ADMIN: string;
    ISO_A3: string;
  };
  geometry: {
    type: string;
    coordinates: NestedNumberArray[];
  };
}

interface CountriesJSONData {
  type: string;
  features: CountryData[];
}

interface QuizzesWithScoresLinks {
  quizid: number;
  name: string;
  description: string;
  score: number | string;
  maxscore: number;
  link: string;
}

interface Question {
  id: number;
  question: string;
  answer: string;
  options: string[];
  score: number;
}

interface Quiz {
  id: number | null;
  name: string;
  description: string;
  username: string | null;
}

type CountryColors = Record<string, "green" | "red">;

export { shuffle, filterCountriesByRegion, useStableCallback, quizIds };
export type {
  CountryData,
  CountriesJSONData,
  Quiz,
  Question,
  CountryColors,
  QuizzesWithScoresLinks,
};
