"use strict";
// author: Pinglei He
// language: javascript
// date: 2022-06-09

const infoSection = document.getElementsByClassName("info")[0];
const settingSection = document.getElementsByClassName("info-setting")[0];

/**
 * Returns the latest user configuration data from local storage if exists, otherwise retrieve settings from backend.
 * @returns {Promise<any>}
 */
const fetchConfig = async () => {
  if (localStorage.getItem("config")) { // if we have a config in local storage
    return JSON.parse(localStorage.getItem("config")); // get it
  }
  const res = await fetch("http://localhost:3000/config"); // otherwise fetch it from the server
  const resString = await res.json();
  return JSON.parse(resString);
}

/**
 * Event handler for the setting button's click event.
 * @param e the click event
 * @returns {Promise<void>}
 */
const settingButtonClickHandler = async (e) => {
  // prevent page reload
  e.preventDefault();
  // hide info panel
  infoSection.style.display = "none";
  // get previous config data
  const config = await fetchConfig();
  // update form values with previous config values
  document.querySelector("#check-currWeather").checked = config.currWeather.state;
  document.querySelector("#check-temperature").checked = config.temperature.state;
  document.querySelector("#check-wind").checked = config.wind.state;
  document.querySelector("#check-visibility").checked = config.visibility.state;
  document.querySelector("#check-sunrise").checked = config.sunrise.state;
  document.querySelector("#check-sunset").checked = config.sunset.state;
  document.querySelector("#check-moonrise").checked = config.moonrise.state;
  document.querySelector("#check-moonset").checked = config.moonset.state;
  document.querySelector("#select-unit").value = config.temperature.unit;
  // show setting panel
  settingSection.style.display = "block";
}
document.getElementById("btn-setting").addEventListener("click", settingButtonClickHandler);

/**
 * Event handler for the return button's click event.
 * @param e click event
 */
const returnButtonClickHandler = (e) => {
  // prevent page reload
  e.preventDefault();
  // hide setting panel
  settingSection.style.display = "none";
  // show info panel
  infoSection.style.display = "block";
}
document.getElementById("btn-return").addEventListener("click", returnButtonClickHandler);


/**
 * Hide all elements in weather information panel
 */
const hideWeatherPanelElements = () => {
  // find all element with class name "info-cell"
  const infoCells = document.getElementsByClassName("info-cell");
  // loop through all elements
  for (const el of infoCells) {
    // hide all elements
    el.hidden = true;
  }
};

/**
 * Show / unhide weather information based on element ids in the array
 * @param arr array of element ids
 */
const showWeatherPanelElements = (arr) => {
  for (const elementID of arr) {
    const el = document.getElementById(elementID);
    el.hidden = false;
  }
};

/**
 * Show only weather panel elements with ids in the array and hide the rest
 * @param arr array of element ids
 */
const showOnlySelectedWeatherPanelElements = (arr) => {
  hideWeatherPanelElements();
  showWeatherPanelElements(arr);
}

const unitChoices = {
  "cell-temperature": ["°C", "°F"], "cell-wind": ["km/h", "mph"], "cell-visibility": ["m", "ft"],
};

const unitSettings = {
  "cell-temperature": 0, "cell-wind": 0, "cell-visibility": 0,
}

/**
 * convert from celsius into other units
 * @param value value in celsius
 * @param unit unit to convert to
 * @returns {number|*}
 */
const temperatureConverter = (value, unit) => {
  if (unit === "°C") {
    return value;
  } else if (unit === "°F") {
    return Math.round(value * 1.8 + 32);
  }
  return NaN;
}

/**
 * convert from meter into other units
 * @param value value in meter
 * @param unit unit to convert to
 * @returns {number|*}
 */
const lengthConverter = (value, unit) => {
  if (unit === "m") {
    return value;
  } else if (unit === "ft") {
    return value * 3.28;
  }
  return NaN;
}

/**
 * convert from km/h into other units
 * @param value value in km/h
 * @param unit unit to convert to
 * @returns {number|*}
 */
const speedConverter = (value, unit) => {
  if (unit === "km/h") {
    return value;
  } else if (unit === "mph") {
    return Math.round(value * 1.609);
  }
  return NaN;
}

/**
 * convert timestamp in seconds into date object
 * @param timestamp unix timestamp in seconds
 * @returns {Date} date object
 */
const timestampToDate = (timestamp) => {
  return new Date(timestamp * 1000);
}

/**
 * convert date object into hour:minute string
 * @param date date object
 * @returns {string} hour:minute string
 */
