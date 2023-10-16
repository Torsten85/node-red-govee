import type GoveeSocket from '../GoveeSocket'
import createGoveeClient from '../createGoveeClient'

let clientPromise: Promise<GoveeSocket>

export default function getClient() {
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
  return clientPromise
}
