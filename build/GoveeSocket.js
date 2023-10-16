"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_dgram_1 = require("node:dgram");
var node_events_1 = require("node:events");
var z = __importStar(require("zod"));
var GoveeDevice_1 = __importDefault(require("./GoveeDevice"));
var protocol_1 = require("./protocol");
var GOVEE_ADDRESS = '239.255.255.250';
var GOVEE_INCOMING_PORT = 4002;
var GOVEE_OUTGOING_PORT = 4001;
var UNRESPONSIVE_THRESHOLD = 10000; // 10s
var SCAN_INTERVAL = 10000; // 10s
var STATUS_INTERVAL = 1000; // 1s
var ipSchema = z.string().ip();
var GoveeSocket = /** @class */ (function (_super) {
    __extends(GoveeSocket, _super);
    function GoveeSocket(networkAddress) {
        var _this = _super.call(this) || this;
        _this.networkAddress = networkAddress;
        _this.closed = true;
        _this.devices = new Map();
        _this.connect();
        return _this;
    }
    GoveeSocket.prototype.connect = function () {
        var _this = this;
        if (!this.closed) {
            return;
        }
        this.closed = false;
        var socket = (0, node_dgram_1.createSocket)({
            type: 'udp4',
            reuseAddr: true,
        });
        this.socketPromise = new Promise(function (resolve) {
            socket.once('message', function () {
                var params = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    params[_i] = arguments[_i];
                }
                _this.handleMessage.apply(_this, params);
                _this.init(socket);
                resolve(socket);
            });
            socket.on('listening', function () {
                socket.setBroadcast(true);
                socket.setMulticastTTL(128);
                socket.addMembership(GOVEE_ADDRESS);
                var message = JSON.stringify({ msg: { cmd: 'scan', data: { account_topic: 'reserve' } } });
                socket.send(message, 0, message.length, GOVEE_OUTGOING_PORT, GOVEE_ADDRESS);
            });
            socket.bind(GOVEE_INCOMING_PORT, _this.networkAddress.address);
        });
    };
    GoveeSocket.prototype.on = function (name, listener) {
        return _super.prototype.on.call(this, name, listener);
    };
    GoveeSocket.prototype.send = function (command, data, target) {
        if (data === void 0) { data = {}; }
        if (target === void 0) { target = GOVEE_ADDRESS; }
        return __awaiter(this, void 0, void 0, function () {
            var message, socket;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        message = JSON.stringify({ msg: { cmd: command, data: data } });
                        return [4 /*yield*/, this.getSocket()];
                    case 1:
                        socket = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                socket.send(message, 0, message.length, GOVEE_OUTGOING_PORT, target, function (error) {
                                    if (error) {
                                        reject(error);
                                    }
                                    else {
                                        resolve();
                                        if (target !== GOVEE_ADDRESS && command !== 'devStatus') {
                                            _this.updateDeviceStatus(target);
                                        }
                                    }
                                });
                            })];
                }
            });
        });
    };
    GoveeSocket.prototype.handleMessage = function (buffer, remoteInfo) {
        var _this = this;
        if (this.closed) {
            return;
        }
        try {
            var _a = protocol_1.responseSchema.parse(buffer), cmd = _a.cmd, data_1 = _a.data;
            switch (cmd) {
                case 'scan': {
                    if (this.devices.has(data_1.device)) {
                        var deviceEntry = this.devices.get(data_1.device);
                        if (deviceEntry.device.ip !== data_1.ip) {
                            console.info("Device ".concat(data_1.device, " switched ip from ").concat(deviceEntry.device.ip, " to ").concat(data_1.ip));
                        }
                        deviceEntry.device.updateConfig(data_1, function (c, d) { return _this.send(c, d, data_1.ip); });
                        deviceEntry.lastSeen = Date.now();
                    }
                    else {
                        var device_1 = new GoveeDevice_1.default(data_1, function (c, d) { return _this.send(c, d, data_1.ip); });
                        this.devices.set(data_1.device, {
                            device: device_1,
                            lastSeen: Date.now(),
                        });
                        this.updateDeviceStatus(device_1.ip);
                        device_1.initialized().then(function () {
                            _this.emit('deviceDiscovered', device_1);
                        });
                    }
                    break;
                }
                case 'devStatus': {
                    var deviceEntry = Array.from(this.devices.values()).find(function (_a) {
                        var device = _a.device;
                        return device.ip === remoteInfo.address;
                    });
                    if (!deviceEntry) {
                        throw new Error("No device with ip ".concat(remoteInfo.address));
                    }
                    if (deviceEntry.device.updateStatus(data_1)) {
                        this.emit('deviceUpdated', deviceEntry.device);
                    }
                    deviceEntry.lastSeen = Date.now();
                    break;
                }
                default: {
                    throw new Error("Received unknown message cmd ".concat(cmd));
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    };
    GoveeSocket.prototype.init = function (socket) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.closed) {
                    return [2 /*return*/];
                }
                socket.on('message', function () {
                    var params = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        params[_i] = arguments[_i];
                    }
                    return _this.handleMessage.apply(_this, params);
                });
                this.pollStatusInterval = setInterval(function () {
                    _this.updateDeviceStatus();
                }, STATUS_INTERVAL);
                this.pollScanInterval = setInterval(function () {
                    _this.updateDeviceList();
                }, SCAN_INTERVAL);
                return [2 /*return*/];
            });
        });
    };
    GoveeSocket.prototype.close = function () {
        var _this = this;
        this.closed = true;
        clearInterval(this.pollStatusInterval);
        clearInterval(this.pollScanInterval);
        return new Promise(function (resolve) {
            _this.getSocket().then(function (socket) { return socket.close(resolve); });
        });
    };
    GoveeSocket.prototype.getSocket = function () {
        return this.socketPromise;
    };
    GoveeSocket.prototype.ready = function () {
        var _this = this;
        return this.getSocket().then(function () { return _this; });
    };
    GoveeSocket.prototype.updateDeviceStatus = function (ip) {
        return this.send('devStatus', {}, ip);
    };
    GoveeSocket.prototype.updateDeviceList = function () {
        var _this = this;
        var threshold = Date.now() - UNRESPONSIVE_THRESHOLD;
        this.devices.forEach(function (deviceEntry) {
            if (deviceEntry.lastSeen < threshold) {
                _this.devices.delete(deviceEntry.device.id);
                deviceEntry.device.emit('removed');
                _this.emit('deviceRemoved', deviceEntry.device);
            }
        });
        return this.send('scan', { account_topic: 'reserve' });
    };
    GoveeSocket.prototype.getDevices = function () {
        return Array.from(this.devices.values()).map(function (deviceEntry) { return deviceEntry.device; });
    };
    GoveeSocket.prototype.getDevice = function (idOrIp) {
        var _a;
        if (ipSchema.safeParse(idOrIp).success) {
            return this.getDevices().find(function (device) { return device.ip === idOrIp; });
        }
        return (_a = this.devices.get(idOrIp)) === null || _a === void 0 ? void 0 : _a.device;
    };
    return GoveeSocket;
}(node_events_1.EventEmitter));
exports.default = GoveeSocket;
