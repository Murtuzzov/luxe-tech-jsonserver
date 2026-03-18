<template>
  <main class="container mx-auto px-4 py-8">
    <!-- Hero Section -->
    <HeroSection />

    <div class="flex gap-8 mt-8">
      <!-- Фильтры (ПК) -->
      <div class="hidden md:block w-64 shrink-0">
        <FiltersSidebar />
      </div>

      <!-- Каталог -->
      <div class="flex-1">
        <!-- Заголовок -->
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-semibold">Лучшие Флагманы</h2>

          <!-- Фильтры на мобилке -->
          <button
            @click="isMobileFiltersOpen = true"
            class="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
          >
            <Filter class="w-4 h-4" />
            Фильтры
            <span
              v-if="activeFiltersCount > 0"
              class="bg-electric-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ activeFiltersCount }}
            </span>
          </button>

          <!-- Кнопка битвы (ПК) -->
          <button
            @click="$emit('openBattle')"
            class="hidden md:flex items-center gap-2 bg-electric-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <Swords class="w-4 h-4" />
            Битва ({{ battlePhones.length }})
          </button>
        </div>

        <!-- Состояния загрузки и ошибок -->
        <div v-if="loading" class="text-center py-12">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-electric-blue border-t-transparent"
          ></div>
          <p class="mt-4 text-gray-500">Загрузка товаров...</p>
        </div>

        <div v-else-if="error" class="text-center py-12">
          <p class="text-red-500">Ошибка: {{ error }}</p>
          <button
            @click="fetchPhones()"
            class="mt-4 px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-blue-700 transition"
          >
            Попробовать снова
          </button>
        </div>

        <!-- Сетка товаров -->
        <ul
          v-else-if="filteredPhones.length > 0"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <li v-for="phone in filteredPhones" :key="phone.id" class="list-none">
            <ProductCard :phone="phone" />
          </li>
        </ul>

        <!-- Если ничего не найдено после фильтров -->
        <div v-else class="text-center py-12">
          <p class="text-gray-500">Товары не найдены</p>
        </div>

        <!-- Пагинация -->
        <div
          v-if="!loading && !error && totalPages > 1"
          class="flex justify-center items-center gap-2 mt-8"
        >
          <button
            @click="setPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            ←
          </button>

          <button
            v-for="page in totalPages"
            :key="page"
            @click="setPage(page)"
            class="px-3 py-1 border rounded-lg transition"
            :class="
              currentPage === page
                ? 'bg-electric-blue text-white border-electric-blue'
                : 'hover:bg-gray-50'
            "
          >
            {{ page }}
          </button>

          <button
            @click="setPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            →
          </button>
        </div>
      </div>
    </div>

    <!-- Мобильные фильтры -->
    <div v-if="isMobileFiltersOpen" class="fixed inset-0 z-50 md:hidden">
      <!-- Затемнение -->
      <div
        class="fixed inset-0 bg-black/50"
        @click="isMobileFiltersOpen = false"
      ></div>

      <!-- Панель фильтров -->
      <div
        class="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
      >
        <!-- Ручка -->
        <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3"></div>

        <!-- Заголовок -->
        <div class="flex items-center justify-between p-6 pb-2">
          <h3 class="text-xl font-semibold">Фильтры</h3>
          <button
            @click="isMobileFiltersOpen = false"
            class="p-2 hover:bg-gray-100 rounded-full"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Контент фильтров -->
        <div class="px-6 pb-6">
          <FiltersSidebar />
        </div>

        <!-- Кнопки действий -->
        <div
          class="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3"
        >
          <button
            @click="handleResetFilters"
            class="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Сбросить
          </button>
          <button
            @click="isMobileFiltersOpen = false"
            class="flex-1 bg-electric-blue text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import HeroSection from "../components/ui/HeroSection.vue";
import FiltersSidebar from "../components/ui/FiltersSidebar.vue";
import ProductCard from "../components/ui/ProductCard.vue";
import { Swords, Filter, X } from "lucide-vue-next";
import { usePhonesStore } from "../composables/usePhonesStore";
import { useBattleStore } from "../composables/useBattleStore";

const {
  filteredPhones,
  selectedBrands,
  selectedChips,
  priceRange,
  maxPrice,
  resetFilters,
  loading,
  error,
  currentPage,
  totalPages,
  fetchPhones,
  setPage,
} = usePhonesStore();

const { battlePhones } = useBattleStore();

const isMobileFiltersOpen = ref(false);

const activeFiltersCount = computed(() => {
  let count = 0;
  count += selectedBrands.value.length;
  count += selectedChips.value.length;
  if (priceRange.value[0] > 0) count++;
  if (priceRange.value[1] < maxPrice.value) count++;
  return count;
});

// Функция для сброса фильтров и закрытия
const handleResetFilters = () => {
  resetFilters();
  isMobileFiltersOpen.value = false;
};

// Загружаем первую страницу при монтировании компонента
onMounted(() => {
  fetchPhones();
});

defineEmits<{
  (e: "openBattle"): void;
}>();
</script>
