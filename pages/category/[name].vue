<script setup lang="ts">

const store = useAppStore()
const route = useRoute()
const {t} = useI18n()
const id = computed(() => getIdFromCanonicalUrl(route.params.name?.toString() || ''))
const page: Ref<number> = ref(0)
const queryParams = computed(() => new URLSearchParams({
  "page": page.value.toString(),
  "category_id": id.value.toString(),
  "sort": "id",
  "orders": "desc"
}).toString())
const { data: categoryData } = await useAsyncData('category', () => $api(`/categories/${id.value}`).catch(() => null))
const { data: productsData } = await useAsyncData('products', () => $api(`/products?${queryParams.value}`).catch(() => null))
const { data: brandsData } = await useAsyncData("brands", () => $api(`/brands?product_category_id=${id.value}`).catch(() => null))
const category = computed(() => categoryData?.value?.payload || null)
const products = computed(() => productsData?.value?.payload || [])
const brands = computed(() => brandsData?.value?.payload || [])
const pagesTotal = computed(() => productsData.value?.pages as number)
if (!category.value) {
  await navigateTo("/")
}
store.setTitle(category.value?.name)
useHead({
  title: category.value?.name,
})

watch(queryParams, () => {
  refreshNuxtData('products').finally(() => {
    scrollElementsToTop()
  })
})

const scrollElementsToTop = () => {
  document.querySelectorAll('.page_content').forEach((el: any) => {
    el.scrollTop = 0
  })
}
const toPage = (p: number) => {
  page.value = p - 1
}
</script>

<template>
  <section>
    <div class="page-heading sticky-heading">
      <h1>
        {{ category?.name }}
      </h1>
    </div>
    <div v-if="brands.length" class="brands_list mb-4">
      <div v-for="brand in brands"
           :key="`brand-${brand.id}`"
           class="list_item">
        <div class="item_image">
          <img :src="brand.image" :alt="brand.name">
        </div>
        <div class="item_content">
          {{ brand.name }}
        </div>
      </div>
    </div>
    <div class="grid_list" v-if="products.length">
      <ProductCard
          v-for="item in products"
          :key="`popular-item-${item.id}`"
          :item="item" />
    </div>
    <EmptyPlaceholder v-else>
      <template #icon>
        <Icon name="solar:cart-3-bold-duotone" />
      </template>
      <div>
        {{ t('productsNotFound') }}
      </div>
    </EmptyPlaceholder>
    <Pagination v-if="pagesTotal > 1"
                :pages="pagesTotal"
                :current-page="page + 1"
                class="mt-6"
                @to-page="toPage" />
  </section>
</template>
