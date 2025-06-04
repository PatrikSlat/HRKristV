<template>
  <q-page padding class="flex flex-center bg-grey-2 login-page">
    <q-card class="login-card shadow-5" style="width: 100%; max-width: 400px;">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6 text-center">Prijava Organizatora</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-form @submit.prevent="handleLogin" ref="loginFormRef" class="q-gutter-sm">
          <q-input
            outlined
            v-model="username"
            label="Korisničko ime"
            lazy-rules
            :rules="[val => !!val || 'Korisničko ime je obavezno']"
            autocomplete="username"
          />

          <q-input
            outlined
            type="password"
            v-model="password"
            label="Lozinka"
            lazy-rules
            :rules="[val => !!val || 'Lozinka je obavezna']"
            autocomplete="current-password"
          />

          <div class="q-mt-lg">
            <q-btn
              label="Prijava"
              type="submit"
              color="primary"
              class="full-width"
              size="lg"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const username = ref('');
const password = ref('');
const loginFormRef = ref(null);
const router = useRouter();

const API_LOGIN_URL = process.env.NODE_ENV === 'production'
  ? '/api/auth/login/organizator'
  : 'http://localhost:3000/api/auth/login/organizator';

async function handleLogin() {
  const isValid = await loginFormRef.value.validate();
  if (!isValid) {
    return;
  }

  try {
    const response = await axios.post(API_LOGIN_URL, {
      username: username.value,
      password: password.value,
    });

    localStorage.setItem('jwt_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    router.push({ name: 'adminDashboard' });

  } catch (error) {
    if (error.response) {
      alert(error.response.data.message || 'Greška prilikom prijave!');
    } else {
      alert('Neuspjela prijava!');
    }
    console.error('Greška prilikom prijave:', error);
  }
}
</script>
