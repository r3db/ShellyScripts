let ellapsedTotal  = 0;
let ellapsedMotion = 0;
let hasMotion = false;
let humidity = 0;
let motionDelay = 3 * 60;
let motionDelayHardware = 11;
let humidityThreshold = 80;

// Done!
function switchTo(value) {
  Shelly.call("switch.set", {'id': 0, 'on': value});
}

// Done!
function handleMotionChange(state) {
  hasMotion = state;

  if (state === true) {
    switchTo(true);
  } else {
    ellapsedMotion = ellapsedTotal;
  }
}

// Done!
function handleHumidityChange(value) {
  humidity = value;

  if (isHumid()) {
    switchTo(true);
  }
}

// Done!
function hasMotionEllapsed() {
  return (ellapsedTotal - ellapsedMotion) > (motionDelay - motionDelayHardware)
}

// Done!
function isHumid() {
  return humidity >= humidityThreshold;
}

// Done!
function resetEllapsed() {
  ellapsedTotal = 0;
  ellapsedMotion = 0;
}

// Todo: Done!
Timer.set(1000, true, function() {
  ellapsedTotal++;
  
  if (hasMotion === false && hasMotionEllapsed()) {
    resetEllapsed();

    if (isHumid() === false) {
      switchTo(false);
    }
  }
});

// Done!
Shelly.addStatusHandler(function(e) {
  if (e.component === "input:100") {
    handleMotionChange(e.delta.state);
  } else if (e.component === "temperature:100") {
    //print("Temperature is: " + e.delta.tC + " ºC");
  } else if (e.component === "humidity:100") {
    handleHumidityChange(e.delta.rh);
  }
});
