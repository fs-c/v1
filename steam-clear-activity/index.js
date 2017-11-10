const log = require('../logger')

const SteamUser = require('steam-user')
const steamtotp = require('steam-totp')

const ACCOUNTS = [ 'main' ]
const DATA = require('../../steamdata')

const INTERVAL_HIDE = 5 * 60 * 1000
const INTERVAL_ERROR = 10 * 60 * 1000
const INTERVAL_PLAYING = 15 * 60 * 1000
const INTERVAL_RATELIMIT = 6 * 60 * 60 * 1000

// const INTERVAL = {
//   hide: 5 * 60 * 1000,
//   error: 10 * 60 * 1000,
//   playing: 15 * 60 * 1000,
//   ratelimit: 6 * 60 * 60* 1000
// }

const hide = (client) => {
  log.verbose(`hiding games.`)

  client.gamesPlayed([])
  client.gamesPlayed([399220, 399080, 399480])
  client.gamesPlayed([])
}

const login = (client, account) => {
  log.verbose(`logging in.`)

  client.logOn({
    accountName: account.name,
    password: account.password
  })
}

const build = (account) => {
  log.verbose(`building ${account}.`)

  const client = new SteamUser()

  client.setOption('promptSteamGuardCode', false)

  login(client, account)

  client.on('steamGuard', (domain, callback) => {
    log.debug(`steamGuard received.`)
    steamtotp.getAuthCode(account.shasec, (err, code, offset, latency) => {
      if (err) console.error(err)
      callback(code)
    })
  })

  let timer
  client.on('loggedOn', details => {
    log.debug(`logged on.`)
    hide(client)
    timer = setInterval(hide, INTERVAL_HIDE, client)
  })

  client.on('error', err => {
    clearInterval(timer)

    log.error('error: ' + err.message || err.msg || err)

    if (err.message === 'LoggedInElsewhere') {
      setTimeout(
        function () { timer = setInterval(hide, INTERVAL_PLAYING, client) },
        10*60*1000
      )
    } else {
      client.logOff()

      let i = (err.message === 'RateLimitExceeded' ? INTERVAL_RATELIMIT : INTERVAL_ERROR)
      setTimeout(login, i, client)
    }
  })
}

for (let name in DATA)
  if (ACCOUNTS.includes(name)) build(DATA[name])
