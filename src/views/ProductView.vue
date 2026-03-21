<template>
  <main class="container mx-auto px-4 py-8">
    <!-- Кнопка назад -->
    <router-link
      to="/"
      class="inline-flex items-center gap-2 text-gray-600 hover:text-electric-blue mb-6 transition"
    >
      ← Назад в каталог
    </router-link>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="text-center py-12">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-electric-blue border-t-transparent"
      ></div>
      <p class="mt-4 text-gray-500">Загрузка товара...</p>
    </div>

    <!-- Если товар не найден -->
    <div
      v-else-if="!phone"
      class="text-center py-12 bg-white rounded-2xl shadow-glass"
    >
      <h2 class="text-xl text-gray-600">Товар не найден</h2>
      <router-link
        to="/"
        class="inline-block mt-4 text-electric-blue hover:underline"
      >
        Вернуться в каталог
      </router-link>
    </div>

    <!-- Карточка товара -->
    <div v-else class="bg-white rounded-3xl p-6 md:p-8 shadow-glass">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Левая колонка - фото (полностью) -->
        <div>
          <div
            class="aspect-square bg-white rounded-2xl overflow-hidden flex items-center justify-center"
          >
            <img
              :src="phone.image"
              :alt="phone.name"
              class="w-full h-full object-contain"
              @error="handleImageError"
              loading="lazy"
            />
          </div>
        </div>

        <!-- Правая колонка - информация -->
        <div>
          <!-- Название и цена -->
          <h1 class="text-3xl md:text-4xl font-semibold mb-2">
            {{ phone.name }}
          </h1>
          <div class="text-2xl md:text-3xl font-bold text-electric-blue mb-6">
            {{ formatPrice(phone.price) }}
          </div>

          <!-- Характеристики (сетка) -->
          <div class="space-y-4 mb-8">
            <div class="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
              <span class="text-gray-500">Процессор</span>
              <span class="font-medium text-right">{{ phone.chip }}</span>
            </div>
            <div class="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
              <span class="text-gray-500">Дисплей</span>
              <span class="font-medium text-right">{{ phone.display }}</span>
            </div>
            <!-- Память (новая строка) -->
            <div class="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
              <span class="text-gray-500">Память</span>
              <span class="font-medium text-right">{{ phone.memory }}</span>
            </div>
            <div class="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
              <span class="text-gray-500">Камера</span>
              <span class="font-medium text-right">{{ phone.camera }} МП</span>
            </div>
            <div class="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
              <span class="text-gray-500">Батарея</span>
              <span class="font-medium text-right"
                >{{ phone.battery }} мАч</span
              >
            </div>
          </div>

          <!-- Кнопки действий -->
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="addToCart(phone)"
              class="flex-1 bg-electric-blue text-white py-3 px-6 rounded-xl text-lg font-medium hover:bg-blue-700 transition"
            >
              В корзину
            </button>
            <button
              @click="toggleBattle"
              class="flex-1 border-2 border-electric-blue text-electric-blue py-3 px-6 rounded-xl text-lg font-medium hover:bg-electric-blue hover:text-white transition flex items-center justify-center gap-2"
              :class="{ 'bg-electric-blue text-white': isInBattle(phone.id) }"
            >
              <Swords class="w-5 h-5" />
              {{ isInBattle(phone.id) ? "В битве" : "В битву" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Swords } from "lucide-vue-next";
import { useBattleStore } from "../composables/useBattleStore";
import { useCartStore } from "../composables/useCartStore";
import { usePhonesStore } from "../composables/usePhonesStore";
import type { Phone } from "../types/phones";

const route = useRoute();
const { addToBattle, isInBattle } = useBattleStore();
const { addToCart } = useCartStore();
const { getPhoneById, loading } = usePhonesStore();

const phone = ref<Phone | null>(null);

// Загружаем телефон по ID из URL
onMounted(async () => {
  const id = Number(route.params.id);
  phone.value = await getPhoneById(id);
});

const toggleBattle = () => {
  if (phone.value) {
    addToBattle(phone.value);
  }
};

const formatPrice = (price: number) => {
  return "$" + new Intl.NumberFormat("en-US").format(price);
};

// Обработка ошибки загрузки изображения
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = "/images/placeholder.jpg";
};
</script>
