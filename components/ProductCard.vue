<script setup lang="ts">
const favoritesStore = useFavoritesStore()
const basketStore = useBasketStore()
const { notify } = useNotification()
const {t} = useI18n()
const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => ({})
  }
})
const {item} = toRefs(props)
const renderKey: Ref<number> = ref(0)
const addMode: Ref<boolean> = ref(false)
const amount: Ref<number> = ref(1)
const basketAddSuccess: Ref<boolean> = ref(false)

onMounted(() => {
  renderKey.value++
})

const addFavorite = (): void => {
  if (!item.value?.id || favoritesStore.isFavorite(+item.value.id)) return
  favoritesStore.addFavorite(item.value.id).then(() => {
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
const addBasket = (): void => {
  if (!item.value?.id || basketStore.isBasket(+item.value.id)) return
  basketStore.addBasket(item.value.id, amount.value).then(() => {
    notify({
      type: 'success',
      title: t('success'),
      text: t('addBasketSuccess')
    })
    basketAddSuccess.value = true
    setTimeout(() => {
      addMode.value = false
    }, 1500)
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('addBasketError')
    })
  })
}
</script>

<template>
  <div class="grid_item">
    <NuxtLink :to="`/item/${getCanonicalUrl(item)}`" class="flex flex-col gap-4">
      <div class="item_images">
        <img :src="item.images[0]" alt="">
      </div>
      <div class="item_content">
        <div class="item_name">
          {{ item.name }}
        </div>
        <div v-if="$slots?.price" class="price">
          <slot name="price" />
        </div>
        <div v-else class="price">
          ${{ (item.discountPrice && (item.discountPrice < item.price) ? item.discountPrice : item.price).toFixed(2) }}
          <sup v-if="item.discountPrice && (item.discountPrice < item.price)"
               class="line-through text-xs opacity-80">${{ item.price.toFixed(2) }}</sup>
        </div>
      </div>
    </NuxtLink>
    <div v-if="$slots?.actions" class="item_action_custom">
      <slot name="actions" />
    </div>
    <div v-else class="item_action" :key="renderKey">
      <button v-if="!addMode" class="flex-1 basket_button"
              :class="basketStore.isBasket(+item.id) ? 'active' : ''"
              @click.stop="addMode=true"
      >
        <Icon :name="basketStore.isBasket(+item.id) ? 'solar:cart-check-bold-duotone' : 'solar:cart-plus-line-duotone'"
              class=" shrink-0"/>
        {{ t(basketStore.isBasket(+item.id) ? 'inCart' : 'addToCart') }}
      </button>
      <div v-else class="flex items-center gap-2 flex-1">
        <input v-model.number="amount"
               type="number"
               :placeholder="t('amount')"
               :disabled="basketAddSuccess"
               class="w-2/3">
        <button :class="basketAddSuccess ? 'success pointer-events-none' : ''"
                @click.stop="addBasket"
        >
          <Icon :name="basketAddSuccess ? 'solar:cart-check-bold-duotone' : 'solar:cart-plus-line-duotone'" class="text-3xl leading-none -my-0.5" />
        </button>
        <div class="cancel-button"
             @click.stop="addMode=false"
        >
          <Icon name="hugeicons:cancel-01" />
        </div>
      </div>
      <div v-if="!addMode"
           role="button"
           class="favorites_button"
           :class="favoritesStore.isFavorite(item.id) ? 'active' : ''"
           @click.stop="addFavorite">
        <Icon :name="favoritesStore.isFavorite(item.id) ? 'solar:heart-bold' : 'solar:heart-linear'"
              class="text-3xl leading-none"
        />
      </div>
    </div>
  </div>
</template>
