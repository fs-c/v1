require('console-stamp')(console, 'HH:MM:ss.l')

const fs = require('fs')

let config = {}
if (fs.existsSync('./config.json')) {
  config = require('./config')
  console.log(`read config file.`)
} else console.log(`no config file found, using defaults.`)

const PATH = config.path || './'
const RAND = config.rand || true
const I = config.interval || 10 * 1000

if (process.env.RESET) {
  fs.writeFileSync(PATH + './processed.json', '[]')
  fs.writeFileSync(PATH + './countries.json', '{}')
}

const Community = require('steamcommunity')
let C = new Community()

let queue = ['76561198091491690']
let skip = 0

let processed = require('./processed.json')
let data = require('./countries.json')

let t = 0
function tick () {
  if (skip > 0) {
    console.log(``)
    console.log(`skipped tick (${skip + 1}).`)
    skip--
    return
  }

  t++
  let item = queue[0]

  console.log(``)
  console.log(`Begin tick ${t}.`)
  console.log(``)

  if (!processed.includes(item)) {
    // Do work with item, add to processed once finished.
    console.log(`[${t}] processing ${item} / ${queue.length}.`)

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

          let gotMembers = false
          setTimeout(() => { gotMembers ? 0 : skip++ }, I - 1000)

          C.getGroupMembers(group, (err, members) => {
            if (err) {
              console.error(err)
              return
            }

            gotMembers = true

            console.log(`[${t}] got ${members.length} new IDs from group ${group.name}.`)
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
          if (!(t % (60000 / I))) {
            fs.writeFileSync(PATH + 'countries.json', JSON.stringify(data))
            fs.writeFileSync(PATH + 'processed.json', JSON.stringify(processed))
            console.log(`[${t}] saved data to disk.`)
          }

        } else console.log(`[${t}] ${user.name} (${item}) has not set a location.`)

      } else console.log(`[${t}] steam user ${user.name} (${user.steamID}) has a private profile.`)
    })

    processed.push(item)
  } else console.log(`[${t}] already processed ${item}, skipping this tick.`)

  // Remove it even if it's not yet finished.
  queue.shift()
}

tick()
setInterval(tick, I)

function parseCountry (location) {
  return location.indexOf(',') === -1
  ? location.trim()
  : location.slice(location.lastIndexOf(',') + 1).trim()
}
