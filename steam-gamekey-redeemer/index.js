const accounts = require('./accounts')

const newKeys = require('fs').readFileSync('keys.txt')
const usedKeys = require('fs').readFileSync('used.txt')

const { StringDecoder } = require('string_decoder')
const decoder = new StringDecoder('utf8')

let f = decoder.write(Buffer.from(newKeys))
let u = decoder.write(Buffer.from(usedKeys))

f = f.split('\n')

function parse (f) {
  let parsed = []
  for (let line of f) {
    if (line.indexOf('\r') !== -1) line = line.replace('\r', '')
    if (line.indexOf('\t') !== -1) line = line.replace('\t', '')
    parsed.push(line)
  }
  return parsed
}

let parsed = parse(f)
let used = parse(u)

console.log(`redeeming ${parsed.length} keys on ${accounts.length} accounts.`)

let keys = []
let size = parsed.length / accounts.length // parsed changes with every iteration, can't do this inline.
accounts.forEach(() => keys.push(parsed.splice(0, size)))

const Steam = require('steam-user')

for (let i in accounts) build(accounts[i], i)

function build (a, i) {
  let bot = new Steam()

  bot.logOn(a)

  bot.on('loggedOn', () => {
    console.log(`logged on with ${a.accountName}.`)
    for (let key of keys[i]) {
      if (!used.includes(key)) {
        bot.redeemKey(key, (res, det) => {
          console.log(`key: ${key}, result: ${Steam.EResult[res]}, details: ${Steam.EPurchaseResultDetail[det]}`)
          if (res === 1) require('fs').appendFileSync('used.txt', key + '\n')
        })
      } else console.log(`key ${key} already used`)
    }
  })
}
