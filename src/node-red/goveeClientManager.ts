import type GoveeSocket from '../GoveeSocket'
import createGoveeClient from '../createGoveeClient'

let goveeDevices = 0
let clientPromise: Promise<GoveeSocket>
let connect = false
export function getClient() {
  return clientPromise
}

async function initGoveeClient() {
  if (!clientPromise) {
    clientPromise = createGoveeClient()
    clientPromise.then(client => {
      client.on('deviceDiscovered', device => {
        console.info(`Found govee device "${device.id}" at ip "${device.ip}"`)
      })
      client.on('deviceRemoved', device => {
        console.info(`Removed govee device "${device.id}" at ip "${device.ip}"`)
      })
      client.on('deviceUpdated', device => {
        console.info(`Updated govee device "${device.id}" at ip "${device.ip}"`)
      })
    })
  }
  connect = true
  const client = await getClient()

  if (connect) {
    client.connect()
  }
}

async function teardownGoveeClient() {
  connect = false
  const client = await getClient()
  if (!connect) {
    client.close()
  }
}

export function addGoveeDevice() {
  if (goveeDevices++ === 0) {
    initGoveeClient()
  }
}

export function removeGoveeDevice() {
  if (--goveeDevices === 0) {
    teardownGoveeClient()
  }
}
