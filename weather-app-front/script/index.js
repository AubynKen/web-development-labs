// author: Pinglei He
// Les commentaires ont été faits en Anglais parce que le français n’est pas ma langue maternelle
// et il y a pas mal de mot en programmation que je ne sais pas dire en français.
// Aussi parce que j’utilise une disposition de clavier sans accent pour coder (Colemak)

// html elements 
const settingButton = document.getElementById("btn-setting");
const returnButton = document.getElementById("btn-return");
const infoSection = document.getElementsByClassName("info")[0];
const settingSection = document.getElementsByClassName("info-setting")[0];

// button to show and hide weather information panel
settingButton.addEventListener("click", e => {
  e.preventDefault();
  infoSection.style.display = "none"; // hide info panel
  settingSection.style.display = "block"; // show setting panel
});

returnButton.addEventListener("click", e => {
  e.preventDefault();
  settingSection.style.display = "none";
  infoSection.style.display = "block";
});

// hide all elements in weather information panel
const hideAll = () => {
  // find all element with class name "info-cell"
  const infoCells = document.getElementsByClassName("info-cell");
  // loop through all elements
  for (const el of infoCells) {
    // hide all elements
    el.hidden = true;
  }
};

// show weather information based on element ids in the array
const show = (arr) => {
  for (const elementID of arr) {
    const el = document.getElementById(elementID);
    el.hidden = false;
  }
};

// test
// hideAll();
// show(["cell-temperature", "cell-wind"]);

const unitChoices = {
  "cell-temperature": ["°C", "°F", "K"], "cell-wind": ["km/h", "mph", "m/s"], "cell-visibility": ["m", "ft"],
};

const unitSettings = {
  "cell-temperature": 0, "cell-wind": 0, "cell-visibility": 0,
}

// convert from celsius into other units
const temperatureConverter = (value, unit) => {
  if (unit === "°C") {
    return value;
  } else if (unit === "°F") {
    return Math.round(value * 1.8 + 32);
  } else if (unit === "K") {
    return Math.round(value + 273.15);
  }
}

// convert from meter into other units
const lengthConverter = (value, unit) => {
  if (unit === "m") {
    return value;
  } else if (unit === "ft") {
    return value * 3.28;
  }
}

// convert from km/h into other units
const speedConverter = (value, unit) => {
  if (unit === "km/h") {
    return value;
  } else if (unit === "mph") {
    return Math.round(value * 1.609);
  } else if (unit === "m/s") {
    return Math.round(value * 3.6);
  }
}

// values shown in the weather info panel when the updateValues function is called
const currentValues = {
  temperature: 40, // celcius
  wind: 40, // km/h
  visibility: 5, // meters
  sunrise: 1654596000, // unix timestamp
  sunset: 1654617600, moonrise: 1646309880, moonset: 1646352120, currWeather: "cloudy",
}

// convert timestamp in seconds into date object
function timestampToDate(timestamp) {
  return new Date(timestamp * 1000);
}

