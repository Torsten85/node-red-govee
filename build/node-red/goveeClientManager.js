"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var createGoveeClient_1 = __importDefault(require("../createGoveeClient"));
var clientPromise;
function getClient() {
    if (!clientPromise) {
        clientPromise = (0, createGoveeClient_1.default)();
        clientPromise.then(function (client) {
            client.on('deviceDiscovered', function (device) {
                console.info("Found govee device \"".concat(device.id, "\" at ip \"").concat(device.ip, "\""));
            });
            client.on('deviceRemoved', function (device) {
                console.info("Removed govee device \"".concat(device.id, "\" at ip \"").concat(device.ip, "\""));
            });
            client.on('deviceUpdated', function (device) {
                console.info("Updated govee device \"".concat(device.id, "\" at ip \"").concat(device.ip, "\""));
            });
        });
    }
    return clientPromise;
}
exports.default = getClient;
