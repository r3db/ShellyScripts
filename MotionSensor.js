let maximumHumidity    = 75; // Todo: Read from config async!
let maximumTemperature = 24; // Todo: Read from config async!

let humidity;
let temperature;

let hasHumidityReading    = false;
let hasTemperatureReading = false;

let startHour; // Todo: Read from config async!
let endHour;   // Todo: Read from config async!

let autoOffDelay = 5 * 60;

function handleMotionChange(value) {
  Shelly.call("Number.Set", {'id': 202, 'value': value === true ? 1 : 0});
    
  if (value === true) {
    switchOn();
  }
}

// Todo: Incorporate Time!
function handleTemperature() {
  if (hasTemperatureReading === false) {
  	Shelly.call("Temperature.GetStatus", {'id': 100}, function(result, err_code, err_message) {
  	  handleTemperatureChange(result.tC);
    });
  } else {
    handleTemperatureChange(temperature);
  }
}

function handleTemperatureChange(value) {
  temperature = value;
  hasTemperatureReading = true;
  
  if (value >= maximumTemperature) {
    switchOn();
  }
}

// Todo: Incorporate Time!
function handleHumidity() {
  if (hasHumidityReading === false) {
  	Shelly.call("Humidity.GetStatus", {'id': 100}, function(result, err_code, err_message) {
  	  handleHumidityChange(result.rh);
    });
  } else {
    handleHumidityChange(humidity);
  }
}

function handleHumidityChange(value) {
  humidity = value;
  hasHumidityReading = true;
    
  if (value >= maximumHumidity) {
    switchOn();
  }
}

function handleMaximumTemperatureChange(value) {
  maximumTemperature = value;
  handleTemperature();
}

function handleMaximumHumidityChange(value) {
  maximumHumidity = value;
  handleHumidity();
}

function switchOn() {
  Shelly.call("Switch.Set", {'id': 0, 'on': true, 'toggle_after': autoOffDelay});
}

Shelly.addStatusHandler(function(e) {
  if (e.component === "input:100") {
    handleMotionChange(e.delta.state);
  } else if (e.component === "temperature:100") {
    handleTemperatureChange(e.delta.tC);
  } else if (e.component === "humidity:100") {
    handleHumidityChange(e.delta.rh);
  } else if (e.component === "number:201") {
    handleMaximumTemperatureChange(e.delta.value);
  } else if (e.component === "number:200") {
    handleMaximumHumidityChange(e.delta.value);
  }
});

Timer.set(5000, true, function() {
	handleTemperature();
	handleHumidity();
});

// -------------------------------

Shelly.call("Sys.GetStatus", {}, function(result, err_code, err_message, user_data) {
	if (err_code === 0) {
		console.log("Result:", result.time);
	}
});
