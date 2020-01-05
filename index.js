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
  
  this.highCarbonLevels = config.highCarbonLevels;

  this.highService = new Service.ContactSensor("High National Grid Carbon Intensity");
  
  this.highService
    .getCharacteristic(Characteristic.ContactSensorState)
    .on('get', this.executeCo2.bind(this));
}

NGCarbonIntensityAccessory.prototype.executeCo2 = function(callback) {
  request.get({
    url: "https://api.carbonintensity.org.uk/intensity",
    headers: {
      'Accept': 'application/json'
    }
  }, function(err, response, body) {    
    if (!err && response.statusCode == 200) {
      var json = JSON.parse(body);
      var data = json.data;
      var intensity = data[0].intensity.index;
      
      if (isArray(this.highCarbonLevels)) {
        var index = this.highCarbonLevels.indexOf(intensity) != -1
        callback(null, index);
      }
    }
  }.bind(this));
}

NGCarbonIntensityAccessory.prototype.getServices = function() {
  return [this.highService];
}
