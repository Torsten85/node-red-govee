"use strict";
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
var z = __importStar(require("zod"));
var goveeClientManager_1 = __importDefault(require("./goveeClientManager"));
var booleanInputSchema = z.boolean();
var objectInputSchema = z.object({
    power: z.boolean().optional(),
    rgb: z
        .union([
        z.string().regex(/^#[a-fA-F0-9]{6}$/),
        z.tuple([z.number().int().min(0).max(255), z.number().int().min(0).max(255), z.number().int().min(0).max(255)]),
    ])
        .optional(),
    hsl: z.tuple([z.number().int().min(0).max(255), z.number().int().min(0).max(255), z.number().int().min(0).max(255)]).optional(),
    kelvin: z.number().int().min(2000).max(9000).optional(),
    brightness: z.number().int().min(0).max(100).optional(),
});
var inputSchema = z.union([booleanInputSchema, objectInputSchema]);
function GoveeLightRegistration(RED) {
    var _this = this;
    var lightsHandler = function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
        var client, devices;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, goveeClientManager_1.default)()];
                case 1:
                    client = _a.sent();
                    client.updateDeviceList();
                    return [4 /*yield*/, new Promise(function (resolve) {
                            setTimeout(resolve, 500);
                        })];
                case 2:
                    _a.sent();
                    devices = client.getDevices().map(function (device) { return ({ id: device.id, ip: device.ip, sku: device.sku }); });
                    res.end(JSON.stringify(devices));
                    return [2 /*return*/];
            }
        });
    }); };
    RED.httpAdmin.get('/govee/lights', lightsHandler);
    function GoveeLight(config) {
        var _this = this;
        RED.nodes.createNode(this, config);
        if (!config.deviceid) {
            this.status({ fill: 'red', shape: 'ring', text: 'govee-light.node.not-configured' });
            return;
        }
        var getDevice = function () { return (0, goveeClientManager_1.default)().then(function (client) { return client.getDevice(config.deviceid); }); };
        getDevice().then(function (device) {
            device === null || device === void 0 ? void 0 : device.on('updated', function () {
                _this.send({
                    payload: {
                        power: device.power,
                        brightness: device.brightness,
                        color: device.color,
                        kelvin: device.kelvin,
                    },
                });
            });
        });
        this.on('input', function (msg, send, done) { return __awaiter(_this, void 0, void 0, function () {
            var parsedMessage, device, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!config.deviceid) {
                            throw new Error('Missing device id');
                        }
                        parsedMessage = inputSchema.parse(msg.payload);
                        return [4 /*yield*/, getDevice()];
                    case 1:
                        device = _a.sent();
                        if (!device) {
                            throw new Error("No device found with id ".concat(config.deviceid));
                        }
                        if (typeof parsedMessage === 'boolean') {
                            device.setPower(parsedMessage);
                            done();
                            return [2 /*return*/];
                        }
                        if (typeof parsedMessage.power === 'boolean') {
                            device.setPower(parsedMessage.power);
                        }
                        if (typeof parsedMessage.brightness === 'number') {
                            device.setBrightness(parsedMessage.brightness);
                        }
                        if (typeof parsedMessage.kelvin !== 'undefined') {
                            device.setKelvin(parsedMessage.kelvin);
                        }
                        else if (typeof parsedMessage.rgb !== 'undefined') {
                            device.setRGB(parsedMessage.rgb);
                        }
                        else if (Array.isArray(parsedMessage.hsl)) {
                            device.setHSL(parsedMessage.hsl);
                        }
                        done();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        if (!(error_1 instanceof Error)) {
                            throw error_1;
                        }
                        done(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    }
    RED.nodes.registerType('govee-light', GoveeLight);
}
exports.default = GoveeLightRegistration;
