import type { Handler } from 'express'
import type { Node } from 'node-red'
import * as z from 'zod'

import getClient from './goveeClientManager'

const booleanInputSchema = z.boolean()

const objectInputSchema = z.object({
  power: z.boolean().optional(),
  rgb: z
    .union([
      z.string().regex(/^#[a-fA-F0-9]{6}$/),
      z.tuple([z.number().int().min(0).max(255), z.number().int().min(0).max(255), z.number().int().min(0).max(255)]),
    ])
    .optional(),
  hsl: z.tuple([z.number().int().min(0).max(360), z.number().int().min(0).max(255), z.number().int().min(0).max(255)]).optional(),
  kelvin: z.number().int().min(2000).max(9000).optional(),
  brightness: z.number().int().min(0).max(100).optional(),
})

const inputSchema = z.union([booleanInputSchema, objectInputSchema])

export default function GoveeLightRegistration(RED: any) {
  const lightsHandler: Handler = async (_req, res) => {
    const client = await getClient()
    client.updateDeviceList()
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })

    const devices = client.getDevices().map(device => ({ id: device.id, ip: device.ip, sku: device.sku }))
    res.end(JSON.stringify(devices))
  }
  RED.httpAdmin.get('/govee/lights', lightsHandler)

  function GoveeLight(this: Node, config: { deviceid?: string }) {
    RED.nodes.createNode(this, config)

    if (!config.deviceid) {
      this.status({ fill: 'red', shape: 'ring', text: 'govee-light.node.not-configured' })
      return
    }

    const getDevice = () => getClient().then(client => client.getDevice(config.deviceid!))

    getDevice().then(device => {
      device?.on('updated', () => {
        this.send({
          payload: {
            power: device.power,
            brightness: device.brightness,
            color: device.color,
            kelvin: device.kelvin,
          },
        })
      })
    })

    this.on('input', async (msg, send, done) => {
      try {
        if (!config.deviceid) {
          throw new Error('Missing device id')
        }
        const parsedMessage = inputSchema.parse(msg.payload)

        const device = await getDevice()
        if (!device) {
          throw new Error(`No device found with id ${config.deviceid}`)
        }

        if (typeof parsedMessage === 'boolean') {
          device.setPower(parsedMessage)
          done()
          return
        }

        if (typeof parsedMessage.power === 'boolean') {
          device.setPower(parsedMessage.power)
        }

        if (typeof parsedMessage.brightness === 'number') {
          device.setBrightness(parsedMessage.brightness)
        }

        if (typeof parsedMessage.kelvin !== 'undefined') {
          device.setKelvin(parsedMessage.kelvin)
        } else if (typeof parsedMessage.rgb !== 'undefined') {
          device.setRGB(parsedMessage.rgb)
        } else if (Array.isArray(parsedMessage.hsl)) {
          device.setHSL(parsedMessage.hsl)
        }
        done()
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error
        }
        done(error)
      }
    })
  }

  RED.nodes.registerType('govee-light', GoveeLight)
}
