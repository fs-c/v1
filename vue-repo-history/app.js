let URL = 'https://api.github.com/repos/'

function getQueryStrings() {
  let assoc  = {}
  let decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")) }
  let queryString = location.search.substring(1)
  let keyValues = queryString.split('&')

  for(let i in keyValues) {
    let key = keyValues[i].split('=')
    if (key.length > 1) {
      assoc[decode(key[0])] = decode(key[1])
    }
  }

  return assoc
}

const QS = getQueryStrings()

Vue.component('commit-item', {
	props: ['record'],
	template: `
		<a :href="record.html_url" class="list-group-item list-group-item-action flex-column align-items-start">
			<div class="d-flex w-100 justify-content-between">
	      <h5 class="mb-1">{{ record.commit.message }}</h5>
	      <small>{{ record.commit.author.date | formatDate }}</small>
    	</div>
			<p class="mb-1">by <a :href="record.committer.html_url">{{ record.commit.author.name }}</a></p>
    	<small>{{ record.sha.slice(0, 7) }}</small>
		</a>
	`, filters: {
		formatDate: function (v) {
			return moment(v).fromNow()
		}
	}
})

const app = new Vue({
	el: '#app',
	data: {
		loading: true,
		error: false,
		commits: [],
		amount: 6,
		link: 'LW2904/vue-repo-history'
	},
	created() {
		if (QS && QS.repo) {
			this.link = QS.repo
		} else console.log(`No query string provided.`)

		this.fetchData()
	},
	watch: {
		amount: 'fetchData'
	},
	filters: {
		extractName: function (v) {
			return v.slice(0, v.indexOf('/'))
		},
		extractRepo: function (v) {
			return v.slice(v.indexOf('/') + 1)
		}
	},
	methods: {
		fetchData: function () {
			this.loading = true
			this.error = false
			axios.get(URL + this.link + '/commits?per_page=' + this.amount + '&sha=').then(response => {
				console.log(`GitHub API returned ${response.status}`)
				this.loading = false
				if (response.status === 200) { this.commits = response.data }
					else {
						this.error = response.statusText
						setTimeout(this.fetchData, 10*1000)
					}
			})
		}
	}
})
