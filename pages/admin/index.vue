<script setup lang="ts">
const store = useAppStore()
const authStore = useAuthStore()
const {t} = useI18n()
store.setTitle(t('admin.title'))
useHead({
  title: t('admin.title')
})

const menuItems = computed(() => ([{
  title: t('admin.manageCategories'),
  icon: 'hugeicons:folder-edit',
  to: '/admin/categories'
}, {
  title: t('admin.manageProducts'),
  icon: 'hugeicons:blockchain-01',
  to: '/admin/products'
}, {
  title: t('admin.manageBrands'),
  icon: 'hugeicons:layers-logo',
  to: '/admin/brands'
}, {
  title: t('admin.manageOrders'),
  icon: 'solar:box-linear',
  to: '/admin/orders'
}]))
</script>

<template>
  <div class="page_sectioned_container">
    <div class="side_menu">
      <div class="heading">
        {{ t('links') }}
      </div>
      <div>
        <div class="side_menu_list">
          <NuxtLink
              v-for="(link, i) in menuItems"
              :key="`panel-sm-link-${i}`"
              :to="link.to"
          >
            <Icon :name="link.icon" class="font-bold"/>
            {{ link.title }}
          </NuxtLink>
        </div>
      </div>
    </div>
    <section>
      <div class="page-heading sticky-heading">
        <h1>
          {{ t('admin.title') }}
        </h1>
      </div>
      <div>
        stats here
      </div>
    </section>
  </div>
</template>
