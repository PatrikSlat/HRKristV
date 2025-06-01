<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Navigacijska traka (Header) -->
    <q-header elevated>
      <q-toolbar>
        <!-- Hamburger gumb - vidljiv samo na manjim ekranima -->
        <q-btn
          v-if="$q.screen.lt.md"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        />

        <!-- Logotip -->
        <q-avatar class="q-ml-sm cursor-pointer" @click="navigateToHome">
          <img src="~assets/logo.png" alt="HRKrist Logo" />
        </q-avatar>

        <!-- Naslov aplikacije - klikabilan, vodi na početnu -->
        <q-toolbar-title class="q-ml-sm cursor-pointer gt-xs" @click="navigateToHome">
          HRKrist
        </q-toolbar-title>

        <q-space />

        <!-- Poveznice na stranice - vidljive samo na većim ekranima -->
        <div v-if="$q.screen.gt.sm" class="row items-center no-wrap">
          <q-btn flat :to="{ name: 'home' }" icon="home" label="Početna" />
          <q-btn flat :to="{ name: 'volontiranje' }" icon="volunteer_activism" label="Volontiranje" />
          <q-btn flat :to="{ name: 'molitve' }" icon="self_improvement" label="Molitve" />
          <q-btn flat :to="{ name: 'citati' }" icon="menu_book" label="Biblijski citati" />
          <q-btn flat :to="{ name: 'crkve' }" icon="church" label="Crkve" />
          <div class="q-mx-sm"></div>
          <q-btn flat :to="{ name: 'login' }" icon="login" label="Prijava" />
          <q-btn flat :to="{ name: 'registracija' }" icon="person_add" label="Registracija" />
        </div>

        <!-- Alternativni prikaz za manje ekrane (ali ne xs) -->
        <div v-if="$q.screen.lt.md && $q.screen.gt.xs" class="row items-center no-wrap">
            <q-btn flat :to="{ name: 'login' }" icon="login" aria-label="Prijava" />
            <q-btn flat :to="{ name: 'registracija' }" icon="person_add" aria-label="Registracija" />
        </div>
      </q-toolbar>
    </q-header>

    <!-- Bočna ladica (Drawer) -->
    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      :width="250"
      class="bg-secondary-drawer"
      v-if="$q.screen.lt.md"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item-label header class="text-drawer-header">Navigacija</q-item-label>

          <q-item clickable v-ripple :to="{ name: 'home' }" @click="closeDrawer" class="text-drawer-item">
            <q-item-section avatar>
              <q-icon name="home" class="icon-drawer-item" />
            </q-item-section>
            <q-item-section>Početna</q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ name: 'volontiranje' }" @click="closeDrawer" class="text-drawer-item">
            <q-item-section avatar>
              <q-icon name="volunteer_activism" class="icon-drawer-item" />
            </q-item-section>
            <q-item-section>Volontiranje</q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ name: 'molitve' }" @click="closeDrawer" class="text-drawer-item">
            <q-item-section avatar>
              <q-icon name="self_improvement" class="icon-drawer-item" />
            </q-item-section>
            <q-item-section>Molitve</q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ name: 'citati' }" @click="closeDrawer" class="text-drawer-item">
            <q-item-section avatar>
              <q-icon name="menu_book" class="icon-drawer-item" />
            </q-item-section>
            <q-item-section>Biblijski citati</q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ name: 'crkve' }" @click="closeDrawer" class="text-drawer-item">
            <q-item-section avatar>
              <q-icon name="church" class="icon-drawer-item" />
            </q-item-section>
            <q-item-section>Crkve</q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <q-item clickable v-ripple :to="{ name: 'login' }" @click="closeDrawer" class="text-drawer-item">
            <q-item-section avatar>
              <q-icon name="login" class="icon-drawer-item" />
            </q-item-section>
            <q-item-section>Prijava</q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ name: 'registracija' }" @click="closeDrawer" class="text-drawer-item">
            <q-item-section avatar>
              <q-icon name="person_add" class="icon-drawer-item" />
            </q-item-section>
            <q-item-section>Registracija</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Glavni sadržaj stranice -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'MainLayout'
})

const $q = useQuasar()
const router = useRouter()
const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function closeDrawer() {
  if ($q.screen.lt.md) {
    leftDrawerOpen.value = false
  }
}

function navigateToHome() {
  router.push({ name: 'home' })
  closeDrawer()
}
</script>

<style lang="scss" scoped>
.cursor-pointer {
  cursor: pointer;
}

.q-toolbar .q-btn {
  margin-left: 2px;
  margin-right: 2px;
}

// Koristimo Sass breakpoint varijablu
@media (max-width: $breakpoint-sm-max) {
  // Nema specifičnih stilova ovdje trenutno, ali media query je tu
}

// Stilovi za drawer
.bg-secondary-drawer {
  background-color: $secondary;
}

.text-drawer-header {
  color: $dark;
}

.text-drawer-item {
  color: $dark;
  .q-item__section--main {
    color: inherit;
  }
}

.icon-drawer-item {
  color: $primary;
}
</style>