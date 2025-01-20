let maximumHumidity    = 75;
let maximumTemperature = 24;

let humidity;
let temperature;

let hasHumidityReading    = false;
let hasTemperatureReading = false;

let autoOffDelay = 5 * 60;

Shelly.addStatusHandler(function(e) {
  if (e.component === "input:100") {
    if (e.delta.state === true) {
      switchOn();
    }
  } else if (e.component === "humidity:100") {
    handleHumidity(e.delta.rh);
  } else if (e.component === "temperature:100") {
    handleTemperature(e.delta.tC);
  } else if (e.component === "number:200") {
    maximumHumidity = e.delta.value;
    
    if (hasHumidityReading === false) {
      Shelly.call("Humidity.GetStatus", {'id': 100}, function(result) {
        handleHumidity(result.rh);
      });
    } else {
      handleHumidity(humidity);
    }
  } else if (e.component === "number:201") {
    maximumTemperature = e.delta.value;
    
    if (hasTemperatureReading === false) {
      Shelly.call("Temperature.GetStatus", {'id': 100}, function(result) {
        handleTemperature(result.tC);
      });
    } else {
      handleTemperature(temperature);
    }
  }
});

function handleTemperature(value) {
  temperature = value;
  hasTemperatureReading = true;
  
  if (value >= maximumTemperature) {
    switchOn();
  }
}

function handleHumidity(value) {
  humidity = value;
  hasHumidityReading = true;
    
  if (value >= maximumHumidity) {
    switchOn();
  }
}

function switchOn() {
  Shelly.call("Switch.Set", {'id': 0, 'on': true, 'toggle_after': autoOffDelay});
}
