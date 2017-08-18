const log = require('winston')

const CFG = require('./config')

const Steam = require('steam-user')

const request = require('request')
const cheerio = require('cheerio')

module.exports = function (client) {
  return new Promise((resolve, reject) => {
    client.setPersona(Steam.EPersonaState.Online)

    client.on('friendMessage', (steamID, msg) => {
      log.verbose(`message from ${steamID.getSteam3RenderedID()}: ${msg}`)
      client.chatMessage(steamID, CFG.defaults['chatResponse'])
    })

    client.on('friendRelationship', (steamID, rel) => {
      if (rel === Steam.EFriendRelationship.RequestRecipient) {
        log.verbose(`user ${steamID.getSteam3RenderedID()} sent a friend request.`)

        request('http://steamcommunity.com/profiles/' + steamID.getSteamID64(), (err, res, body) => {
          if (err || res.statusCode !== 200)
            log.error(`failed at getting profile for ${steamID.getSteam3RenderedID()}`)

        	const $ = cheerio.load(body)
          const level = parseInt(($('.friendPlayerLevelNum')[0].children[0].data), 10)

          if (level > CFG.minLevel) {
            client.addFriend(steamID, err => {
              if (!err) {
                client.chatMessage(steamID, CFG.defaults['welcomeMessage'])
                log.verbose(`accepted user ${steamID.getSteam3RenderedID()}, level: ${level}`)
              }
            })
          }
        })
      } else {
        log.verbose(`relationship change with user ${steamID.getSteam3RenderedID()}, changed to ${rel}`)
      }
    })

    resolve()
  })
}
