<script setup lang="ts">

const store = useAppStore()
const route = useRoute()
const id = computed(() => getIdFromCanonicalUrl(route.params.name?.toString() || ''))
const { data: categoryData } = await useAsyncData('category', () => $api(`/categories/${id.value}`).catch(() => null))
const category = computed(() => categoryData?.value?.payload || null)
if (!category.value) {
  await navigateTo("/")
}
store.setTitle(category.value?.name)
useHead({
  title: category.value?.name,
})
</script>

<template>
  <section>
    <div class="page-heading">
      <h1>
        {{ category?.name }}
      </h1>
    </div>
  </section>
</template>
