<script setup lang="ts">
const { t } = useI18n()
const { data: categories } = useAsyncData('categories', () => $api('/categories?category_id').catch(() => []))
</script>

<template>
  <div class="categories_section">
    <div class="heading">
      {{ t('categories') }}
    </div>
    <div class="categories_section_list">
      <NuxtLink
        v-for="category in (categories?.payload || [])"
        :key="`category-sect-${category.id}`"
        :to="`/category/${getCanonicalUrl(category)}`"
        class="list_item"
      >
        <Icon v-if="category.icon" :name="category.icon" class="item_icon" />
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
  </div>
</template>
