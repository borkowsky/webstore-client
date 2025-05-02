<script setup>
import {navigateTo} from "#app";

const store = useAppStore()
const favoritesStore = useFavoritesStore()
const route = useRoute()
const {t} = useI18n()
definePageMeta({
  validate: (route) => {
    return typeof route.params.name === 'string'
  }
})
const productId = computed(() => getIdFromCanonicalUrl(route.params?.name?.toString()))
const {data: productData} = await useAsyncData('product', () => $api(`/products/${productId.value}`).catch(() => null))
if (!productData?.value) {
  await navigateTo("/")
}
const product = computed(() => productData.value?.payload)
const {data: rootCategoryData} = productData.value?.payload?.category?.category_id ?
    await useAsyncData('root-category', () => $api(`/categories/${product.value?.category?.category_id}`)) : ref({
      data: null
    })
const rootCategory = computed(() => rootCategoryData.value?.payload)

onBeforeMount(() => {
  store.setTitle(product.value?.name)
  useHead({
    title: product.value?.name
  })
})

const breadcrumbItems = computed(() => ([... rootCategory.value?.id ? [{
  title: rootCategory.value?.name,
  path: `/category/${getCanonicalUrl(rootCategory.value)}`,
}] : [], {
  title: product.value?.category?.name,
  path: `/category/${getCanonicalUrl(product.value?.category)}`,
}, {
  title: product.value?.name,
  path: ''
}]))
const currentImage = ref(null)
const tabs = ref([{
  title: t('details'),
  value: 'details'
}, {
  title: t('reviews'),
  value: 'reviews'
}])
const currentTab = ref('details')

const addFavorite = () => {
  if (!product?.value?.id) return false
  favoritesStore.addFavorite(product.value?.id).then(console.log).catch(console.error)
}
</script>

<template>
  <section>
    <div class="mb-6">
      <Breadcrumbs :items="breadcrumbItems"/>
    </div>
    <div class="product_container">
      <div class="product_images_container">
        <div class="product_image_main">
          <Transition name="slide">
            <img :src="currentImage || product?.images[0]" :alt="product?.name">
          </Transition>
        </div>
        <div class="product_images_selector">
          <div
            v-for="(image, idx) in product?.images || []"
            :key="`product-image-${idx}`"
            @click="currentImage=image"
          >
            <img :src="image" :alt="product?.name" />
          </div>
        </div>
      </div>
      <div class="product_details_container">
        <div class="product_brand">
          <div class="image">
            <img :src="product?.brand?.image" :alt="product?.brand?.name">
          </div>
          <div class="name">
            {{ product?.brand?.name }}
          </div>
        </div>
        <div class="product_name">
          {{ product?.name }}
        </div>
        <div class="product_rating">
          {{ t('rating') }} {{ product?.rating?.toFixed(1) }}
        </div>
        <div class="product_price">
          ${{ product?.price?.toFixed(2) }}
        </div>
        <div class="product_tags">
          <div
            v-for="(tag, idx) in product?.tags || []"
            :key="`tag-${idx}`"
          >
            <Icon name="hugeicons:tag-01" class="text-sm" />
            {{ tag }}
          </div>
        </div>
        <div class="product_actions">
          <button class="flex-1 large">
            {{ t('addToCart') }}
          </button>
          <button class="flat large text-secondary-600 hover:text-red-600" @click="addFavorite">
            <Icon name="solar:heart-linear" class="text-3xl leading-none" />
          </button>
        </div>
        <div class="flex items-center gap-2 text-sm -mt-2">
          <Icon name="hugeicons:delivery-truck-02" class="text-lg leading-none" />
          {{ t('freeDelivery') }}
        </div>
      </div>
    </div>
    <div class="mt-6 flex flex-col gap-6">
      <div class="tabs">
        <div
          v-for="(tab, idx) in tabs"
          :key="`product-tab-${idx}`"
          class="tab"
          :class="currentTab===tab.value ? 'active' : ''"
          @click="currentTab=tab.value"
        >
          {{ tab.title }}
        </div>
      </div>
      <div v-if="currentTab==='details'">
        {{ product?.description }}
      </div>
      <div v-else-if="currentTab==='reviews'">
<!--        todo: reviews-->
       reviews here
      </div>
    </div>
  </section>
</template>
