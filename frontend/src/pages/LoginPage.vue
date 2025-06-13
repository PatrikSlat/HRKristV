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

          <!-- reCAPTCHA widget -->
          <div class="q-mt-md flex flex-center">
            <div ref="recaptcha"></div>
          </div>

          <div class="q-mt-lg">
            <q-btn
              label="Prijava"
              type="submit"
              color="primary"
              class="full-width"
              size="lg"
              :disable="!recaptchaToken"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
const API = import.meta.env.PROD
  ? 'https://hrkristv.onrender.com/api'
  : 'http://localhost:3000/api';

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const username = ref('');
const password = ref('');
const recaptchaToken = ref('');
const loginFormRef = ref(null);
const recaptcha = ref(null);
const router = useRouter();

const recaptchaSiteKey = '6LcHG14rAAAAAC0OGkLyXUJvaEQLpEQZu2aK2u-v';
const API_LOGIN_URL = process.env.NODE_ENV === 'production'
  ? '/api/auth/login/organizator'
  : 'http://localhost:3000/api/auth/login/organizator';

onMounted(() => {
  recaptchaToken.value = '';
  if (window.grecaptcha && recaptcha.value) {
    window.grecaptcha.render(recaptcha.value, {
      sitekey: recaptchaSiteKey,
      callback: function(token) {
        recaptchaToken.value = token;
      }
    });
  }
});

async function handleLogin() {
  const isValid = await loginFormRef.value.validate();
  if (!isValid || !recaptchaToken.value) {
    alert("Morate potvrditi da niste robot!");
    return;
  }

  try {
    const response = await axios.post(API_LOGIN_URL, {
      username: username.value,
      password: password.value,
      recaptchaToken: recaptchaToken.value,
    });

    localStorage.setItem('jwt_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    router.push({ name: 'adminDashboard' });
    // Reset recaptcha
    if (window.grecaptcha) {
      window.grecaptcha.reset();
    }
    recaptchaToken.value = '';
  } catch (error) {
    if (error.response) {
      alert(error.response.data.message || 'Greška prilikom prijave!');
    } else {
      alert('Neuspjela prijava!');
    }
    // Reset recaptcha na error
    if (window.grecaptcha) {
      window.grecaptcha.reset();
    }
    recaptchaToken.value = '';
    console.error('Greška prilikom prijave:', error);
  }
}
</script>
