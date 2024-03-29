import { EventEmitter } from 'events'

import { hsl, hex } from 'color-convert'
import * as z from 'zod'

import type { DeviceStatusResponse, ScanResponse } from './protocol'

const brightnessRangeSchema = z.number().int().min(0).max(100)
const kelvinSchema = z.number().int().min(2000).max(9000)
const hslSchema = z.tuple([z.number().int().min(0).max(255), z.number().int().min(0).max(255), z.number().int().min(0).max(255)])

const rgbSchema = z.union([hslSchema, z.string().regex(/^#[a-fA-F0-9]{6}$/)])

type Config = ScanResponse['data']
type Status = DeviceStatusResponse['data']

export default class GoveeDevice extends EventEmitter {
  private config: Config
  private status?: Status
  private targetStatus: Partial<Status> = {}
  private initPromise: Promise<void>
  private resolveInitPromise!: () => void

  constructor(config: Config, private send: (cmd: string, data?: Record<string, any>) => Promise<void>) {
    super()
    this.config = config
    this.initPromise = new Promise(resolve => {
      this.resolveInitPromise = resolve
    })
  }

  public on(name: 'updated', listener: () => void): this
  public on(name: 'removes', listener: () => void): this
  public on(name: string, listener: (data: any) => void) {
    return super.on(name, listener)
  }

  public updateConfig(config: Config, send: (cmd: string, data?: Record<string, any>) => Promise<void>) {
    this.config = config
    this.send = send
  }

  public updateStatus(status: Status) {
    const hasChanges =
      this.status?.brightness !== status.brightness ||
      this.status?.onOff !== status.onOff ||
      this.status?.colorTemInKelvin !== status.colorTemInKelvin ||
      this.status?.color.r !== status.color.r ||
      this.status?.color.g !== status.color.g ||
      this.status?.color.b !== status.color.b

    const target = this.targetStatus
    this.status = status

    if (status.onOff === target.onOff) {
      console.info(`Govee Light ${this.id} reached target onOff (${target.onOff})`)
      delete target.onOff
    } else if ('onOff' in target) {
      console.info(`Govee Light ${this.id} did not reach target onOff (${target.onOff})`)
      this.setPower(Boolean(target.onOff))
    }

    if (status.brightness === target.brightness) {
      console.info(`Govee Light ${this.id} reached target brightness (${target.brightness})`)
      delete target.brightness
    } else if ('brightness' in target) {
      console.info(`Govee Light ${this.id} did not reach target brightness (${target.brightness})`)
      this.setBrightness(target.brightness!)
    }

    if (status.colorTemInKelvin === target.colorTemInKelvin) {
      console.info(`Govee Light ${this.id} reached target colorTemInKelvin (${target.colorTemInKelvin})`)
      delete target.colorTemInKelvin
    } else if ('colorTemInKelvin' in target) {
      console.info(`Govee Light ${this.id} did not reach target colorTemInKelvin (${target.colorTemInKelvin})`)
      this.setKelvin(target.colorTemInKelvin!)
    }

    if (status.color.r === target.color?.r && status.color.g === target.color?.g && status.color.b === target.color?.b) {
      console.info(`Govee Light ${this.id} reached target color (${target.color.r},${target.color.g},${target.color.b})`)
      delete target.color
    } else if ('color' in target) {
      console.info(`Govee Light ${this.id} did not reach target color (${target.color!.r},${target.color!.g},${target.color!.b})`)
      this.setRGB([target.color!.r, target.color!.g, target.color!.b])
    }

    this.resolveInitPromise()
    if (hasChanges) {
      this.emit('updated')
    }
    return hasChanges
  }

  public get ip() {
    return this.config.ip
  }

  public get id() {
    return this.config.device
  }

  public get sku() {
    return this.config.sku
  }

  public initialized() {
    return this.initPromise
  }

  public get power() {
    return Boolean(this.status?.onOff)
  }

  public get kelvin() {
    return this.status?.colorTemInKelvin || 0
  }

  public get brightness() {
    return this.status?.brightness || 0
  }

  public get color(): [number, number, number] {
    if (this.status?.color) {
      return [this.status.color.r, this.status.color.g, this.status.color.b]
    }

    return [0, 0, 0]
  }

  public setPower(power: boolean) {
    const onOff = power ? 1 : 0
    this.targetStatus = { onOff }
    return this.send('turn', { value: onOff })
  }

  public async setBrightness(value: z.infer<typeof brightnessRangeSchema>) {
    const brightness = brightnessRangeSchema.parse(value)
    this.targetStatus.brightness = brightness
    return this.send('brightness', { value: brightness })
  }

  public async setKelvin(value: z.infer<typeof kelvinSchema>) {
    const colorTemInKelvin = kelvinSchema.parse(value)
    this.targetStatus.colorTemInKelvin = colorTemInKelvin
    delete this.targetStatus.color
    return this.send('colorwc', {
      colorTemInKelvin,
    })
  }

  public async setRGB(value: z.infer<typeof rgbSchema>) {
    let color = rgbSchema.parse(value)
    if (typeof color === 'string') {
      color = hex.rgb(color)
    }

    const rgb = { r: color[0], g: color[1], b: color[2] }
    this.targetStatus.color = rgb
    delete this.targetStatus.colorTemInKelvin
    return this.send('colorwc', {
      color: rgb,
    })
  }

  public setHSL(value: z.infer<typeof hslSchema>) {
    return this.setRGB(hsl.rgb(value))
  }
}
