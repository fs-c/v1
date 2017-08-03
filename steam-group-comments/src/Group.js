// Always 50 comments per page, except final page.
// Comments: http://steamcommunity.com/groups/projectbluestreak/comments?content_only=true
// XML alternative: http://steamcommunity.com/comment/Clan/render/103582791437945007/-1/
const URL = [
	'http://steamcommunity.com/groups/',
	'/comments?content_only=true'
]

const request = require('request')
// TODO: Replace cheerio with a lighter alternative.
const cheerio = require('cheerio')

class Group {
	constructor(name) {
		this._url = URL[0] + name + URL[1]
	}

	getComments (callback) {
		request.cookie('Steam_Language=english')
	  request(this._url, (err, res, body) => {
	    if (err) {
	      callback(err)
	      return
	    }

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
}

module.exports = Group
