<template>
  <q-page padding>
    <div class="q-pa-md">
      <p>Ovdje možete dodavati događaje volontiranja!</p>
      <p>Hvala Vam na suradnji!</p>
      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-input
          filled
          v-model="form.naziv_dogadaja"
          label="Naziv događaja"
          required
        />
        <q-input
          filled
          v-model="form.opis"
          label="Opis događaja"
          type="textarea"
          required
        />
        <q-input
          filled
          v-model="form.lokacija"
          label="Lokacija"
          required
        />
        <q-btn label="Dodaj događaj" type="submit" color="primary" />
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const form = ref({
  naziv_dogadaja: '',
  opis: '',
  lokacija: ''
});

async function onSubmit() {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      alert('Niste prijavljeni!');
      return;
    }
    const payload = {
      naziv_dogadaja: form.value.naziv_dogadaja,
      opis: form.value.opis,
      lokacija: form.value.lokacija
    };
    await axios.post('http://localhost:3000/api/dogadaji', payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    alert('Događaj uspješno dodan!');
    form.value = {
      naziv_dogadaja: '',
      opis: '',
      lokacija: ''
    };
  } catch (error) {
    alert(
      error?.response?.data?.message ||
      'Greška prilikom dodavanja događaja!'
    );
    console.error(error);
  }
}
</script>
