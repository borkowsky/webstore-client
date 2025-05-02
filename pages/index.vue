<script setup lang="ts">
const {t} = useI18n()
const store = useAppStore()
store.setTitle('Web Store')
useHead({
  title: 'Web Store'
})
const { data: popularItems } = useAsyncData('popular-items', () => $api("/products/popular").catch(() => []))
const { data: newItems } = useAsyncData('new-items', () => $api("/products?sort=createdAt&order=desc").catch(() => []))
</script>
<template>
  <section>
    <div class="page-heading sticky-heading -mt-6">
      {{ t('popularProducts') }}
    </div>
    <div class="mb-6">
      <div v-if="popularItems?.payload?.length" class="grid_list popular_items">
        <ProductCard
          v-for="item in popularItems.payload"
          :key="`popular-item-${item.id}`"
          :item="item" />
      </div>
      <div v-else>
        {{ t('emptyList') }}
      </div>
    </div>
    <div class="page-heading sticky-heading">
      {{ t('newProducts') }}
    </div>
    <div>
      <div v-if="newItems?.payload?.length" class="grid_list popular_items">
        <ProductCard
            v-for="item in newItems.payload"
            :key="`popular-item-${item.id}`"
            :item="item" />
        <ProductCard
            v-for="item in newItems.payload"
            :key="`popular-item-${item.id}`"
            :item="item" />        <ProductCard
          v-for="item in newItems.payload"
          :key="`popular-item-${item.id}`"
          :item="item" />        <ProductCard
          v-for="item in newItems.payload"
          :key="`popular-item-${item.id}`"
          :item="item" />        <ProductCard
          v-for="item in newItems.payload"
          :key="`popular-item-${item.id}`"
          :item="item" />
      </div>
      <div v-else>
        {{ t('emptyList') }}
      </div>
    </div>
  </section>
</template>
