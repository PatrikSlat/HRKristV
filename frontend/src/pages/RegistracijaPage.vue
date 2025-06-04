<template>
  <q-page padding class="flex flex-center bg-grey-2 registration-page">
    <q-card class="registration-card shadow-5" style="width: 100%; max-width: 500px;">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6 text-center">Prijava za Organizatora</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-form @submit.prevent="handleFormSubmit" @reset="onReset" ref="registrationFormRef" class="q-gutter-sm">
          <q-input
            outlined
            v-model="formData.nazivUdruge"
            label="Naziv udruge/organizacije *"
            lazy-rules
            :rules="[val => !!val || 'Naziv udruge je obavezan']"
          />

          <q-input
            outlined
            v-model="formData.oibUdruge"
            label="OIB udruge *"
            lazy-rules
            :rules="[
              val => !!val || 'OIB je obavezan',
              val => val && val.length === 11 || 'OIB mora imati 11 znamenki',
              val => /^\d+$/.test(val) || 'OIB smije sadržavati samo brojeve'
            ]"
          />

          <q-input
            outlined
            v-model="formData.kontaktOsoba"
            label="Kontakt osoba *"
            lazy-rules
            :rules="[val => !!val || 'Kontakt osoba je obavezna']"
          />

          <q-input
            outlined
            type="email"
            v-model="formData.email"
            label="Email adresa *"
            lazy-rules
            :rules="[
              val => !!val || 'Email je obavezan',
              val => /.+@.+\..+/.test(val) || 'Unesite ispravan email'
            ]"
          />

          <q-input
            outlined
            type="tel"
            v-model="formData.telefon"
            label="Broj telefona"
          />

          <q-input
            outlined
            v-model="formData.poruka"
            type="textarea"
            label="Kratka poruka"
            autogrow
          />

          <div style="position: absolute; left: -5000px;" aria-hidden="true">
            <input type="text" name="extra-field-honeypot" v-model="formData.honeypot" tabindex="-1" autocomplete="off" />
          </div>

          <div class="q-mt-lg">
            <q-btn label="Pošalji Prijavu" type="submit" color="primary" class="full-width" size="lg"/>
            <q-btn label="Očisti" type="reset" color="primary" flat class="q-mt-sm full-width" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'RegistracijaPage',
  setup() {
    const registrationFormRef = ref(null);

    const formData = ref({
      nazivUdruge: '',
      oibUdruge: '',
      kontaktOsoba: '',
      email: '',
      telefon: '',
      poruka: '',
      honeypot: '',
    });

    const URL = "http://localhost:3000/api/registracija-zahtjev/organizator";

    async function handleFormSubmit() {
      const isValid = await registrationFormRef.value.validate();
      if (!isValid) {
        console.log("Forma nije validna, korisnik treba ispraviti greške.");
        return;
      }

      if (formData.value.honeypot) {
        console.log('Neko botuje formu !');
        onReset();
        return;
      }
      try {
        await axios.post(URL, {
          nazivUdruge: formData.value.nazivUdruge,
          oibUdruge: formData.value.oibUdruge,
          kontaktOsoba: formData.value.kontaktOsoba,
          email: formData.value.email,
          telefon: formData.value.telefon,
          poruka: formData.value.poruka
        });
        onReset();
      } catch (error) {
        console.error('Greška slanje:', error);
      }
    }

    function onReset() {
      formData.value = {
        nazivUdruge: '',
        oibUdruge: '',
        kontaktOsoba: '',
        email: '',
        telefon: '',
        poruka: '',
        honeypot: '',
      };
      if (registrationFormRef.value) {
        registrationFormRef.value.resetValidation();
      }
    }

    return {
      formData,
      handleFormSubmit,
      onReset,
      registrationFormRef,
    };
  },
});
</script>
