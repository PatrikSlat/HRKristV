<template>
  <q-page padding>
    <div class="q-gutter-md q-mb-md">
      <div class="text-h5 q-mb-md">Popis svih volontiranja</div>
      <q-card v-for="dogadaj in dogadaji" :key="dogadaj.ID_dogadaja" class="my-card q-mb-md">
        <q-card-section>
          <div class="text-h6">{{ dogadaj.naziv_dogadaja }}</div>
          <div class="text-subtitle2">Organizator: {{ dogadaj.username_org }}</div>
          <div class="q-mt-xs text-caption">Lokacija: {{ dogadaj.lokacija }}</div>
          <div class="q-mt-xs text-caption">Kontakt: {{ dogadaj.kontakt }}</div>
          <div class="q-mt-sm">{{ dogadaj.opis }}</div>
        </q-card-section>
      </q-card>
      <div v-if="dogadaji.length === 0" class="text-caption text-grey-7">Nema dostupnih događaja.</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const dogadaji = ref([]);

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/dogadaji');
    dogadaji.value = res.data;
  } catch (err) {
    dogadaji.value = [];
    console.error('Greška kod dohvata događaja:', err);
  }
});
</script>

<style scoped>
.my-card {
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}
</style>
