import type { Socket, RemoteInfo } from 'node:dgram'
import { createSocket } from 'node:dgram'
import { EventEmitter } from 'node:events'
import type { NetworkInterfaceInfo } from 'node:os'

import * as z from 'zod'

import GoveeDevice from './GoveeDevice'
import { responseSchema } from './protocol'

const GOVEE_ADDRESS = '239.255.255.250'
const GOVEE_INCOMING_PORT = 4002
const GOVEE_OUTGOING_PORT = 4001
const UNRESPONSIVE_THRESHOLD = 10_000 // 10s

const SCAN_INTERVAL = 10_000 // 10s
const STATUS_INTERVAL = 1_000 // 1s

const ipSchema = z.string().ip()

export default class GoveeSocket extends EventEmitter {
  private socketPromise!: Promise<Socket>
  private closed = true
  private pollStatusInterval?: NodeJS.Timeout
  private pollScanInterval?: NodeJS.Timeout
  private devices = new Map<string, { device: GoveeDevice; lastSeen: number }>()

  constructor(private networkAddress: NetworkInterfaceInfo) {
    super()
    this.connect()
  }

  public connect() {
    if (!this.closed) {
      return
    }
    this.closed = false
    const socket = createSocket({
      type: 'udp4',
      reuseAddr: true,
    })

    this.socketPromise = new Promise(resolve => {
      socket.once('message', (...params) => {
        this.handleMessage(...params)
        this.init(socket)
        resolve(socket)
      })

      socket.on('listening', () => {
        socket.setBroadcast(true)
        socket.setMulticastTTL(128)
        socket.addMembership(GOVEE_ADDRESS)
        const message = JSON.stringify({ msg: { cmd: 'scan', data: { account_topic: 'reserve' } } })
        socket.send(message, 0, message.length, GOVEE_OUTGOING_PORT, GOVEE_ADDRESS)
      })

      socket.bind(GOVEE_INCOMING_PORT, this.networkAddress.address)
    })
  }

  public on(name: 'deviceDiscovered', listener: (data: GoveeDevice) => void): this
  public on(name: 'deviceRemoved', listener: (data: GoveeDevice) => void): this
  public on(name: 'deviceUpdated', listener: (data: GoveeDevice) => void): this
  public on(name: string, listener: (data: any) => void) {
    return super.on(name, listener)
  }

  public async send(command: string, data: Record<string, string | number> = {}, target = GOVEE_ADDRESS) {
    const message = JSON.stringify({ msg: { cmd: command, data } })

    const socket = await this.getSocket()
    return new Promise<void>((resolve, reject) => {
      socket.send(message, 0, message.length, GOVEE_OUTGOING_PORT, target, error => {
        if (error) {
          reject(error)
        } else {
          resolve()
          if (target !== GOVEE_ADDRESS && command !== 'devStatus') {
            this.updateDeviceStatus(target)
          }
        }
      })
    })
  }

  private handleMessage(buffer: Buffer, remoteInfo: RemoteInfo) {
    if (this.closed) {
      return
    }
    try {
      const { cmd, data } = responseSchema.parse(buffer)

      switch (cmd) {
        case 'scan': {
          if (this.devices.has(data.device)) {
            const deviceEntry = this.devices.get(data.device)!
            if (deviceEntry.device.ip !== data.ip) {
              console.info(`Device ${data.device} switched ip from ${deviceEntry.device.ip} to ${data.ip}`)
            }
            deviceEntry.device.updateConfig(data, (c, d) => this.send(c, d, data.ip))
            deviceEntry.lastSeen = Date.now()
          } else {
            const device = new GoveeDevice(data, (c, d) => this.send(c, d, data.ip))
            this.devices.set(data.device, {
              device,
              lastSeen: Date.now(),
            })
            this.updateDeviceStatus(device.ip)
            device.initialized().then(() => {
              this.emit('deviceDiscovered', device)
            })
          }
          break
        }

        case 'devStatus': {
          const deviceEntry = Array.from(this.devices.values()).find(({ device }) => device.ip === remoteInfo.address)
          if (!deviceEntry) {
            throw new Error(`No device with ip ${remoteInfo.address}`)
          }
          if (deviceEntry.device.updateStatus(data)) {
            this.emit('deviceUpdated', deviceEntry.device)
          }
          deviceEntry.lastSeen = Date.now()
          break
        }
        default: {
          throw new Error(`Received unknown message cmd ${cmd}`)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  private async init(socket: Socket) {
    if (this.closed) {
      return
    }

    socket.on('message', (...params) => this.handleMessage(...params))

    this.pollStatusInterval = setInterval(() => {
      this.updateDeviceStatus()
    }, STATUS_INTERVAL)

    this.pollScanInterval = setInterval(() => {
      this.updateDeviceList()
    }, SCAN_INTERVAL)
  }

  public close() {
    this.closed = true
    clearInterval(this.pollStatusInterval)
    clearInterval(this.pollScanInterval)
    return new Promise<void>(resolve => {
      this.getSocket().then(socket => socket.close(resolve))
    })
  }

  private getSocket() {
    return this.socketPromise
  }

  public ready() {
    return this.getSocket().then(() => this)
  }

  public updateDeviceStatus(ip?: string) {
    return this.send('devStatus', {}, ip)
  }

  public updateDeviceList() {
    const threshold = Date.now() - UNRESPONSIVE_THRESHOLD
    this.devices.forEach(deviceEntry => {
      if (deviceEntry.lastSeen < threshold) {
        this.devices.delete(deviceEntry.device.id)
        deviceEntry.device.emit('removed')
        this.emit('deviceRemoved', deviceEntry.device)
      }
    })

    return this.send('scan', { account_topic: 'reserve' })
  }

  public getDevices() {
    return Array.from(this.devices.values()).map(deviceEntry => deviceEntry.device)
  }

  public getDevice(idOrIp: string) {
    if (ipSchema.safeParse(idOrIp).success) {
      return this.getDevices().find(device => device.ip === idOrIp)
    }
    return this.devices.get(idOrIp)?.device
  }
}
