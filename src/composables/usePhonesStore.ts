import { ref, computed } from "vue";
import type { Phone } from "../types/phones";

// API URL для Render
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
    
    // Универсальная обработка ответа от JSON Server
    if (Array.isArray(responseData)) {
      // Вариант 1: пришел прямой массив (JSON Server 0.x или простая настройка)
      phones.value = responseData;
      
      // Пытаемся получить общее количество из заголовка X-Total-Count
      const totalCountHeader = response.headers.get('X-Total-Count');
      if (totalCountHeader) {
        totalCount.value = parseInt(totalCountHeader);
      } else {
        // Если заголовка нет, используем длину массива (но это не точно для пагинации)
        totalCount.value = responseData.length;
        console.warn('X-Total-Count header not found, using array length');
      }
    } 
    else if (responseData && typeof responseData === 'object') {
      // Вариант 2: пришел объект с данными (JSON Server 1.x)
      if (responseData.data && Array.isArray(responseData.data)) {
        phones.value = responseData.data;
        totalCount.value = responseData.items || responseData.data.length;
      }
      // Вариант 3: другой объектный формат
      else {
        // Проверяем, может быть это сам объект с телефонами в другом поле
        const possibleDataFields = ['phones', 'items', 'results'];
        let foundData = false;
        
        for (const field of possibleDataFields) {
          if (responseData[field] && Array.isArray(responseData[field])) {
            phones.value = responseData[field];
            totalCount.value = responseData.total || responseData[field].length;
            foundData = true;
            break;
          }
        }
        
        if (!foundData) {
          console.error("Не удалось распознать формат ответа:", responseData);
          phones.value = [];
          totalCount.value = 0;
        }
      }
    }
    else {
      console.error("Неожиданный формат ответа:", responseData);
      phones.value = [];
      totalCount.value = 0;
    }
    
    // Для отладки - посмотрим, что получили
    console.log('Загружено телефонов:', phones.value.length);
    console.log('Всего товаров:', totalCount.value);
    
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

// Функция для получения одного телефона по ID (пригодится для ProductView)
const getPhoneById = async (id: number): Promise<Phone | null> => {
  try {
    // Сначала ищем в уже загруженных
    const localPhone = phones.value.find(p => p.id === id);
    if (localPhone) return localPhone;
    
    // Если не нашли, грузим с сервера
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Ошибка при загрузке телефона:', err);
    return null;
  }
};

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
    getPhoneById, // новый метод

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
