const totp = require('steam-totp')

const shasec = process.env.SHASEC

totp.getTimeOffset((err, off, lat) => {
  if (err) return console.error('err: ' + err)

  console.log(`offset of ${off} with ${lat} delay`)

  totp.getAuthCode(shasec, (err, code, off, lat) => {
    if (err) return console.error('err: ' + err)    
    
    console.log(`code ${code} with ${lat} delay`)
  })
})