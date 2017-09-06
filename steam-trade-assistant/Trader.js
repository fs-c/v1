const EventEmitter = require('events')
require('util').inherits(Trader, EventEmitter)

const log = require('winston')
const fs = require('fs')

const Steam = require('steam-user')
const Manager = require('steam-tradeoffer-manager')
const Community = require('steamcommunity')

module.exports = Trader

function Trader (account) {
  this._client = new Steam()
  this._community = new Community()
  this._manager = new Manager({
    steam: this._client,
    domain: 'fsoc.space',
    language: 'en'
  })

  // Boilerplate.
  if (fs.existsSync('polldata.json')) this._manager.pollData = require('./polldata.json')
  this._manager.on('pollData', data => fs.writeFile('polldata.json', JSON.stringify(data), () => {}))

  this._client.setOption('promptSteamGuardCode', false)
  this._client.logOn(account)
  this._client.on('error', err => this.emit('clientError', err, Steam.EResult[err.eresult]))
  this._client.on('loggedOn', () => log.debug(`loggedOn event received by client.`))
  this._client.on('steamGuard', (domain, callback) => {
    log.debug(`steamGuard event received by client.`)
    if (account.shasec) require('steam-totp').getAuthCode(account.shasec, (e, code) => callback(code))
    else callback(require('readline-sync').question(`${domain ? 'Email' : 'Mobile'} code: `))
  })

  // Optimally this gets called once per offer (Active -> Accepted||Declined).
  this._manager.on('receivedOfferChanged', (offer, oldState) => {
    log.debug(`offer ${offer.id} changed: ${Manager.ETradeOfferState[oldState]} -> ${Manager.ETradeOfferState[offer.state]}.`)

    if (offer.state === Manager.ETradeOfferState.Accepted) {
      offer.getExchangeDetails((err, status, initTime, receivedItems, sentItems) => {
        this.emit('offerAccepted', err, status, initTime, receivedItems, sentItems)
      })
    }
  })

  this._client.on(`webSession`, (sessionID, cookies) => {
    log.debug(`webSession event recieved by client.`)

    this._manager.setCookies(cookies, err => {
      if (err) {
        this.emit('managerError', err)
        process.exit(1) // This is a fatal error, couldn't get API.
      } else this.emit('ready')
    })

    this._community.setCookies(cookies)
    this._community.startConfirmationChecker(15000, account.idsec)
  })

  this._manager.on('newOffer', offer => {
    this._community.getSteamUser(offer.partner, (e, user) => {
      // We don't really care if this errors or not.
      offer['user'] = user
      this.emit('newOffer', offer)
    })
  })
}

// Really just a 'promisified' version of the original.
Trader.prototype.accept = function (offer) {
  return new Promise((resolve, reject) => {
    offer.accept(err => {
      if (err) {
        reject(err)
      } else {
        resolve()
        this._community.checkConfirmations()
      }
    })
  })
}
