<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
interface BreadcrumbItem {
  title: string,
  path: string,
  id?: number
}
const id: string = useId()
const props = defineProps({
  items: {
    type: Array<BreadcrumbItem>,
    required: true
  }
})
const { items } = toRefs(props)

const getComponentType = (item: BreadcrumbItem) => {
  if (item.path && route.fullPath !== item.path) {
    return defineNuxtLink({})
  } else {
    return 'div'
  }
}
</script>

<template>
  <div class="breadrumbs">
    <NuxtLink to="/">
      <Icon name="hugeicons:home-13" class="-mt-0.5" />
      {{ t('home') }}
    </NuxtLink>
    <Icon name="hugeicons:arrow-right-01" />
    <Component
      v-for="(item, i) in items"
      :key="`nav-${id}-item-${i}`"
      :to="item.path"
      :is="getComponentType(item)"
    >
      {{ item?.title }}
      <Icon v-if="(i + 1) !== items.length" name="hugeicons:arrow-right-01" />
    </Component>
  </div>
</template>
