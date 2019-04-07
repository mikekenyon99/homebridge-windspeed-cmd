var Service, Characteristic;
var exec = require("child_process").exec;

var fanService;
var command;
var temperature = 0;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-windspeed-cmd", "WindSpeedCMD", WindSpeedCMD);
}

function WindSpeedCMD(log, config) {
    this.log = log;

    // url info
    this.name = config["name"];
    this.manufacturer = config["manufacturer"] || "Hybrid Developments";
    this.model = config["model"] || "hydev Model";
    this.serial = config["serial"] || "hydev Serial";
    this.command = config["command"];
}

WindSpeedCMD.prototype = {
    cmdRequest: function(cmd, callback) {
        exec(cmd,function(error, stdout, stderr) {
            callback(error, stdout, stderr)
        })
    },

    getRotationSpeed: function (callback) {
        var cmd = this.command;
        this.cmdRequest(cmd, function(error, stdout, stderr) {
            if (error) {
                this.log('command function failed: %s', stderr);
                callback(error);
            } else {
                this.log('command function succeeded!');
                var res =  Math.round(stdout * 100) /100;
                this.log(res);
                callback(null, res);
            }
        }.bind(this));
    },
    getState: function(callback) {
        callback(null, 1);
    },
    setState: function(powerOn, callback) {
        var state = powerOn ? 'on' : 'off';
        this.currentState = on;
        callback(null);
    },

    identify: function(callback) {
        this.log("Identify requested!");
        callback(); // success
    },

    getServices: function() {
        var services = [],
            informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic(Characteristic.Model, this.model)
            .setCharacteristic(Characteristic.SerialNumber, this.serial);
        services.push(informationService);

        fanService = new Service.Fan(this.name);
        fanService.getCharacteristic(Characteristic.On).on('get', this.getState.bind(this));
        fanService.setCharacteristic(Characteristic.On).on('set', this.setState.bind(this));

        fanService
            .getCharacteristic(Characteristic.RotationSpeed)
            .on('get', this.getRotationSpeed.bind(this));

        services.push(fanService);

        return services;
    }
};