const dateToHourMinute = (date) => {
  return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

const currentValues = {
  temperature: 40, // celcius
  wind: 40, // km/h
  visibility: 5, // meters
  sunrise: 1654596000, // unix timestamp
  sunset: 1654617600,
  moonrise: 1646309880,
  moonset: 1646352120,
  currWeather: "cloudy",
}

/**
 * update values in the weather info panel based on @code{currentValues} object's information and unit settings
 */
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

/**
 * update units and what to show based on configuration send from server
 * @returns {Promise<void>}
 */
const readConfig = async () => {
  try {
    const config = await fetchConfig();
    const toBeShown = [];
    for (const key in config) {
      if (config[key].state) {
        toBeShown.push(`cell-${key}`);
      }
    }

    // update unities
    for (const key of ["temperature", "wind", "visibility"]) {
      unitSettings[`cell-${key}`] = config[key].unit;
    }

    updateValues()
    showOnlySelectedWeatherPanelElements(toBeShown);
  } catch (err) {
    console.error("Error reading the configuration file.")
    console.log(err);
  }
}

const userPosition = {latitude: 48.7080181, longitude: 2.1613262} // gif-sur-yvette by default

/**
 * Update user's position using ip address
 * @returns {Promise<void>}
 */
const updateUserPosition = async () => {
  try {
    const res = await fetch("https://ipinfo.io/json");
    const data = await res.json();
    userPosition.latitude = data.loc.split(",")[0];
    userPosition.longitude = data.loc.split(",")[1];
  } catch (err) {
    console.error("Error getting user's position.")
    console.log(err);
  }
};

// updateUserPosition();

/**
 * Fetch weather from openweathermap.org
 * @returns {Promise<any>} weather data
 */
const fetchWeatherFromAPI = async () => {
  try {
    // for now appId will be stored in a json file which is ignored by git
    // but we'll use process.env in Node on the backend later
    const envRes = await fetch("./env.json");
    const envData = await envRes.json();
    const appId = envData.appid;

    // fetch weather data
    // since I coded everything in English I didn't set the language to French in the query string
    const url = `https://api.openweathermap.org/data/2.5/onecall?lang=en&lat=${userPosition.latitude}` + `&lon=${userPosition.longitude}&units=metric&exclude=minutely,hourly&appid=${appId}`;
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error("Error fetching weather data.");
    console.log(err);
  }
};

/**
 * Update the weather icon shown in the image panel
 * @param iconCode the icon code from openweathermap.org
 * @returns {Promise<void>}
 */
const updateWeatherIcon = async (iconCode) => {
  const icon = document.getElementById("weather-icon");
  icon.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

/**
 * Update @code{currentValues} object with values from openweathermap.org's API
 * @returns {Promise<void>}
 */
const updateWeatherValuesWithAPI = async () => {
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
    await updateWeatherIcon(daily[0].weather[0].icon);
  } catch (err) {
    console.error("Error updating weather data.");
    console.log(err);
  }
};

const readConfigData = async () => {
  await readConfig();
  await updateWeatherValuesWithAPI();
}

/**
 * Get values from the settings form
 * @returns form values as an object
 */
const getFormValues = () => {
  return {
    "temperature": {
      state: document.querySelector("#check-currWeather").checked, unit: document.querySelector("#select-unit").value,
    }, "wind": {
      state: document.querySelector("#check-wind").checked, unit: document.querySelector("#select-unit").value,
    }, "visibility": {
      state: document.querySelector("#check-visibility").checked, unit: document.querySelector("#select-unit").value,
    }, "sunrise": {
      state: document.querySelector("#check-sunrise").checked,
    }, "sunset": {
      state: document.querySelector("#check-sunset").checked,
    }, "moonrise": {
      state: document.querySelector("#check-moonrise").checked,
    }, "moonset": {
      state: document.querySelector("#check-moonset").checked,
    }, "currWeather": {
      state: document.querySelector("#check-currWeather").checked,
    }
  };
}

const sendConfig = async () => {
  try {
    const config = getFormValues();
    await fetch("http://localhost:3000/config", {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    alert("Your configuration has been successfully saved to the server.");
  } catch (err) {
    console.error("Error sending config data.");
    console.log(err);
  }
}

/**
 * Save settings form's values to local storage and send info to server
 * @param e click event
 */
const saveSettingsClickHandler = async (e) => {
  e.preventDefault();
  const formValues = getFormValues();
  localStorage.setItem("config", JSON.stringify(formValues));
  await sendConfig(); // send config to server
  await readConfig(); // update weather panel information with latest settings
}

document.querySelector("#btn-return").addEventListener("click", saveSettingsClickHandler);

readConfigData();
