<script setup lang="ts">
import {throttle} from "lodash-es";

const store = useAppStore()
const {t} = useI18n()
const {declOfNum} = useMixins()
store.setTitle(t('searchResults'))
useHead({
  title: t('searchResults')
})
const searchResults = computed({
  get() {
    return store.searchResults
  },
  set(val: any) {
    store.setSearchResults(val)
  }
})
const searchString = computed({
  get() {
    return store.searchString
  },
  set(val: string) {
    store.setSearchString(val)
  }
})

watch(searchString, throttle(() => {
  if (!searchString.value.length) {
    searchResults.value = null
  }
  doSearch()
}, 500))

const doSearch = (): void => {
  if (searchString.value.length < 3) return
  store.setSearchPending(true)
  $api(`/search?query=${searchString.value}`).then((res: any) => {
    searchResults.value = res?.payload
  }).catch(() => false).finally(() => store.setSearchPending(false))
}
</script>

<template>
  <section>
    <div class="sticky-heading page-heading">
      <h1>
        {{ store.searchString.length ? `${t('searchResultsFor')} «${store.searchString}»` : t('search') }}
      </h1>
    </div>
    <div v-if="searchString.length > 2">
      <div v-if="searchResults?.total" class="search_results">
        <div class="search_results_details">
          {{
            `${searchResults.total} ${declOfNum(searchResults.total, [t('resultFound'), t('resultsFound'), t('resultsFound')]).toLowerCase()}`
          }}
        </div>
        <template v-if="searchResults.products?.length">
          <div class="heading">
            {{ t('products') }}
          </div>
          <div class="grid_list wide">
            <ProductCard
                v-for="item in searchResults.products"
                :key="`search-product-${item.id}`"
                :item="item" />
          </div>
        </template>
        <template v-if="searchResults.brands?.length">
          <div class="heading">
            {{ t('brands') }}
          </div>
          <div class="flex items-center gap-4 flex-wrap">
            <NuxtLink v-for="brand in searchResults.brands"
                 :key="`search-brand-${brand.id}`"
                      :to="`/brand/${getCanonicalUrl(brand)}`"
                 class="flex items-center gap-2 transition hover:shadow-lg hover:bg-accent-100 bg-secondary-100 max-w-max pl-2 pr-4 py-2 cursor-pointer rounded-full"
            >
              <div class="w-8 h-8 flex items-center justify-center shrink-0">
                <img :src="brand.image" :alt="brand.name" class="w-full h-full object-contain">
              </div>
              <div class="flex-1 font-bold ">
                {{ brand.name }}
              </div>
            </NuxtLink>
          </div>
        </template>
        <template v-if="searchResults.categories?.length">
          <div class="heading">
            {{ t('categories') }}
          </div>
          <div>
            {{ searchResults.categories }}
          </div>
        </template>
      </div>
      <EmptyPlaceholder v-else>
        <template #icon>
          <Icon name="solar:magnifer-bold-duotone"/>
        </template>
        <div>
          {{ t('emptySearchResults') }}
        </div>
      </EmptyPlaceholder>
    </div>
    <div v-else class="text-center text-4xl font-bold mt-36 text-secondary-600/40">
      {{ t('searchPlaceholder') }}
    </div>
  </section>
</template>
