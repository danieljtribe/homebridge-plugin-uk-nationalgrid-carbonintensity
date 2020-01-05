var request = require("request");
var isArray = require('yow/isArray');

var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  
  homebridge.registerAccessory("homebridge-plugin-uk-nationalgrid-carbonintensity", "National Grid Carbon Intensity", NGCarbonIntensityAccessory);
}

function NGCarbonIntensityAccessory(log, config) {
  this.log = log;
  this.config = config;
  this.name = "National Grid Carbon Intensity";
  
  this.service = new Service.CarbonDioxideSensor(this.name);
  
  this.service
    .getCharacteristic(Characteristic.CarbonDioxideLevel)
    .on('get', this.executeCo2.bind(this));
}

NGCarbonIntensityAccessory.prototype.executeCo2 = function(callback) {
  this.log("Getting current state...");
  
  request.get({
    url: "https://api.carbonintensity.org.uk/intensity",
    headers: {
      'Accept': 'application/json'
    }
  }, function(err, response, body) {
    
    if (!err && response.statusCode == 200) {
      var json = JSON.parse(body);
      var data = json.data;
      var actual = data[0].intensity.actual;
      var forecast = data[0].intensity.forecast;
      var intensity = data[0].intensity.index;

      if (isArray(this.config.highCarbonLevels)) {
        var index = this.config.highCarbonLevels.indexOf(intensity) != -1
        this.service.setCharacteristic(Characteristic.CarbonDioxideDetected, index);
      }

      this.service.setCharacteristic(Characteristic.CarbonDioxideLevel, actual);
      this.service.setCharacteristic(Characteristic.CarbonDioxidePeakLevel, forecast);
      callback(null, actual);
    }
    else {
      this.log("Error getting state (status code %s): %s", response.statusCode, err);
      callback(err);
    }
  }.bind(this));
}

NGCarbonIntensityAccessory.prototype.getServices = function() {
  return [this.service];
}
