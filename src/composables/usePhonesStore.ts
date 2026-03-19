import { ref, computed } from "vue";
import type { Phone } from "../types/phones";

// API URL для JSON Server
const API_URL = "https://luxe-tech-server.onrender.com/phones";

// Состояние
const phones = ref<Phone[]>([]);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(8); // Сколько товаров на странице
const loading = ref(false);
const error = ref<string | null>(null);

// Состояние фильтров
const selectedBrands = ref<string[]>([]);
const selectedChips = ref<string[]>([]);
const priceRange = ref<[number, number]>([0, 2000]);
const maxPrice = ref(2000);

// Вычисляемое общее количество страниц
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

// Функция загрузки данных с сервера
const fetchPhones = async (
  page: number = currentPage.value,
  limit: number = pageSize.value,
) => {
  loading.value = true;
  error.value = null;

  try {
    const url = `${API_URL}?_page=${page}&_per_page=${limit}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }

    const responseData = await response.json();

    phones.value = responseData.phones;

    totalCount.value = responseData.items || 0;
  } catch (err: any) {
    error.value = err.message;
    console.error("Ошибка при загрузке телефонов:", err);
  } finally {
    loading.value = false;
  }
};

// Функция для смены страницы
const setPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchPhones(page);
};

// Получаем уникальные значения для фильтров (из уже загруженных данных)
const allBrands = computed(() => {
  if (!phones.value || phones.value.length === 0) return [];

  const brands = phones.value
    .map((p) => {
      const nameParts = p.name.split(" ");
      return nameParts[0] || "";
    })
    .filter((brand) => brand !== "");
  return [...new Set(brands)].sort();
});

const allChips = computed(() => {
  if (!phones.value || phones.value.length === 0) return [];

  const chips = phones.value.map((p) => {
    if (p.chip.includes("Snapdragon")) return "Snapdragon";
    if (p.chip.includes("A17") || p.chip.includes("A19"))
      return "Apple A-series";
    if (p.chip.includes("Tensor")) return "Google Tensor";
    return p.chip;
  });
  return [...new Set(chips)].sort();
});

// Фильтрация товаров (теперь фильтруем ТОЛЬКО загруженную страницу)
const filteredPhones = computed(() => {
  // Проверяем, что phones.value существует и является массивом
  if (!phones.value || !Array.isArray(phones.value)) {
    return [];
  }

  return phones.value.filter((phone: Phone) => {
    // Фильтр по цене
    if (
      phone.price < priceRange.value[0] ||
      phone.price > priceRange.value[1]
    ) {
      return false;
    }

    // Фильтр по бренду
    if (selectedBrands.value.length > 0) {
      const brand = phone.name.split(" ")[0] || "";
      if (!selectedBrands.value.includes(brand)) {
        return false;
      }
    }

    // Фильтр по процессору
    if (selectedChips.value.length > 0) {
      let chipCategory = "";
      if (phone.chip.includes("Snapdragon")) chipCategory = "Snapdragon";
      else if (phone.chip.includes("A17") || phone.chip.includes("A19"))
        chipCategory = "Apple A-series";
      else if (phone.chip.includes("Tensor")) chipCategory = "Google Tensor";
      else chipCategory = phone.chip;

      if (!selectedChips.value.includes(chipCategory)) {
        return false;
      }
    }

    return true;
  });
});

export function usePhonesStore() {
  return {
    // Данные и состояние
    phones,
    totalCount,
    currentPage,
    pageSize,
    totalPages,
    loading,
    error,

    // Фильтры
    selectedBrands,
    selectedChips,
    priceRange,
    maxPrice,

    // Опции для фильтров
    allBrands,
    allChips,

    // Отфильтрованные товары (уже с учётом фильтров)
    filteredPhones,

    // Методы для работы с данными
    fetchPhones,
    setPage,

    // Методы для фильтров
    toggleBrand: (brand: string) => {
      if (selectedBrands.value.includes(brand)) {
        selectedBrands.value = selectedBrands.value.filter((b) => b !== brand);
      } else {
        selectedBrands.value.push(brand);
      }
    },

    toggleChip: (chip: string) => {
      if (selectedChips.value.includes(chip)) {
        selectedChips.value = selectedChips.value.filter((c) => c !== chip);
      } else {
        selectedChips.value.push(chip);
      }
    },

    resetFilters: () => {
      selectedBrands.value = [];
      selectedChips.value = [];
      priceRange.value = [0, maxPrice.value];
    },
  };
}
