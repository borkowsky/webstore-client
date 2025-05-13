<script setup>
import {refreshNuxtData} from "#app";

const store = useAppStore()
const favoritesStore = useFavoritesStore()
const basketStore = useBasketStore()
const route = useRoute()
const {t} = useI18n()
const {formatTimeShort, declOfNum} = useMixins()
const {notify} = useNotification()
definePageMeta({
  validate: (route) => {
    return typeof route.params?.name === 'string'
  }
})
const productId = computed(() => getIdFromCanonicalUrl(route.params?.name?.toString()))
const page = ref(0)
const queryParams = computed(() => new URLSearchParams({
  "page": page.value.toString(),
  "sort": "id",
  "order": "desc",
  "product_id": productId.value.toString()
}).toString())
const {data: productData} = await useAsyncData('product', () => $api(`/products/${productId?.value}`)
    .catch(() => null))
const {data: reviewsData} = await useAsyncData('reviews', () => $api(`/reviews?${queryParams.value}`)
    .catch(() => null))
const {data: reviewImagesData} = await useAsyncData('review-images', () => $api(`/reviews/images?product_id=${productId?.value}`)
    .catch(() => null))
const {data: ratingsData} = await useAsyncData('ratings', () => $api(`/reviews/last-ratings?product_id=${productId?.value}`)
    .catch(() => null))
if (!productData?.value || getCanonicalUrl(productData.value?.payload) !== route.params.name) {
  await navigateTo("/")
}
const product = computed(() => productData?.value?.payload)
const reviews = computed(() => reviewsData?.value?.payload)
const reviewImages = computed(() => reviewImagesData?.value?.payload)
const reviewsPages = computed(() => reviewsData?.value?.pages)
const ratings = computed(() => ratingsData?.value?.payload)
const {data: rootCategoryData} = productData?.value?.payload?.category?.category_id ?
    await useAsyncData('root-category', () => $api(`/categories/${product?.value?.category?.category_id}`)) : ref({
      data: null
    })
const rootCategory = computed(() => rootCategoryData?.value?.payload)

onBeforeMount(() => {
  store.setTitle(product?.value?.name)
  useHead({
    title: product?.value?.name
  })
})

const breadcrumbItems = computed(() => ([...rootCategory?.value?.id ? [{
  title: rootCategory?.value?.name,
  path: `/category/${getCanonicalUrl(rootCategory?.value)}`,
}] : [], {
  title: product?.value?.category?.name,
  path: `/category/${getCanonicalUrl(product?.value?.category)}`,
}, {
  title: product?.value?.name,
  path: ''
}]))
const currentImage = ref(null)
currentImage.value = product.value?.images?.[0]
const tabs = ref([{
  title: t('details'),
  value: 'details'
}, {
  title: t('reviews.title'),
  value: 'reviews'
}])
const currentTab = ref('details')
const basketMode = ref(false)
const basketAmount = ref(1)
const basketAdded = ref(false)

watch(queryParams, () => {
  refreshNuxtData('reviews').finally(() => {
    scrollToReviews()
  })
})

