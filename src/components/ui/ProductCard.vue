<template>
  <div
    class="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-glass hover:shadow-lg transition-shadow"
  >
    <!-- Фото (кликабельное) -->
    <router-link :to="`/product/${phone.id}`">
      <div
        class="aspect-square bg-white rounded-lg md:rounded-xl mb-2 md:mb-3 overflow-hidden flex items-center justify-center p-4"
      >
        <img
          :src="phone.image"
          :alt="phone.name"
          class="w-3/4 h-3/4 object-contain"
          @error="handleImageError"
          loading="lazy"
        />
      </div>
    </router-link>

    <!-- Порядковый номер товара (для проверки пагинации) -->
    <div class="text-xs text-gray-400 mb-1">#{{ phone.id }}</div>

    <!-- Название и цена (название кликабельное) -->
    <router-link :to="`/product/${phone.id}`">
      <h3
        class="font-medium text-sm md:text-lg mb-0.5 md:mb-1 line-clamp-1 hover:text-electric-blue transition"
      >
        {{ phone.name }}
      </h3>
    </router-link>
    <div class="text-base md:text-xl font-semibold mb-2 md:mb-3">
      {{ formatPrice(phone.price) }}
    </div>

    <!-- Мини-иконки -->
    <div
      class="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600 mb-3 md:mb-4 md:flex-nowrap"
    >
      <div class="flex items-center gap-1 min-w-0">
        <Cpu class="w-3 h-3 md:w-4 md:h-4 shrink-0" />
        <span class="truncate">{{ phone.chip }}</span>
      </div>
      <div class="flex items-center gap-1 min-w-0">
        <Smartphone class="w-3 h-3 md:w-4 md:h-4 shrink-0" />
        <span class="truncate">{{ phone.display }}</span>
      </div>
      <div class="flex items-center gap-1 min-w-0">
        <Battery class="w-3 h-3 md:w-4 md:h-4 shrink-0" />
        <span class="truncate">{{ phone.battery }} мАч</span>
      </div>
    </div>

    <!-- Кнопки -->
    <div class="flex items-center gap-2">
      <!-- Кнопка В корзину -->
      <button
        @click="addToCart(phone)"
        class="flex-1 bg-electric-blue text-white py-1.5 md:py-2 px-2 md:px-3 rounded-lg text-xs md:text-sm font-medium hover:bg-blue-700 transition whitespace-nowrap"
      >
        В корзину
      </button>

      <!-- Кнопка В битву -->
      <button
        @click="toggleBattle"
        class="p-1.5 md:p-2 border rounded-lg transition shrink-0"
        :class="
          isInBattle(phone.id)
            ? 'bg-electric-blue border-electric-blue text-white'
            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
        "
      >
        <Swords
          class="w-3 h-3 md:w-4 md:h-4"
          :class="isInBattle(phone.id) ? 'text-white' : 'text-gray-600'"
        />
      </button>

      <!-- Кнопка В избранное -->
      <button
        @click="toggleFavorite(phone)"
        class="p-1.5 md:p-2 border rounded-lg transition shrink-0"
        :class="
          isFavorite(phone.id)
            ? 'bg-red-500 border-red-500 text-white'
            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
        "
      >
        <Heart
          class="w-3 h-3 md:w-4 md:h-4"
          :class="isFavorite(phone.id) ? 'text-white' : 'text-gray-600'"
          :fill="isFavorite(phone.id) ? 'white' : 'none'"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Cpu, Smartphone, Battery, Swords, Heart } from "lucide-vue-next";
import { useBattleStore } from "../../composables/useBattleStore";
import { useCartStore } from "../../composables/useCartStore";
import { useFavoritesStore } from "../../composables/useFavoritesStore";

const props = defineProps<{
  phone: {
    id: number;
    name: string;
    price: number;
    chip: string;
    display: string;
    battery: number;
    camera: number;
    image: string;
  };
}>();

const { addToBattle, isInBattle } = useBattleStore();
const { addToCart } = useCartStore();
const { toggleFavorite, isFavorite } = useFavoritesStore();

const toggleBattle = () => {
  addToBattle(props.phone);
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
