const PATH = './comments/'
const DATA = '../steamdata.json'
const NAME = 'projectbluestreak'

const log = require('./src/logger.js')
require('console-stamp')(console, 'HH:MM:ss.l')

const fs = require('fs')

const KEY = require(DATA).main.apikey
const steamid = require('steamidconvert')(KEY)

// TODO: Stop being a lazy fuck and setup a database.
let comments = JSON.parse(fs.readFileSync(PATH + 'comments.json'))
let slimComments = JSON.parse(fs.readFileSync(PATH + 'comments-slim.json'))

let ids = []
for (let c of comments) { ids.push(c.id) }

const Group = require('./src/Group.js')
let group = new Group(NAME)

group.getComments(comment => add(comment))
setInterval(group.getComments, 10*60*1000, function(comment) {
  add(comment)
})

function add(comment) {
  if (ids.indexOf(comment.id) !== -1) {
    // TODO: Cancel all other callbacks, not like it's going to find
    //       any new comments after this is true.
    return log.warn(`Comment ${comment.id} already logged.`)
  }

  if (comment.author.vanityURL) {
    steamid.convertVanity(comment.author.vanityURL, (err, res) => {
      if (err) return log.error(`SteamIDConverter`, err)

      log.info(`Converted ${comment.author.vanityURL} to ${res}`)

      comment.author.id = res.toString(10)
      comments.push(comment)

      if (slimComments[comment.author.id]) {
        slimComments[comment.author.id]++
      } else slimComments[comment.author.id] = 1

      fs.writeFileSync(PATH + 'comments.json', JSON.stringify(comments))
      fs.writeFileSync(PATH + 'comments-slim.json', JSON.stringify(slimComments))
    })
  } else {
    comments.push(comment)
    fs.writeFileSync(PATH + 'comments.json', JSON.stringify(comments))
    fs.writeFileSync(PATH + 'comments-slim.json', JSON.stringify(slimComments))
  }

  log.info(`New comment ${comment.id} logged.`)
  ids.push(comment.id)
}
