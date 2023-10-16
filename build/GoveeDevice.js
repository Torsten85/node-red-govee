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
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var color_convert_1 = require("color-convert");
var z = __importStar(require("zod"));
var brightnessRangeSchema = z.number().int().min(0).max(100);
var kelvinSchema = z.number().int().min(2000).max(9000);
var hslSchema = z.tuple([z.number().int().min(0).max(255), z.number().int().min(0).max(255), z.number().int().min(0).max(255)]);
var rgbSchema = z.union([hslSchema, z.string().regex(/^#[a-fA-F0-9]{6}$/)]);
var GoveeDevice = /** @class */ (function (_super) {
    __extends(GoveeDevice, _super);
    function GoveeDevice(config, send) {
        var _this = _super.call(this) || this;
        _this.send = send;
        _this.targetStatus = {};
        _this.config = config;
        _this.initPromise = new Promise(function (resolve) {
            _this.resolveInitPromise = resolve;
        });
        return _this;
    }
    GoveeDevice.prototype.on = function (name, listener) {
        return _super.prototype.on.call(this, name, listener);
    };
    GoveeDevice.prototype.updateConfig = function (config, send) {
        this.config = config;
        this.send = send;
    };
    GoveeDevice.prototype.updateStatus = function (status) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var hasChanges = ((_a = this.status) === null || _a === void 0 ? void 0 : _a.brightness) !== status.brightness ||
            ((_b = this.status) === null || _b === void 0 ? void 0 : _b.onOff) !== status.onOff ||
            ((_c = this.status) === null || _c === void 0 ? void 0 : _c.colorTemInKelvin) !== status.colorTemInKelvin ||
            ((_d = this.status) === null || _d === void 0 ? void 0 : _d.color.r) !== status.color.r ||
            ((_e = this.status) === null || _e === void 0 ? void 0 : _e.color.g) !== status.color.g ||
            ((_f = this.status) === null || _f === void 0 ? void 0 : _f.color.b) !== status.color.b;
        var target = this.targetStatus;
        this.status = status;
        if (status.onOff === target.onOff) {
            console.info("Govee Light ".concat(this.id, " reached target onOff (").concat(target.onOff, ")"));
            delete target.onOff;
        }
        else if ('onOff' in target) {
            console.info("Govee Light ".concat(this.id, " did not reach target onOff (").concat(target.onOff, ")"));
            this.setPower(Boolean(target.onOff));
        }
        if (status.brightness === target.brightness) {
            console.info("Govee Light ".concat(this.id, " reached target brightness (").concat(target.brightness, ")"));
            delete target.brightness;
        }
        else if ('brightness' in target) {
            console.info("Govee Light ".concat(this.id, " did not reach target brightness (").concat(target.brightness, ")"));
            this.setBrightness(target.brightness);
        }
        if (status.colorTemInKelvin === target.colorTemInKelvin) {
            console.info("Govee Light ".concat(this.id, " reached target colorTemInKelvin (").concat(target.colorTemInKelvin, ")"));
            delete target.colorTemInKelvin;
        }
        else if ('colorTemInKelvin' in target) {
            console.info("Govee Light ".concat(this.id, " did not reach target colorTemInKelvin (").concat(target.colorTemInKelvin, ")"));
            this.setKelvin(target.colorTemInKelvin);
        }
        if (status.color.r === ((_g = target.color) === null || _g === void 0 ? void 0 : _g.r) && status.color.g === ((_h = target.color) === null || _h === void 0 ? void 0 : _h.g) && status.color.b === ((_j = target.color) === null || _j === void 0 ? void 0 : _j.b)) {
            console.info("Govee Light ".concat(this.id, " reached target color (").concat(target.color.r, ",").concat(target.color.g, ",").concat(target.color.b, ")"));
            delete target.color;
        }
        else if ('color' in target) {
            console.info("Govee Light ".concat(this.id, " did not reach target color (").concat(target.color.r, ",").concat(target.color.g, ",").concat(target.color.b, ")"));
            this.setRGB([target.color.r, target.color.g, target.color.b]);
        }
        this.resolveInitPromise();
        if (hasChanges) {
            this.emit('updated');
        }
        return hasChanges;
    };
    Object.defineProperty(GoveeDevice.prototype, "ip", {
        get: function () {
            return this.config.ip;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GoveeDevice.prototype, "id", {
        get: function () {
            return this.config.device;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GoveeDevice.prototype, "sku", {
        get: function () {
            return this.config.sku;
        },
        enumerable: false,
        configurable: true
    });
    GoveeDevice.prototype.initialized = function () {
        return this.initPromise;
    };
    Object.defineProperty(GoveeDevice.prototype, "power", {
        get: function () {
            var _a;
            return Boolean((_a = this.status) === null || _a === void 0 ? void 0 : _a.onOff);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GoveeDevice.prototype, "kelvin", {
        get: function () {
            var _a;
            return ((_a = this.status) === null || _a === void 0 ? void 0 : _a.colorTemInKelvin) || 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GoveeDevice.prototype, "brightness", {
        get: function () {
            var _a;
            return ((_a = this.status) === null || _a === void 0 ? void 0 : _a.brightness) || 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GoveeDevice.prototype, "color", {
        get: function () {
            var _a;
            if ((_a = this.status) === null || _a === void 0 ? void 0 : _a.color) {
                return [this.status.color.r, this.status.color.g, this.status.color.b];
            }
            return [0, 0, 0];
        },
        enumerable: false,
        configurable: true
    });
    GoveeDevice.prototype.setPower = function (power) {
        var onOff = power ? 1 : 0;
        this.targetStatus = { onOff: onOff };
        return this.send('turn', { value: onOff });
    };
    GoveeDevice.prototype.setBrightness = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var brightness;
            return __generator(this, function (_a) {
                brightness = brightnessRangeSchema.parse(value);
                this.targetStatus.brightness = brightness;
                return [2 /*return*/, this.send('brightness', { value: brightness })];
            });
        });
    };
    GoveeDevice.prototype.setKelvin = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var colorTemInKelvin;
            return __generator(this, function (_a) {
                colorTemInKelvin = kelvinSchema.parse(value);
                this.targetStatus.colorTemInKelvin = colorTemInKelvin;
                delete this.targetStatus.color;
                return [2 /*return*/, this.send('colorwc', {
                        colorTemInKelvin: colorTemInKelvin,
                    })];
            });
        });
    };
    GoveeDevice.prototype.setRGB = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var color, rgb;
            return __generator(this, function (_a) {
                color = rgbSchema.parse(value);
                if (typeof color === 'string') {
                    color = color_convert_1.hex.rgb(color);
                }
                rgb = { r: color[0], g: color[1], b: color[2] };
                this.targetStatus.color = rgb;
                delete this.targetStatus.colorTemInKelvin;
                return [2 /*return*/, this.send('colorwc', {
                        color: rgb,
                    })];
            });
        });
    };
    GoveeDevice.prototype.setHSL = function (value) {
        return this.setRGB(color_convert_1.hsl.rgb(value));
    };
    return GoveeDevice;
}(events_1.EventEmitter));
exports.default = GoveeDevice;
