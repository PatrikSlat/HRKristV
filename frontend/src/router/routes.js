// src/router/routes.js

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Postavi HomePage.vue kao zadanu stranicu za '/' putanju
      { path: '', name: 'home', component: () => import('pages/HomePage.vue') },

      // Ostale stranice
      { path: 'volontiranje', name: 'volontiranje', component: () => import('pages/VolontiranjePage.vue') },
      { path: 'molitve', name: 'molitve', component: () => import('pages/MolitvePage.vue') },
      { path: 'citati', name: 'citati', component: () => import('pages/CitatiPage.vue') }, // Pretpostavka da ćeš dodati i ovu stranicu
      { path: 'crkve', name: 'crkve', component: () => import('pages/CrkvePage.vue') },
      { path: 'login', name: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'registracija', name: 'registracija', component: () => import('pages/RegistracijaPage.vue') }
    ]
  },

  // Uvijek ostavi ovo kao zadnju rutu,
  // za hvatanje svih nepostojećih putanja (404 stranica)
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes