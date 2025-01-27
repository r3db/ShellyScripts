// State
let humidity    = null;
let temperature = null;

let previousSensorTime = null;
let currentSensorTime  = null;

// Configurable [via Virtual Components]
let maximumHumidity    = null;
let maximumTemperature = null;

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

  Shelly.call("Number.GetStatus", {'id': 200}, function(result) {
    updateSensorBasedOnMaximumHumidityChange(result.value);
  });

  Shelly.call("Number.GetStatus", {'id': 201}, function(result) {
    updateSensorBasedOnMaximumTemperatureChange(result.value);
  });

  Timer.set(10 * 1000, true, function() {
    updateCurrentHour();
    updateSensorBasedOnCurrentHumidity();
    updateSensorBasedOnCurrentTemperature();
  });
}

function handleMotionChange(value) {
  if (value === false) {
    Shelly.call("Number.Set", {'id': 202, 'value': SensorFalse});
    return;
  }

  currentSensorTime = Date.now();

  if (previousSensorTime === null) {
    previousSensorTime = Date.now();
    return;
  }

  let diff = (currentSensorTime - previousSensorTime) / 1000;
      
  if (diff < 30) {
    Shelly.call("Number.Set", {'id': 202, 'value': SensorTrue});
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

Shelly.addStatusHandler(function(e) {
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
});

init();
