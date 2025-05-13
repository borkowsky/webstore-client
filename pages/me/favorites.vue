<script setup lang="ts">
const store = useAppStore()
const favoritesStore = useFavoritesStore()
const {t} = useI18n()
const {notify} = useNotification()
store.setTitle(t('favorites'))
useHead({
  title: t('favorites')
})
const {data: categoriesData} = await useAsyncData('categories', () => $api("/favorites/categories").catch(() => null))
const favorites = computed(() => favoritesStore.list)
const categories = computed(() => categoriesData?.value?.payload)

const selected: Ref<any> = ref(null)
const showRemoveModal: Ref<boolean> = ref(false)

const removeFavorite = (item: any): void => {
  selected.value = item
  nextTick(() => {
    showRemoveModal.value = true
  })
}

const remove = (): void => {
  if (!selected.value) return
  favoritesStore.removeFavorite(selected.value.id).then(() => {
    selected.value = null
    showRemoveModal.value = false
    notify({
      type: 'success',
      title: t('information'),
      text: t('removeFavoriteSuccess')
    })
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('removeFavoriteError')
    })
  }).finally(() => {
    favoritesStore.fetch()
  })
}
</script>
<template>
  <div class="page_sectioned_container">
    <div class="side_menu">
      <div class="heading">
        {{ t('favoriteCategories') }}
      </div>
      <div class="side_menu_list">
        <div
            v-for="category in categories"
            :key="`category-fav-${category.id}`"
        >
          <Icon :name="category.icon || 'hugeicons:folder-01'" class="font-bold"/>
          {{ category.name }}
        </div>
      </div>
    </div>
    <section>
      <div class="scrolling_page_container">
        <div class="page-heading sticky-heading -mt-6">
          <h1>
            {{ t('favorites') }}
          </h1>
        </div>
        <div>
          <div v-if="favorites.length" class="grid_list">
            <ProductCard v-for="item in favorites"
                         :key="`me-fav-${item.id}`"
                         class="grid_item"
                         :class="!item.product.available ? 'disabled' : ''"
                         :item="item.product"
            >
              <template #actions>
                <button class="w-full depressed" @click.stop="removeFavorite(item)">
                  <Icon name="solar:heart-broken-bold" class="shrink-0" />
                  {{ t('remove') }}
                </button>
              </template>
            </ProductCard>
          </div>
          <EmptyPlaceholder v-else>
            <template #icon>
              <Icon name="solar:heart-broken-bold"/>
            </template>
            <div>
              {{ t('favoritesEmpty') }}
            </div>
          </EmptyPlaceholder>
        </div>
      </div>

      <Modal v-model="showRemoveModal">
        <template #title>
          {{ t('deleteItems') }}
        </template>
        <div class="flex flex-col gap-2">
          {{ t('removeFavoriteQuestion') }}
        </div>
        <div class="confirm_buttons mt-6">
          <div @click="showRemoveModal=false">
            {{ t('cancel') }}
          </div>
          <div class="error" @click="remove">
            {{ t('delete') }}
          </div>
        </div>
      </Modal>
    </section>
  </div>
</template>
