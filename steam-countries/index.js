require('console-stamp')(console, 'HH:MM:ss.l')

const RAND = true
const I = 10 * 1000

const fs = require('fs')

const Community = require('steamcommunity')
let C = new Community()

let queue = ['76561198091491690']
let skip = 0

let processed = require('./processed.json')
let data = require('./countries.json')

let t = 0
function tick () {
  if (skip > 0) {
    skip--
    console.log(`skipped tick (${skip}).`)
    return
  }

  t++
  let item = queue[0]

  console.log(``)
  console.log(`Begin tick ${t}.`)
  console.log(``)

  if (!processed.includes(item)) {
    // Do work with item, add to processed once finished.
    console.log(`[${t}] processing ${item}.`)

    C.getSteamUser(new (Community.SteamID)(item), (err, user) => {
      if (err) {
        console.error(err)
        // If we get rate limited, wait for 20 minutes.
        if (err.message === 'RateLimitExceeded') skip = (60000 / I) * 20
        return
      }

      if (user.privacyState == 'public') {
        console.log(`[${t}] got steam user ${user.name} (${user.steamID})`)

        // We always want a healthy amount of items to work with.
        if (queue.length < 100) {
          console.log(`[${t}] getting more IDs to work with.`)
          let group = !RAND
            ? (user.primaryGroup || user.groups[0])
            : user.groups[Math.floor(Math.random()*user.groups.length)]

          C.getGroupMembers(group, (err, members) => {
            if (err) {
              console.error(err)
              return
            }

            console.log(`[${t}] got ${members.length} new IDs.`)
            for (let member of members)
              queue.push(member.toString())
          })
        }

        // Do stuff with the user object.
        if (user.location) {
          let l = parseCountry(user.location)
          console.log(`[${t}] ${user.name} (${item}) location: ${l}`)

          if (data[l]) { data[l]++ } else data[l] = 1

          // Every minute, save data to disk.
          if ((t % (60000 / I)) === 0) {
            fs.writeFileSync('./countries.json', JSON.stringify(data))
            fs.writeFileSync('./processed.json', JSON.stringify(processed))
            console.log(`[${t}] saved data to disk.`)
          }

        } else console.log(`[${t}] ${user.name} (${item}) has not set a location.`)

      } else console.log(`[${t}] steam user ${user.name} (${user.steamID}) has a private profile (what a cunt).`)
    })

    processed.push(item)
  } else console.log(`[${t}] already processed ${item}, skipping this tick.`)

  // Remove it even if it's not yet finished.
  queue.shift()
}

tick()
setInterval(tick, I)

function parseCountry (location) {
  if (location.indexOf(',') === -1) {
    return location.trim()
  } else {
    return location.slice(location.lastIndexOf(',') + 1).trim()
  }
}
