<template>
  <q-page
    padding
    class="flex flex-center column bg-secondary"
    style="min-height: calc(100vh - 100px);"
  >
    <h4 class="text-h4 text-primary q-mb-lg text-center page-title">
      Riječ za Danas
    </h4>

    <q-card
      class="quote-card shadow-8"
      flat
      bordered
      style="max-width: 700px; width: 90%;"
    >
      <q-card-section class="q-pa-xl text-center">
        <q-icon name="format_quote" color="accent" size="3rem" class="q-mb-md" />

        <blockquote class="text-h5 text-weight-light q-mb-md quote-text">
          {{ verseText}}
        </blockquote>

        <div
          v-if="bookName"
          class="text-subtitle1 text-primary text-weight-medium q-mt-lg source-text"
        >
          {{ bookName }} {{ chapter }}:{{ verse }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="center" class="q-pa-md bg-grey-1">
        <q-btn
          flat
          color="primary"
          label="Novi Citat"
          icon="refresh"
          @click="fetchRandomVerse"
          :loading="loading"
        />
        <q-btn
          outline
          color="primary"
          label="Čitajte Bibliju Online"
          icon-right="launch"
          href="https://biblija.ks.hr/"
          target="_blank"
          rel="noopener noreferrer"
          class="q-ml-md"
        />
      </q-card-actions>
    </q-card>

    <q-inner-loading :showing="loadingInitial">
      <q-spinner-gears size="60px" color="primary" />
    </q-inner-loading>

    <q-banner v-if="error" inline-actions class="text-white bg-negative q-mt-lg" style="max-width: 700px; width: 90%;">
      <template v-slot:avatar>
        <q-icon name="error_outline" />
      </template>
      Dogodila se greška: {{ error }}
    </q-banner>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

defineOptions({
  name: 'CitatiPage'
});

const verseText = ref("");
const bookName = ref("");
const chapter = ref("");
const verse = ref("");
const loading = ref(false);
const loadingInitial = ref(true);
const error = ref(null);

async function fetchRandomVerse() {
  if (!loadingInitial.value) {
    loading.value = true;
  }
  error.value = null;
  verseText.value = "";
  bookName.value = "";
  chapter.value = "";
  verse.value = "";

  try {
    const response = await axios.get("http://localhost:3000/api/random/test");
    const { random_verse } = response.data;

    verseText.value = random_verse.text;
    bookName.value = random_verse.book;
    chapter.value = random_verse.chapter;
    verse.value = random_verse.verse;
  } catch (err) {
    console.error("Error fetching verse:", err);
    error.value = err.message || "Nije moguće dohvatiti citat.";
  } finally {
    loading.value = false;
    loadingInitial.value = false;
  }
}

onMounted(() => {
  fetchRandomVerse();
});
</script>

<style lang="scss" scoped>
.page-title {
  font-family: 'Georgia', serif;
}

.quote-card {
  border-radius: 12px;
}

.quote-text {
  font-style: italic;
  line-height: 1.6;
  color: $grey-9;
  min-height: 100px;
}

.source-text {
  opacity: 0.9;
}

.q-banner {
  border-radius: $generic-border-radius;
}
</style>