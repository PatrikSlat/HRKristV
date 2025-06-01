<template>
  <q-page class="home-page q-pa-none"> <!-- q-pa-none da uklonimo defaultni padding od q-page -->
    <!-- 1. Glavna Slika Ispod Navigacije -->
    <section class="main-image-section">
      <q-img
        src="~assets/home_slika.png"
        alt="HRKrist Glavna Slika"
        :ratio="16/9"
        style="width: 100%; height: 40vh; display: block;"
      >
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-negative text-white">
            Nije moguće učitati glavnu sliku.
          </div>
        </template>
        <!-- Opcionalno: Ako želiš neki suptilni tekst preko ove slike, možeš ga dodati ovdje -->
        <!--
        <div class="absolute-bottom text-subtitle1 text-center q-pa-sm" style="background-color: rgba(0,0,0,0.5)">
          HRKrist - Mjesto zajedništva i vjere
        </div>
        -->
      </q-img>
    </section>

    <!-- Opcionalno: Mali razmak između slike i kartica -->
    <div class="q-my-md"></div>

    <!-- 2. Sekcija s Vijestima (Kartice) -->
    <section class="news-section q-px-md q-pb-md"> <!-- Dodan padding samo za ovu sekciju -->
      <h2 class="text-h2 text-center q-mb-xl text-primary">Najnovije Vijesti</h2>

      <div class="row q-col-gutter-lg justify-center">
        <div
          v-for="item in newsItems"
          :key="item.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card class="news-card cursor-pointer" @click="openArticle(item.link)" v-ripple>
            <q-img :src="defaultNewsImage" :ratio="16/9">
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-4 text-grey-8">
                  Slika nije dostupna
                </div>
              </template>
            </q-img>

            <q-card-section>
              <div class="text-h6 news-title ellipsis-2-lines">{{ item.title }}</div>
            </q-card-section>
          </q-card>
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

// Ref za defaultnu sliku vijesti
const defaultNewsImage = ref('')

// Mock podaci za vijesti - sve kartice će imati isti naslov
const newsItems = ref([
  { id: 1, title: 'Aktualne vijesti iz zajednice', link: 'https://example.com/vijest1' },
  { id: 2, title: 'Aktualne vijesti iz zajednice', link: 'https://example.com/vijest2' },
  { id: 3, title: 'Aktualne vijesti iz zajednice', link: 'https://example.com/vijest3' },
  { id: 4, title: 'Aktualne vijesti iz zajednice', link: 'https://example.com/vijest4' },
  { id: 5, title: 'Aktualne vijesti iz zajednice', link: 'https://example.com/vijest5' },
  { id: 6, title: 'Aktualne vijesti iz zajednice', link: 'https://example.com/vijest6' },
])

// Funkcija za otvaranje linka članka
function openArticle(url) {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

// Postavljanje defaultne slike koristeći dinamički import za Vite
onMounted(async () => {
  try {
    const imageUrl = await import('../assets/default-news-image.png') // Pobrini se da ova datoteka postoji!
    defaultNewsImage.value = imageUrl.default
  } catch (e) {
    console.warn('Nije moguće učitati default-news-image.png iz assets. Provjerite putanju i da li datoteka postoji.', e);
    defaultNewsImage.value = 'https://via.placeholder.com/400x225.png?text=Slika+Nije+Dostupna'
  }
})

</script>

<style lang="scss" scoped>



.news-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-8;
  }
}

.news-title {
  min-height: 3em;
  line-height: 1.5em;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>