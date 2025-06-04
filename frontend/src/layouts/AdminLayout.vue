<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-deep-purple-7 text-white">
      <q-toolbar>
        <q-btn flat dense round icon="admin_panel_settings" aria-label="Admin Panel" />
        <q-toolbar-title>
          HRKrist - Organizator
        </q-toolbar-title>
        <q-btn flat label="Odjava" @click="logout" icon-right="logout" />
      </q-toolbar>
    </q-header>

    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'AdminLayout',
  setup() {
    const router = useRouter();

    function logout() {
      console.log('Korisnik odjavljen (simulacija)');
      router.push({ name: 'login' });
    }

    return {
      logout
    };
  }
});
</script>
