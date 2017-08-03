const PATH = './comments/'
const NAME = 'projectbluestreak'

require('console-stamp')(console, 'HH:MM:ss.l')

const fs = require('fs')

const KEY = require('../../steamdata.json').main.apikey
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
    return console.log(`Comment ${comment.id} already logged.`)
  }

  if (comment.author.vanityURL) {
    steamid.convertVanity(comment.author.vanityURL, (err, res) => {
      if (err) return

      console.log(`Converted ${comment.author.vanityURL} to ${res}`)

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

  console.log(`New comment ${comment.id} logged.`)
  ids.push(comment.id)
}
