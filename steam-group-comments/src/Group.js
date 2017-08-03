// Always 50 comments per page, except final page.
// Comments: http://steamcommunity.com/groups/ *custom url* /comments?content_only=true
// XML alternative: http://steamcommunity.com/comment/Clan/render/ *group id* /-1/
const URL = [
	'http://steamcommunity.com/groups/',
	'/comments?content_only=true'
]

const log = require('winston')

const request = require('request')
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

	    log.info(`Got comments.`)
	    const $ = cheerio.load(body)

	    $('.commentthread_comment_content').each((i, el) => {
	      let author = {}
	      let date
	      let text
	      let id

				let _author = $(el).children('.commentthread_comment_author')
				let _text = $(el).children('.commentthread_comment_text')

				author.name = $(_author).children('a').text().trim()
				author.href = $(_author).children('a').attr('href')

				date = new Date(
					$(_author).children('.commentthread_comment_timestamp').attr('title')
				)

				text = $(_text).text().trim()
				id = $(_text).attr('id').slice(16)

	      // If vanityURL not set (yay), save the SteamID64 of the author.
	      if (author.href.indexOf('/profiles/') === -1) {
	        author.vanityURL = author.href.slice(author.href.indexOf('/id/') + 4)
	      } else author.id = author.href.slice(author.href.indexOf('/profiles/') + 10)

	      callback({ id, author, date, text })
	    })
	  })
	}
}

module.exports = Group
