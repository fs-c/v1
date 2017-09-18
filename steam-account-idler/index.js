const ACCOUNTS = require('./accounts')

const log = require('../logger')
const request = require('request')
const shuffle = require('shuffle-array')

const Steam = require('steam-user')

for (let account of ACCOUNTS) build(account)

function build (account) {
  let client = new Steam()

  client.logOn(account)

  client.on('loggedOn', () =>
    log.debug(`logged on ${!client.vanityURL ? `anonymously, ensure that credentials are correct.` : `successfully.`}`))

  client.on('webSession', () => {
    log.info(`logged on.`)

    client.setPersona(1)

    function handleGames (err, games) {
      if (err) {
        log.error(`error getting games: ${err}`)
        log.debug(`retrying in 10 minutes.`)
        setTimeout(games, 10 * 60 * 1000, client.steamID, handleGames)
        return
      }

      play(games)
    }

    games(client.steamID, handleGames)
    setInterval(games, 15 * 60 * 1000, client.steamID, handleGames)
  })

  client.on('error', err => log.error(`error: ${err.msg || err}`))

  function play (games) { client.gamesPlayed(shuffle(games)) }
}

function games (id, cb) {
  request(`http://steamcommunity.com/profiles/${id.toString()}/games?tab=all`, (err, res, body) => {
    let games = []
    if (err) cb(err)

    log.debug(`steamcommunity GET: ${res.statusCode}`)

    if (body.indexOf('var rgGames = ') !== -1) {
      try {
        let raw = JSON.parse(body.slice(body.indexOf('var rgGames = ') + 14, body.indexOf('}];') + 2))
        for (let game of raw) games.push(game.appid)
        cb(null, games)
      } catch (e) {
        cb(e)
      }
    } else cb(res.statusCode)
  })
}
