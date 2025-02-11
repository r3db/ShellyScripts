// State
let humidity     = null;
let temperature  = null;
let sensorHandle = Virtual.getHandle("number:202");
let eCO2Handle   = Virtual.getHandle("number:203");
let tVOCHandle   = Virtual.getHandle("number:204");

let previousSensorTime = null;
let currentSensorTime  = null;

// Configurable [via Virtual Components]
let maximumHumidity    = Virtual.getHandle("number:200").getValue();
let maximumTemperature = Virtual.getHandle("number:201").getValue();

// Configurable [via Variables]
let silentHourStart = 0;
let silentHourEnd   = 7;
let currentHour     = null;
let currentMinute   = null;
let autoOffDelay    = 5 * 60;

// Constants
const SensorTrue  = 1;
const SensorFalse = 0;

function init() {
  updateCurrentHour();

  Timer.set(10 * 1000, true, function() {
    try {
      updateCurrentHour();
      updateSensorBasedOnCurrentHumidity();
      updateSensorBasedOnCurrentTemperature();
    } catch (error) {
      console.error(error);
    }
  });

  Timer.set(2 * 1000, true, function() {
    try {
      updateAirQualityIndex();
    } catch (error) {
      console.error(error);
    }
  });
}

function handleMotionChange(value) {
  if (value === false) {
    sensorHandle.setValue(SensorFalse);
    return;
  }

  currentSensorTime = Date.now();

  if (previousSensorTime === null) {
    previousSensorTime = Date.now();
    return;
  }

  let diff = (currentSensorTime - previousSensorTime) / 1000;
      
  if (diff < 30) {
    sensorHandle.setValue(SensorTrue);
    switchOn();
  }
      
  previousSensorTime = currentSensorTime;
}

function updateSensorBasedOnCurrentHumidity() {
  if (humidity === null) {
    Shelly.call("Humidity.GetStatus", {'id': 100}, function(result) {
      updateSensorBasedOnHumidityChange(result.rh);
    });
  } else {
    updateSensorBasedOnHumidityChange(humidity);
  }
}

function updateSensorBasedOnHumidityChange(value) {
  humidity = value;

  if (currentHour != null && currentHour >= silentHourStart && currentHour <= silentHourEnd) {
    return;
  }
    
  if (value >= maximumHumidity) {
    switchOn();
  }
}

function updateSensorBasedOnCurrentTemperature() {
  if (temperature === null) {
    Shelly.call("Temperature.GetStatus", {'id': 100}, function(result) {
      updateSensorBasedOnTemperatureChange(result.tC);
    });
  } else {
    updateSensorBasedOnTemperatureChange(temperature);
  }
}

function updateSensorBasedOnTemperatureChange(value) {
  temperature = value;
  
  if (currentHour != null && currentHour >= silentHourStart && currentHour <= silentHourEnd) {
    return;
  }

  if (value >= maximumTemperature) {
    switchOn();
  }
}

function updateSensorBasedOnMaximumHumidityChange(value) {
  maximumHumidity = value;
  updateSensorBasedOnCurrentHumidity();
}

function updateSensorBasedOnMaximumTemperatureChange(value) {
  maximumTemperature = value;
  updateSensorBasedOnCurrentTemperature();
}

function switchOn() {
  Shelly.call("Switch.Set", {'id': 0, 'on': true, 'toggle_after': autoOffDelay});
}

function updateCurrentHour() {
  Shelly.call("Sys.GetStatus", {}, function(result) {
    let time = result.time.split(":");
    currentHour   = time[0];
    currentMinute = time[1];
  });
}

function updateAirQualityIndex() {
  Shelly.call("HTTP.GET", {"url": "http://192.168.80.52/aqi", "Content-Type":"application/json"}, function(response) {
    if ((response && response.code && response.code === 200) === false) {
      return
    }

    var json = JSON.parse(response.body)
    eCO2Handle.setValue(json.eCO2);
    tVOCHandle.setValue(json.tVOC);
  });
}

Shelly.addStatusHandler(function(e) {
  try {
    if (e.component === "input:100") {
      handleMotionChange(e.delta.state);
    } else if (e.component === "humidity:100") {
      updateSensorBasedOnHumidityChange(e.delta.rh);
    } else if (e.component === "temperature:100") {
      updateSensorBasedOnTemperatureChange(e.delta.tC);
    } else if (e.component === "number:200") {
      updateSensorBasedOnMaximumHumidityChange(e.delta.value);
    } else if (e.component === "number:201") {
      updateSensorBasedOnMaximumTemperatureChange(e.delta.value);
    }
  } catch (error) {
    console.error(error);
  }
});

init();