// convert date object into hour:minute string
function dateToHourMinute(date) {
  return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

// update values in the weather info panel based on currentValues object's information
const updateValues = () => {
  // convert settings to human-readable text
  const unitSettingsText = {};
  for (const key in unitSettings) {
    unitSettingsText[key] = unitChoices[key][unitSettings[key]];
  }

  // convert current values to human readable text
  const currentValuesText = {
    "temperature": temperatureConverter(currentValues["temperature"], unitSettingsText["cell-temperature"]),
    "wind": speedConverter(currentValues["wind"], unitSettingsText["cell-wind"]).toString(),
    "visibility": lengthConverter(currentValues["visibility"], unitSettingsText["cell-visibility"]),
    "sunrise": dateToHourMinute(timestampToDate(currentValues["sunrise"])),
    "sunset": dateToHourMinute(timestampToDate(currentValues["sunset"])),
    "moonrise": dateToHourMinute(timestampToDate(currentValues["moonrise"])),
    "moonset": dateToHourMinute(timestampToDate(currentValues["moonset"])),
    "currWeather": currentValues["currWeather"],
  };

  // round values to 2 decimal places
  for (const key in currentValuesText) {
    if (typeof (currentValuesText[key]) === "string") continue;
    currentValuesText[key] = Math.round(currentValuesText[key]);
  }

  // update values in HTML
  for (const key in currentValuesText) {
    const infoCell = document.getElementById(`cell-${key}`);
    const valueSpan = infoCell.getElementsByClassName("info-value")[0];
    valueSpan.innerHTML = currentValuesText[key];
    const unitSpan = infoCell.getElementsByClassName("info-unit")[0];
    if (typeof (unitSpan) === "undefined") continue;
    unitSpan.innerHTML = unitSettingsText[`cell-${key}`];
  }
}

// update values and what to show based on local json configuration
const readConfig = async () => {
  try {
    // read local json configuration
    const res = await fetch("./config.json");
    const config = await res.json();

    // elements to be shown in the weather info panel
    const toBeShown = [];
    for (const key in config) {
      if (config[key].state === 0) continue;
      toBeShown.push(key);
    }
    const idToBeShown = toBeShown.map(key => `cell-${key}`);

    // update unities
    for (const key of ["temperature", "wind", "visibility"]) {
      unitSettings[`cell-${key}`] = config[key].unit;
    }

    updateValues()

    hideAll();
    show(idToBeShown);
  } catch (err) {
    console.error("Error reading the configuration file.")
    console.log(err);
  }
}

// values defaulted to gif
let userPosition = {
  latitude: 48.7080181, longitude: 2.1613262
}
//
// const updateUserPosition = async () => {
//   try {
//     const res = await fetch("https://ipinfo.io/json");
//     const data = await res.json();
//     userPosition = {
//       latitude: data.loc.split(",")[0], longitude: data.loc.split(",")[1],
//     }
//   } catch (err) {
//     console.error("Error getting user's position.")
//     console.log(err);
//   }
// };


const fetchWeatherFromAPI = async () => {
  try {
    // for now appId will be stored in a json file which is ignored by git
    // but we'll use process.env in Node on the backend starting from tomorrow
    const envRes = await fetch("./env.json");
    const envData = await envRes.json();
    const appId = envData.appid;

    // fetch weather data
    // since I coded everything in English I didn't set the language to French in the query string
    const url = `https://api.openweathermap.org/data/2.5/onecall?lang=en&lat=${userPosition.latitude}` 
      + `&lon=${userPosition.longitude}&units=metric&exclude=minutely,hourly&appid=${appId}`;
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error("Error fetching weather data.");
    console.log(err);
  }
};

const updateWeatherIcon = async (iconCode) => {
  const icon = document.getElementById("weather-icon");
  icon.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

// update values with call to Weather API
const readData = async () => {
  try {
    const {current, daily} = await fetchWeatherFromAPI();
    currentValues["temperature"] = current.temp;
    currentValues["wind"] = current.wind_speed;
    currentValues["visibility"] = current.visibility;
    currentValues["sunrise"] = daily[0].sunrise;
    currentValues["sunset"] = daily[0].sunset;
    currentValues["moonrise"] = daily[0].moonrise;
    currentValues["moonset"] = daily[0].moonset;
    currentValues["currWeather"] = daily[0].weather[0].description;
    updateValues();
    updateWeatherIcon(daily[0].weather[0].icon);
  } catch (err) {
    console.error("Error updating weather data.");
    console.log(err);
  }
};

const readConfigData = async () => {
  await readConfig();
  await readData();
}

readConfigData();

// Je n’ai pas fait la partie « mettre l’icon sur la carte » puisque j’ai déjà mis l’icone sur l’image de la
// première image de la page pour le rendu du 7 juin
   