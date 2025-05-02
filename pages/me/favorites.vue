<script setup lang="ts">
import EmptyPlaceholder from "~/components/EmptyPlaceholder.vue";

const store = useAppStore()
const {t} = useI18n()
store.setTitle(t('favorites'))
useHead({
  title: t('favorites')
})
const {data: favoritesData} = await useAsyncData('favorites', () => $api("/favorites").catch(() => null))
const favorites = computed(() => favoritesData?.value?.payload)
</script>
<template>
  <div class="side_menu">
    <div class="heading">
      {{ t('favoriteCategories') }}
    </div>
    <div class="side_menu_list">
<!--      <NuxtLink-->
<!--          v-for="(link, i) in menuItems"-->
<!--          :key="`me-link-${i}`"-->
<!--          :to="link.to"-->
<!--      >-->
<!--        <Icon :name="link.icon" class="font-bold"/>-->
<!--        {{ link.title }}-->
<!--      </NuxtLink>-->
    </div>
  </div>
  <section>
    <div class="scrolling_page_container">
      <div class="page-heading sticky-heading -mt-6">
        {{ t('favorites') }}
      </div>
      <div>
        <div v-if="!favorites.length">
          <div v-for="item in favorites"
          :key="`me-fav-${item.id}`"
          class=""
          >
            {{ item }}
          </div>
        </div>
        <EmptyPlaceholder v-else>
          <template #icon>
            <Icon name="solar:heart-broken-bold" />
          </template>
          <div>
            {{ t('favoritesEmpty') }}
          </div>
        </EmptyPlaceholder>
      </div>
    </div>
  </section>
</template>
