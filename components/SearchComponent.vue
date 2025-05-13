<script setup lang="ts">
const store = useAppStore()
const router = useRouter()
const route = useRoute()
const {t} = useI18n()

const searchString = computed({
  get() {
    return store.searchString
  },
  set(val: string) {
    store.setSearchString(val)
  }
})
const doRedirect = (): void => {
  if (route.fullPath !== '/search') {
    router.push('/search')
  }
}
</script>

<template>
  <div class="app_header_search">
    <Icon name="lucide:search"/>
    <Icon name="hugeicons:loading-03"
          class="bx-spin transition"
          :class="store.searchPending ? '' : 'opacity-0'" />
    <input type="search"
           v-model="searchString"
           @click="doRedirect"
           @keyup="doRedirect"
           :placeholder="t('search')">
    <button :class="searchString.length ? 'opacity-100' : 'opacity-0'" :disabled="store.searchPending">
      {{ t('search').toLowerCase() }}
    </button>
  </div>
</template>
