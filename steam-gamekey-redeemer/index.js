const accounts = require('./accounts')

const file = require('fs').readFileSync('keys.txt')
const used = require('fs').readFileSync('used.txt')

const { StringDecoder } = require('string_decoder')
const decoder = new StringDecoder('utf8')

let f = decoder.write(Buffer.from(file))
let u = decoder.write(Buffer.from(used))

f = f.split('\n')

let parsed = []
for (let line of f) {
  if (line.indexOf('\r') !== -1) line = line.replace('\r', '')
  if (line.indexOf('\t') !== -1) line = line.replace('\t', '')
  parsed.push(line)
}

let parsedUsed = []
for (let line of f) {
  if (line.indexOf('\r') !== -1) line = line.replace('\r', '')
  if (line.indexOf('\t') !== -1) line = line.replace('\t', '')
  parsedUsed.push(line)
}

console.log(`redeeming ${parsed.length} keys on ${accounts.length} accounts.`)

let keys = []
let size = parsed.length / accounts.length
accounts.forEach(() => keys.push(parsed.splice(0, size)))

const Steam = require('steam-user')

for (let i in accounts) build(accounts[i], i)

function build (a, i) {
  let bot = new Steam()

  bot.logOn(a)

  bot.on('loggedOn', () => {
    console.log(`logged on with ${a.accountName}.`)
    for (let key of keys[i]) {
      if (!parsedUsed.includes(key)) {
        bot.redeemKey(key, (res, det) => {
          console.log(`key: ${key}, result: ${Steam.EResult[res]}, details: ${Steam.EPurchaseResult[det]}`)
          if (res === 1) require('fs').appendFile('used.txt', key)
        })
      } else console.log(`key ${key} already used`)
    }
  })
}
