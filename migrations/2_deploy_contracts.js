const DHTLoRa = artifacts.require("DHTLoRa");

module.exports = function(deployer) {
  deployer.deploy(DHTLoRa);
};
