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
  this._client.setOption('promptSteamGuardCode', false)
  this._client.logOn(account)
  this._client.on('steamGuard', (domain, callback) => {
    log.debug(`steamGuard event received by client.`)
    if (account.shasec) { require('steam-totp').getAuthCode(account.shasec, (e, code) => callback(code)) }
    else { callback(require('readline-sync').question(`${domain ? 'Email' : 'Mobile'} code: `)) }
  })
  this._client.on('error', err => this.emit('clientError', err))
  this._client.on('loggedOn', () => log.debug(`loggedOn event received by client.`))

  if (fs.existsSync('polldata.json'))
    this._manager.pollData = require('./polldata.json')

  this._manager.on('pollData', data =>
    fs.writeFile('polldata.json', JSON.stringify(data), () => {}))

  this._manager.on('receivedOfferChanged', (offer, oldState) => {
    log.debug(`offer ${offer.id} changed: ${Manager.ETradeOfferState[oldState]} -> ${Manager.ETradeOfferState[offer.state]}.`)

    if (offer.state == Manager.ETradeOfferState.Accepted) {
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
        process.exit(1) // This is a fatal error.
        return
      } else this.emit('ready')
    })

    this._community.setCookies(cookies)
    this._community.startConfirmationChecker(15000, account.idsec)
  })

  this._manager.on('newOffer', offer => {
    this._community.getSteamUser(offer.partner, (err, user) => {
      offer['user'] = user
      this.emit('newOffer', offer)
    })
  })
}

Trader.prototype.check = function () { this._community.checkConfirmations() }
