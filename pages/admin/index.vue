<script setup lang="ts">
const store = useAppStore()
const authStore = useAuthStore()
const { t } = useI18n()
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
}]))
</script>

<template>
  <section>
    <div class="flex gap-6">
      <div class="side_menu">
        <div class="text-lg py-2">
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
      <div>
        <div class="page-heading">
          {{ t('admin.title') }}
        </div>
        <div>
          stats here
        </div>
      </div>
    </div>
  </section>
</template>
