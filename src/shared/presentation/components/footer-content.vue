<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <footer class="doofplus-footer w-full p-5 mt-auto">
    <div class="flex flex-column md:flex-row justify-content-between gap-5 max-w-screen-xl mx-auto">

      <div class="flex flex-column gap-2 text-white">
        <h2 class="m-0 text-3xl font-bold">DoofPlus</h2>
        <p class="m-0 text-sm text-gray-400">{{ t('footer-content.copyright')}}</p>
      </div>

      <div class="flex flex-column md:flex-row gap-7">

        <!-- Columna Producto -->
        <div class="flex flex-column gap-3">
          <h4 class="m-0 text-lg font-semibold text-white">{{ t('footer-content.product', 'Product') }}</h4>
          <ul class="list-none p-0 m-0 flex flex-column gap-2 text-sm">
            <li>
              <a href="#features" class="text-gray-300 no-underline hover:text-white transition-colors">
                {{ t('footer-content.features', 'Features') }}
              </a>
            </li>
            <li>
              <a href="#pricing" class="text-gray-300 no-underline hover:text-white transition-colors">
                {{ t('footer-content.pricing', 'Pricing Plans') }}
              </a>
            </li>
            <li>
              <a href="#how-it-works" class="text-gray-300 no-underline hover:text-white transition-colors">
                {{ t('footer-content.howItWorks', 'How It Works') }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Columna Contacto -->
        <div class="flex flex-column gap-3">
          <h4 class="m-0 text-lg font-semibold text-white">{{ t('footer-content.contact', 'Contact') }}</h4>
          <ul class="list-none p-0 m-0 flex flex-column gap-2 text-sm text-gray-300">
            <li>doofplus.inges@gmail.com</li>
            <li>+51 (1) 234-5678</li>
            <li>Lima, Perú</li>
          </ul>
        </div>

      </div>
    </div>
  </footer>
</template>

<style scoped>
.doofplus-footer {
  background-color: #0F172A;
  font-family: 'Inter', sans-serif;
}
</style>