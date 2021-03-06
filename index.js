const request = require("request");
const isArray = require('yow/isArray');

var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-plugin-uk-nationalgrid-carbonintensity", "National Grid Carbon Intensity", NGCarbonIntensityAccessory);
}

function NGCarbonIntensityAccessory(log, config) {
  this.log = log;
  
  this.highCarbonLevels = config.highCarbonLevels;

  this.highCo2IntensitySwitch = new Service.Switch("High National Grid Carbon Intensity");
  
  this.highCo2IntensitySwitch
    .getCharacteristic(Characteristic.On)
    .on('get', this.getCurrentCo2IntensitySwitchState.bind(this));

    this.startPing(this.highCo2IntensitySwitch);
}

NGCarbonIntensityAccessory.prototype.getCurrentCo2IntensitySwitchState = function(callback) {
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
        this.log("Current UK CO2 Intensity is", intensity);
        callback(null, index);
      }
    }
  }.bind(this));
}

NGCarbonIntensityAccessory.prototype.startPing = function(device) {
  setInterval(() => {
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
          this.log("Current UK CO2 Intensity is", intensity);
          device.setCharacteristic(Characteristic.On, index);
        }
      }
    }.bind(this));
  }, 1800000); // 30 minute refresh
}

NGCarbonIntensityAccessory.prototype.getServices = function() {
  return [this.highCo2IntensitySwitch];
}
