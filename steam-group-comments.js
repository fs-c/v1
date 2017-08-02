// Always 50 comments per page, except final page.
// XML alternative: http://steamcommunity.com/comment/Clan/render/103582791437945007/-1/
const URL = 'http://steamcommunity.com/groups/projectbluestreak/comments?content_only=true'
const PATH = './comments/'

require('console-stamp')(console, 'HH:MM:ss.l')

const request = require('request')
// TODO: Replace cheerio with a lighter alternative and figure out native moment substitute.
const cheerio = require('cheerio')
const moment = require('moment')

const fs = require('fs')

const KEY = require('../steamdata.json').main.apikey
const steamid = require('steamidconvert')(KEY)

// TODO: Stop being a lazy fuck and setup a database.
let comments = JSON.parse(fs.readFileSync(PATH + 'comments.json'))
let slimComments = JSON.parse(fs.readFileSync(PATH + 'comments-slim.json'))

let ids = []
for (let c of comments) { ids.push(c.id) }

function getComments(callback) {
  // TODO: Force english response via cookies.
  request(URL, (err, res, body) => {
    if (err) throw err

    console.log(`Got comments.`)
    const $ = cheerio.load(body)

    $('.commentthread_comment_content').each((i, el) => {
      let author = {}
      let date
      let text
      let id

      author.name = $(el)
        .children('.commentthread_comment_author')
        .children('a')
        .text().trim()

      author.href = $(el)
        .children('.commentthread_comment_author')
        .children('a')
        .attr('href')

      date = new Date(
        $(el)
          .children('.commentthread_comment_author')
          .children('.commentthread_comment_timestamp')
          .attr('title')
      )

      text = $(el)
        .children('.commentthread_comment_text')
        .text().trim()

      id = $(el)
        .children('.commentthread_comment_text')
        .attr('id').slice(16)

      // If vanityURL not set (yay), save the SteamID64 of the author.
      if (author.href.indexOf('/profiles/') === -1) {
        author.vanityURL = author.href.slice(author.href.indexOf('/id/') + 4)
      } else author.id = author.href.slice(author.href.indexOf('/profiles/') + 10)

      callback({
        id,
        author,
        date,
        text
      })
    })
  })
}

getComments(comment => add(comment))
setInterval(getComments, 10*60*1000, function(comment) {
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
