<template>
  <q-page class="home-page q-pa-none bg-secondary">
    <section class="main-image-section">
      <q-img
        src="~assets/home_slika.png"
        alt="HRKrist Glavna Slika"
        :ratio="16/9"
        style="width: 100%; height: 40vh; display: block;"
        fit="cover"
      >
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-negative text-white">
            Nije moguće učitati glavnu sliku.
          </div>
        </template>
      </q-img>
    </section>

    <section class="news-section q-py-xl q-px-md">
      <div class="container">
        <div class="row justify-center">
          <div class="col-12 text-center">
            <h2 class="section-title text-h3 text-primary q-mb-lg">
              <q-icon name="feed" class="q-mr-sm" /> Najnovije Vijesti
            </h2>
            <q-separator spaced="lg" style="max-width: 150px; margin: 0 auto 40px auto;" color="primary" size="3px" />
          </div>
        </div>

        <div class="row q-col-gutter-xl justify-center">
          <div
            v-for="item in newsItems"
            :key="item.id"
            class="col-12 col-sm-6 col-md-4 flex"
          >
            <q-card class="news-card full-width" flat bordered v-ripple @click="openArticle(item.link)">
              <q-img :src="item.image || defaultNewsImage" :ratio="16/9" class="news-card-image">
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-grey-4 text-grey-8">
                    Slika nije dostupna
                  </div>
                </template>
              </q-img>

              <q-card-section class="q-pa-md">
                <div class="text-h6 news-title ellipsis-2-lines q-mb-sm">{{ item.title }}</div>
              </q-card-section>

              <q-card-actions align="right" class="q-pt-none q-pb-sm q-px-sm">
                <q-btn flat dense color="primary" label="Detaljnije" icon-right="arrow_forward" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineOptions({
  name: 'HomePage'
})

const defaultNewsImage = ref('')
const newsItems = ref([])

function openArticle(url) {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}


async function fetchNews() {
  try {
    const response = await fetch('https://newsdata.io/api/1/latest?apikey=pub_9ac77689fb1e4d0da5425805e0b564e6&q=crkva&language=hr')
    const data = await response.json()
    newsItems.value = (data.results || []).slice(0, 6).map((item, idx) => ({
      id: idx + 1,
      title: item.title || 'Naslov nije dostupan',
      link: item.link || '#',
      image: item.image_url
    }))
  } catch (error) {
    console.error('Greška kod fetchanja vijesti:', error)
    newsItems.value = []
  }
}

onMounted(async () => {
  try {
    const imageUrl = await import('../assets/default-news-image.png')
    defaultNewsImage.value = imageUrl.default
  } catch (e) {
    console.warn('Nije moguće učitati default-news-image.png iz assets.', e)
    defaultNewsImage.value = 'https://via.placeholder.com/400x225.png?text=Slika+Nije+Dostupna'
  }
  fetchNews()
})
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.main-image-section {
  position: relative;
}

.main-image-caption {
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  h1 {
    font-size: 3.5rem;
    letter-spacing: 1px;
     @media (max-width: $breakpoint-sm-max) {
        font-size: 2.8rem;
      }
      @media (max-width: $breakpoint-xs-max) {
        font-size: 2.2rem;
      }
  }
  p {
    font-size: 1.4rem;
    @media (max-width: $breakpoint-sm-max) {
      font-size: 1.1rem;
    }
  }
}
</style>
