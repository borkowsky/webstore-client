<script setup lang="ts">
const store = useAppStore()
const route = useRoute()
const {t} = useI18n()
const id = computed(() => getIdFromCanonicalUrl(route.params?.name as string))
const {data: brandData} = await useAsyncData("brand", () => $api(`/brands/${id.value}`))
const brand = computed(() => brandData.value?.payload)
if (!brand.value || getCanonicalUrl(brand.value) !== route.params.name as string) {
  await navigateTo("/")
}
store.setTitle(brand.value.name)
useHead({
  title: brand.value.name
})

const selectedCategory: Ref<any> = ref(null)
const page: Ref<number> = ref(0)
const productsQueryParams = computed(() => new URLSearchParams({
  "page": page.value.toString(),
  "brand_id": brand.value.id.toString(),
  "category_id": (selectedCategory.value?.id || -1).toString()
}).toString())
const {data: categoriesData} = await useAsyncData("categories",
    () => $api(`/brands/${id.value}/categories`)
        .catch(() => null))
const {data: productsData} = await useAsyncData("products",
    () => $api(`/products?${productsQueryParams.value}`)
        .catch(() => null))
const categories = computed(() => categoriesData.value?.payload)
const products = computed(() => productsData.value?.payload)
const pagesTotal = computed(() => productsData.value?.pages)

watch(productsQueryParams, () => {
  refreshNuxtData("products").finally(() => {
    scrollElementsToTop()
  })
})

const scrollElementsToTop = () => {
  document.querySelectorAll('.scrolling_page_container').forEach((el: any) => {
    el.scrollTop = 0
  })
}
const toPage = (p: number) => {
  page.value = p - 1
}
</script>

<template>
  <div class="page_sectioned_container">
    <div class="side_menu">
      <div class="heading">
        {{t('categories')}}
      </div>
      <div v-if="categories?.length" class="side_menu_list">
        <div v-for="item in categories"
             :key="`product-category-${item.id}`"
             class="cursor-pointer"
             :class="selectedCategory?.id===item?.id ? 'active' : ''"
             @click="selectedCategory=item"
        >
          <Icon :name="item.icon || 'hugeicons:folder-01'" class="font-bold"/>
          {{ item.name }}
        </div>
      </div>
      <div v-else class="px-6">
        {{ t('empty') }}
      </div>
    </div>
    <section>
      <div class="scrolling_page_container">
        <div class="page-heading sticky-heading">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 flex items-center justify-center mb-4">
              <img v-if="brand?.image"
                   :src="brand.image"
                   class="w-full h-full object-contain"
                   :alt="brand?.name">
            </div>
            <h1>
              {{ brand?.name }}
            </h1>
          </div>
        </div>
        <div v-if="selectedCategory" class="flex items-center gap-2 mb-4">
          {{ t('category') }}:
          <strong>
            {{ selectedCategory.name }}
          </strong>
          <div role="button"
               class="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-red-500/10 rounded"
               @click="selectedCategory=null"
          >
            <Icon name="hugeicons:cancel-01" />
          </div>
        </div>
        <div v-if="products?.length" class="grid_list">
          <ProductCard
              v-for="item in products"
              :key="`product-${item.id}`"
              :item="item" />
        </div>
        <EmptyPlaceholder v-else>
          <template #icon>
            <Icon name="solar:cart-bold-duotone" />
          </template>
          <div>
            {{ t('emptyList') }}
          </div>
        </EmptyPlaceholder>
        <Pagination v-if="pagesTotal > 1"
                    :pages="pagesTotal"
                    :current-page="page + 1"
                    class="mt-6"
                    @to-page="toPage" />
      </div>
    </section>
  </div>
</template>
