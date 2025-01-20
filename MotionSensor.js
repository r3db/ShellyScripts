let maximumHumidity    = 75;
let maximumTemperature = 24;

let humidity;
let temperature;

let hasHumidityReading    = false;
let hasTemperatureReading = false;

let autoOffDelay = 5 * 60;

Shelly.addStatusHandler(function(e) {
  if (e.component === "input:100") {
    handleMotion(e.delta.state);
  } else if (e.component === "humidity:100") {
    handleHumidity(e.delta.rh);
  } else if (e.component === "temperature:100") {
    handleTemperature(e.delta.tC);
  } else if (e.component === "number:201") {
    handleMaximumTemperature(e.delta.tC);
  } else if (e.component === "number:200") {
    handleMaximumHumidity(e.delta.rh);
  }
});

function handleMotion(value) {
  Shelly.call("Number.Set", {'id': 202, 'value': value === true ? 1 : 0});
    
  if (value === true) {
    switchOn();
  }
}

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

function handleMaximumTemperature(value) {
  maximumTemperature = value;
    
  if (hasTemperatureReading === false) {
    Shelly.call("Temperature.GetStatus", {'id': 100}, function(result) {
      handleTemperature(result.tC);
    });
  } else {
    handleTemperature(temperature);
  }
}

function handleMaximumHumidity(value) {
  maximumHumidity = value;
    
  if (hasHumidityReading === false) {
    Shelly.call("Humidity.GetStatus", {'id': 100}, function(result) {
      handleHumidity(result.rh);
    });
  } else {
    handleHumidity(humidity);
  }
}

function switchOn() {
  Shelly.call("Switch.Set", {'id': 0, 'on': true, 'toggle_after': autoOffDelay});
}
