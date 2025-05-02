<script setup lang="ts">
const favoritesStore = useFavoritesStore()
const {t} = useI18n()
const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => ({})
  }
})
const {item} = toRefs(props)

const addFavorite = (): void => {
  if (!item.value?.id) return
  favoritesStore.addFavorite(item.value.id)
      .then((res) => {
        console.log('fav aaded', res)
      }).catch(console.error)
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
        <div class="price">
          ${{ (item.discountPrice && (item.discountPrice < item.price) ? item.discountPrice : item.price).toFixed(2) }}
          <sup v-if="item.discountPrice && (item.discountPrice < item.price)"
               class="line-through text-xs opacity-80">${{ item.price.toFixed(2) }}</sup>
        </div>
      </div>
    </NuxtLink>
    <div class="item_action">
      <button class="flex-1">
        <Icon name="hugeicons:shopping-cart-add-02" class="text-lg leading-none"/>
        {{ t('addToCart') }}
      </button>
      <div class="flex items-center pl-2 hover:scale-[1.2] transition duration-300"
           @click.stop="addFavorite">
        <Icon name="solar:heart-linear" class="text-2xl leading-none"/>
        <!--        <Icon name="solar:heart-bold" class="text-2xl leading-none" />-->
      </div>
    </div>
  </div>
</template>
