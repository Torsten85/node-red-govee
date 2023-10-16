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
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseSchema = void 0;
var z = __importStar(require("zod"));
var scanResponseSchema = z.object({
    cmd: z.literal('scan'),
    data: z.object({
        ip: z.string().ip(),
        device: z.string(),
        sku: z.string(),
        bleVersionHard: z.string(),
        bleVersionSoft: z.string(),
        wifiVersionHard: z.string(),
        wifiVersionSoft: z.string(),
    }),
});
var deviceStatusResponseSchema = z.object({
    cmd: z.literal('devStatus'),
    data: z.object({
        onOff: z.union([z.literal(0), z.literal(1)]),
        brightness: z.number().int().min(0).max(100),
        color: z.object({
            r: z.number().int().min(0).max(255),
            g: z.number().int().min(0).max(255),
            b: z.number().int().min(0).max(255),
        }),
        colorTemInKelvin: z.number().int(),
    }),
});
exports.responseSchema = z
    .instanceof(Buffer)
    .transform(function (str) { return JSON.parse(str.toString()); })
    .pipe(z.object({ msg: z.any() }))
    .transform(function (obj) { return obj.msg; })
    .pipe(z.union([scanResponseSchema, deviceStatusResponseSchema]));
