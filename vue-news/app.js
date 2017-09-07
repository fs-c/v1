// LW 6/24

Vue.component('news-item', {
  props: ['article'],
  template: `
    <div class="col-md-4">
      <div class="card" @click="openTab(article.url)">
        <img class="card-img-top img-fluid" :src="article.urlToImage">
        <div class="card-block">
          <h5 class="card-title">{{ article.title }}</h5>
          <p class="card-text author">{{ article.author }}<span></span></p>
          <p class="card-text">{{ article.description }}</p>
        </div>
      </div>
    </div>
  `,
  methods: {
    openTab(url) {
      window.open(url, '_self', false)
    }
  }
})

Vue.component('news-items', {
  props: ['articles'],
  template: `
    <div class="container">
      <div class="row">
        <news-item v-for="article in articles"
                   :article="article"
                   :key="article.id">
        </news-item>
      </div>
    </div>
  `
})

const app = new Vue({
  el: '#app',
  data: {
    loading: true,
    source: 'the-wall-street-journal',
    sources: [
      'the-wall-street-journal',
      'the-new-york-times',
      'recode',
      'the-verge',
      'polygon',
      'ign'
    ],
    apiKey: '693f65ceb70b4fa3a80ff6a02deab88c',
    articles: [],
    size: 'col-md-4'
  },
  mounted() {
    this.getArticles()
  },
  methods: {
    getArticles() {
      this.loading = true
      let url = 'https://newsapi.org/v1/articles?source=' + this.source +
                '&sortBy=top&apiKey=' + this.apiKey

      axios.get(url).then(response => {
        this.loading = false
        this.articles = response.data.articles
        console.log(response)
      }).catch(error => console.log(error));
    }
  }
})
