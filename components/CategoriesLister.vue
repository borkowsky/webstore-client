<script setup lang="ts">
import orderBy from 'lodash/orderBy'

const {t} = useI18n()
const {declOfNum} = useMixins()
const route = useRoute()
const selected: Ref<any> = ref(null)
const searchParams = computed(() => new URLSearchParams({
  "category_id": selected.value?.id || '',
  "enabled": "true",
  "limit": "500"
}).toString())
const {data: categories} = useAsyncData('categories', () => $api(`/categories?${searchParams.value}`).catch(() => []))
const canShowRoot: Ref<boolean> = ref(true)

watch(() => route.fullPath, () => {
  checkRoutePath()
})
watch(selected, () => {
  if (selected.value) {
    canShowRoot.value = false
  } else {
    setTimeout(() => {
      canShowRoot.value = true
    }, 50)
  }
})
watch(searchParams, () => {
  refreshNuxtData('categories')
})

onBeforeMount(() => {
  checkRoutePath()
})

const checkRoutePath = (): void => {
  if (route.fullPath.startsWith("/category/")) {
    $api(`/categories/${getIdFromCanonicalUrl((route?.params?.name || '').toString())}`).then((res: any) => {
      if (res?.payload?.categoryId) {
        const category: any = (categories.value?.payload || []).find((c: any) => c.id === res.payload?.categoryId)
        if (category) {
          selected.value = category
        }
      }
    }).catch(() => false)
  } else {
    selected.value = null
  }
}
</script>

<template>
  <div class="categories_section">
    <div class="heading">
      {{ t('categories') }}
    </div>
    <Transition name="slide-x">
      <div v-if="!selected && canShowRoot" class="categories_section_list">
        <div v-for="category in orderBy((categories?.payload || []), 'productsCount', 'desc')"
             :key="`category-sect-${category.id}`"
             class="list_item"
             @click="selected=category"
        >
          <Icon v-if="category.icon" :name="category.icon" class="item_icon"/>
          <div>
            <div class="item_name">
              {{ category.name }}
            </div>
            <div class="item_description">
              {{ category.productsCount }} {{ t('items').toLowerCase() }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <Transition name="slide-x" appear mode="out-in">
      <div v-if="selected" class="categories_section_list">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-12 h-12 flex items-center justify-center text-2xl cursor-pointer hover:bg-secondary-100 rounded-lg"
               @click="selected=null"
          >
            <Icon name="hugeicons:arrow-left-01"/>
          </div>
          <div>
            <div class="flex items-center gap-1 text-sm">
              {{ selected?.name }}
            </div>
            <div class="text-xs">
              {{ `${selected?.categories?.length || 0} ${declOfNum(selected?.categories?.length || 0, [t('category'), t('categories'), t('categories')])}` }}
            </div>
          </div>
        </div>
        <NuxtLink
            v-for="category in orderBy((categories?.payload || []), 'productsCount', 'desc')"
            :key="`subcategory-sect-${category.id}`"
            :to="`/category/${getCanonicalUrl(category)}`"
            class="list_item"
            :class="route.params?.name === getCanonicalUrl(category) ? 'active' : ''"
        >
          <Icon :name="category.icon || 'hugeicons:folder-01'" class="item_icon"/>
          <div>
            <div class="item_name">
              {{ category.name }}
            </div>
            <div class="item_description">
              {{ category.productsCount }} {{ t('items').toLowerCase() }}
            </div>
          </div>
        </NuxtLink>
      </div>
    </Transition>
  </div>
</template>
