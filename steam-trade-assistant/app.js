const PATH = process.env.DATA_PATH || '../../steamdata'

const log = require('./logger')

const Trader = require('./Trader')

let name = require('readline-sync').question('Account: ')
let trader = new Trader(require(PATH)[name])

trader.on('ready', () => log.info(`trader ready.`))

trader.on('clientError', err => log.error(`error while logging in: ${err.msg || err.message || err}`))
trader.on('managerError', err => log.error(`trade manager error: ${err.msg || err.message || err}`))

trader.on('newOffer', offer => {
  log.info(`new offer (${offer.id}) by ${offer.user ? offer.user.name : offer.partner.toString()}, ${offer.itemsToGive.length} item(s) to give and ${offer.itemsToReceive.length} item(s) to receive.`)
  if (require('readline-sync').keyInYN(`Accept offer ${offer.id}?`)) {
    trader.accept(offer)
    .then(() => log.info(`accepted offer ${offer.id}.`))
    .catch(err => log.warn(`error accepting offer ${offer.id}: ${err.msg || err.message || err}`))
  }
})
