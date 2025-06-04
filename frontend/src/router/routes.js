// src/router/routes.js

const routes = [
  // Rute koje koriste MainLayout (tvoje postojeće rute)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('pages/HomePage.vue') },
      { path: 'volontiranje', name: 'volontiranje', component: () => import('pages/VolontiranjePage.vue') },
      { path: 'molitve', name: 'molitve', component: () => import('pages/MolitvePage.vue') },
      { path: 'citati', name: 'citati', component: () => import('pages/CitatiPage.vue') },
      { path: 'crkve', name: 'crkve', component: () => import('pages/CrkvePage.vue') },
      { path: 'login', name: 'login', component: () => import('pages/LoginPage.vue') }, // LoginPage koristi MainLayout
      { path: 'registracija', name: 'registracija', component: () => import('pages/RegistracijaPage.vue') } // RegistracijaPage koristi MainLayout
    ]
  },

  // NOVE RUTE KOJE KORISTE AdminLayout
  {
    path: '/admin', // Osnovna putanja za sve admin rute
    component: () => import('layouts/AdminLayout.vue'),
    // Ovdje ćemo kasnije dodati "route guard" za provjeru je li korisnik prijavljen
    // meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: { name: 'adminDashboard' } }, // Ako netko ode na /admin, preusmjeri na dashboard
      { path: 'dashboard', name: 'adminDashboard', component: () => import('pages/AdminDashboardPage.vue') },
      // Ovdje možeš dodati druge admin stranice
      // Npr. { path: 'volontiranje-manage', name: 'adminManageVolunteering', component: () => import('pages/AdminManageVolunteeringPage.vue') },
    ]
  },

  // Uvijek ostavi ovo kao zadnju rutu (404)
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes