<template>
  <q-page class="crkve-page">
    <div class="map-container">
      <l-map
        ref="mapRef"
        :zoom="mapZoom"
        :center="mapCenter"
        :options="{ scrollWheelZoom: true, zoomControl: true }"
        style="height: 100%; width: 100%; z-index: 0;"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
          :attribution="osmAttribution"
        ></l-tile-layer>

        <l-marker
          v-for="crkva in crkve"
          :key="crkva.id"
          :lat-lng="[crkva.lat, crkva.lng]"
          @click="panToMarker(crkva)"
        >
          <l-popup :options="{ offset: [0, -25] }">
            <div class="text-subtitle2 q-mb-xs">{{ crkva.naziv }}</div>
            <div class="text-caption">{{ crkva.adresa }}</div>
          </l-popup>
          <l-tooltip :options="{ offset: [0, -15], permanent: false, direction: 'top' }">
            {{ crkva.naziv }}
          </l-tooltip>
        </l-marker>

        <l-marker v-if="userLocation" :lat-lng="userLocation" :icon="userLocationIcon">
          <l-tooltip>Vaša lokacija</l-tooltip>
        </l-marker>

      </l-map>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, markRaw } from 'vue';
import axios from 'axios';
import "leaflet/dist/leaflet.css";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LTooltip,
} from "@vue-leaflet/vue-leaflet";
import L from 'leaflet'; // Importaj Leaflet za L.Icon i L.latLngBounds

defineOptions({
  name: 'CrkvePage'
});

// Rješavanje problema s defaultnim ikonicama za Leaflet u Vite/Webpack okruženju
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const mapRef = ref(null); // Referenca na Leaflet mapu
const mapZoom = ref(8); // Početni zoom
const mapCenter = ref([45.1, 15.5]); // Početni centar (otprilike centar Hrvatske)
const osmAttribution = '© <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors';
const crkve = ref([]);
const loading = ref(true);
const userLocation = ref(null); // [lat, lng] za lokaciju korisnika
let userLocationIcon = null; // Custom ikonica za lokaciju korisnika

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api';

async function fetchCrkve() {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/crkve`);
    crkve.value = response.data;
    console.log('Dohvaćene crkve:', crkve.value);

    if (crkve.value.length > 0 && mapRef.value && mapRef.value.leafletObject) {
        const bounds = L.latLngBounds(crkve.value.map(c => [c.lat, c.lng]));
        if (bounds.isValid()) {
            mapRef.value.leafletObject.flyToBounds(bounds, { padding: [50, 50] });
        }
    }
  } catch (error) {
    console.error("Greška pri dohvaćanju podataka o crkvama:", error);
  } finally {
    loading.value = false;
  }
}

function panToMarker(crkva) {
  if (mapRef.value && mapRef.value.leafletObject) {
    mapRef.value.leafletObject.flyTo([crkva.lat, crkva.lng], 15, {
      animate: true,
      duration: 1
    });
  }
}

onMounted(() => {
  if (L && L.icon) {
    userLocationIcon = markRaw(L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      shadowSize: [41, 41],
    }));
  }
  fetchCrkve();
});
</script>

<style lang="scss" scoped>
.crkve-page {
  height: calc(100vh - 50px - 50px);
  display: flex;
  flex-direction: column;
}

.map-container {
  flex-grow: 1;
  width: 100%;
  overflow: hidden;
}


:global(.leaflet-popup-content-wrapper) {
  border-radius: 8px !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15) !important;
}
:global(.leaflet-popup-content) {
  margin: 12px !important;
  font-size: 14px;
  line-height: 1.6;
}
</style>