const addFavorite = () => {
  favoritesStore.addFavorite(product?.value?.id).then(() => {
    notify({
      type: 'success',
      title: t('success'),
      text: t('addFavoriteSuccess')
    })
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('addFavoriteError')
    })
  })
}
const addBasket = () => {
  if (!product.value?.id || basketStore.isBasket(+product.value.id)) return
  basketStore.addBasket(product.value.id, basketAmount.value).then(() => {
    notify({
      type: 'success',
      title: t('success'),
      text: t('addBasketSuccess')
    })
    basketAdded.value = true
    setTimeout(() => {
      basketMode.value = false
    }, 1500)
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('addBasketError')
    })
  })
}
const removeFavorite = () => {
  if (!product?.value?.id ||
      !favoritesStore.isFavorite(product.value.id)) return false
  const favoriteId = favoritesStore.getFavoriteId(+product.value?.id)
  if (!favoriteId) return false
  favoritesStore.removeFavorite(favoriteId).then(() => {
    notify({
      type: 'success',
      title: t('success'),
      text: t('removeFavoriteSuccess')
    })
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('removeFavoriteError')
    })
  })
}
const scrollToReviews = () => {
  currentTab.value = 'reviews'
  nextTick(() => {
    document.getElementById('_info_container').scrollIntoView({})
  })
}
const toPage = (p) => {
  page.value = p - 1
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
          <div v-for="(image, idx) in product?.images || []"
               :key="`product-image-${idx}`"
               :class="currentImage===image ? 'active' : ''"
               @click="currentImage=image"
          >
            <img :src="image" :alt="product?.name"/>
          </div>
        </div>
      </div>
      <div class="product_details_container">
        <NuxtLink v-if="product?.brand"
                  :to="`/brand/${getCanonicalUrl(product.brand)}`"
                  class="product_brand">
          <div class="image">
            <img :src="product?.brand?.image" :alt="product?.brand?.name">
          </div>
          <div class="name">
            {{ product?.brand?.name }}
          </div>
        </NuxtLink>
        <div class="product_name">
          {{ product?.name }}
        </div>
        <div class="product_rating" @click="scrollToReviews">
          {{ t('rating') }} {{ product?.rating?.toFixed(1) }}
          <Icon name="solar:star-bold-duotone" class="text-yellow-600 leading-none text-lg -mt-1"/>
        </div>
        <div class="product_price">
          ${{ product?.price?.toFixed(2) }}
        </div>
        <div class="product_tags">
          <div
              v-for="(tag, idx) in product?.tags || []"
              :key="`tag-${idx}`"
          >
            <Icon name="hugeicons:tag-01" class="text-sm"/>
            {{ tag }}
          </div>
        </div>
        <div class="product_actions">
          <div v-if="basketMode" class="flex flex-1 items-center gap-2">
            <input v-model.number="basketAmount"
                   type="number"
                   :placeholder="t('amount')"
                   :disabled="basketAdded"
                   style="padding-top:1rem;padding-bottom:1rem;"
                   class="w-2/3">
            <button :class="basketAdded ? 'success pointer-events-none' : ''"
                    class="large"
                    @click.stop="addBasket"
            >
              <Icon :name="basketAdded ? 'solar:cart-check-bold-duotone' : 'solar:cart-plus-line-duotone'" class="text-3xl leading-none -my-0.5" />
              {{ t('add') }}
            </button>
            <div class="cancel-button w-14"
                 @click.stop="basketMode=false"
            >
              <Icon name="hugeicons:cancel-01" />
            </div>
          </div>
          <template v-else>
            <button v-if="basketStore.isBasket(product.id)" disabled class="large flex-1">
              <Icon name="solar:cart-check-bold-duotone"/>
              {{ t('inCart') }}
            </button>
            <button v-else class="flex-1 large" @click="basketMode=true">
              <Icon name="solar:cart-plus-line-duotone"/>
              {{ t('addToCart') }}
            </button>
          </template>
          <button class="favorites_button flat large"
                  :class="favoritesStore.isFavorite(+product?.id) ? 'active' : ''"
                  @click="favoritesStore.isFavorite(+product?.id) ? removeFavorite() : addFavorite()">
            <Icon :name="favoritesStore.isFavorite(+product?.id) ? 'solar:heart-bold' : 'solar:heart-linear'"/>
          </button>
        </div>
        <div class="flex items-center gap-2 text-sm -mt-2 px-6">
          <Icon name="hugeicons:delivery-truck-02" class="text-lg leading-none"/>
          {{ t('freeDelivery') }}
        </div>
      </div>
    </div>
    <div id="_info_container" class="mt-6 flex flex-col gap-6">
      <div class="product_tabs">
        <div
            v-for="(tab, idx) in tabs"
            :key="`product-tab-${idx}`"
            class="tab"
            :class="currentTab===tab.value ? 'active' : ''"
            @click="currentTab=tab.value"
        >
          {{ tab.title }}
          <sup v-if="tab.value === 'reviews'">
            {{ reviewsData?.total || 0 }}
          </sup>
        </div>
      </div>
      <div v-if="currentTab==='details'" class="product_tab_container">
        <div class="flex-1 text-xl font-bold">
          {{ t('about') }}
        </div>
        <div class="flex-[3]">
          {{ product?.description }}
        </div>
      </div>
      <div v-else-if="currentTab==='reviews'" class="product_tab_container">
        <div class="flex-[2] w-full max-w-[66.66%]">
          <div v-if="reviewImages.length" class="review_images_list">
            <div v-for="(image, idx) in reviewImages"
                 :key="`review-images-item-${idx}`"
            >
              <img :src="image" :alt="`review-images-item-img-${idx}`">
            </div>
          </div>
          <div v-if="reviews.length" class="product_reviews">
            <div v-for="item in reviews"
                 :key="`review-${item.id}`"
                 class="item"
            >
              <div class="item_heading">
                <div class="item_image">
                  <Icon name="solar:user-circle-bold-duotone"/>
                </div>
                <div class="flex flex-col">
                  <div class="item_rating">
                    <Rating readonly :val="item.rating"/>
                  </div>
                  <div class="item_heading_details">
                  <span>
                    {{ item.user?.username }}
                  </span>
                    <Icon name="ri:checkbox-blank-circle-fill" class="text-xs"/>
                    <span>
                    {{ formatTimeShort(item.createdAt) }}
                  </span>
                  </div>
                </div>
              </div>
              <div v-if="item.images.length" class="item_images">
                <div v-for="(image, idx) in item.images"
                     :key="`review-item-${item.id}-image-${idx}`"
                >
                  <img :src="image" :alt="`review-${item.id}-image-${idx}`">
                </div>
              </div>
              <div class="item_content">
                {{ item.text }}
              </div>
            </div>
          </div>
          <EmptyPlaceholder v-else>
            <template #icon>
              <Icon name="solar:chat-line-bold-duotone"/>
            </template>
            <div>
              {{ t('reviews.empty') }}
            </div>
          </EmptyPlaceholder>
          <Pagination v-if="reviewsPages > 1"
                      :pages="reviewsPages"
                      :current-page="page + 1"
                      class="mt-6"
                      @to-page="toPage" />
        </div>
        <div class="flex-1 shrink-0">
          <div class="text-3xl font-bold">
            {{ product.rating }} / 5
          </div>
          <div class="mt-4">
            <Rating readonly :val="product.rating" :size="34"/>
          </div>
          <div class="rating_bars_container" v-if="ratings">
            <div v-for="(key, idx) in Object.keys(ratings.ratings).reverse()"
                 :key="`ratings-bar-${idx}`"
                 class="flex items-center gap-2">
              <div class="rating_label">
                {{ key }}
                <Icon name="solar:star-bold-duotone" class="text-accent-500" />
              </div>
              <div class="rating_bar">
                <div class="rating_bar_filled"
                     :style="`width: ${ratings.total ? Math.ceil(ratings.ratings[key] / (ratings.total / 100)) : 0}%`"/>
              </div>
              <div class="rating_label" :class="ratings.ratings[key] > 0 ? '' : 'text-primary-400'">
                {{ ratings.ratings[key] }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
