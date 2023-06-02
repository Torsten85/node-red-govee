import * as z from 'zod'

const scanResponseSchema = z.object({
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
})

export type ScanResponse = z.infer<typeof scanResponseSchema>

const deviceStatusResponseSchema = z.object({
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
})

export type DeviceStatusResponse = z.infer<typeof deviceStatusResponseSchema>

export const responseSchema = z
  .instanceof(Buffer)
  .transform(str => JSON.parse(str.toString()))
  .pipe(z.object({ msg: z.any() }))
  .transform(obj => obj.msg)
  .pipe(z.union([scanResponseSchema, deviceStatusResponseSchema]))

export type Response = z.infer<typeof responseSchema>
