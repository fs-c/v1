const BASE = 'fsokbot'
const EMAIL = 'airmail.cc'
const I = 4

let accounts = []

let client = new (require('steam-user'))()

client.logOn()

client.on('loggedOn', () => {
  for (let i = 2; i < I; i++) {
    accounts.push({
      accountName: `${BASE}${i}`,
      password: require('randomstring').generate({ length: 10 }),
      email: `${BASE}${i}@${EMAIL}`
    })

    let a = accounts[accounts.length - 1]
    client.createAccount(a.accountName, a.password, a.email, result => {
      if (result === 1) {
        console.log(`account ${a.accountName} created successfully.`)
        console.log(a)
      } else console.log(require('steam-user').EResult[result])
    })
  }

  require('fs').writeFileSync('accounts.json', JSON.stringify(accounts))
})
