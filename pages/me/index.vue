<script setup lang="ts">
const store = useAppStore()
const authStore = useAuthStore()
const {t} = useI18n()
store.setTitle(t('me.title'))
useHead({
  title: t('me.title')
})
const user = computed(() => authStore.user)

const menuItems = computed(() => ([{
  title: t('me.general'),
  children: [{
    title: t('me.myCart'),
    icon: 'hugeicons:shopping-cart-02',
    to: '/me/basket'
  }, {
    title: t('me.myOrders'),
    icon: 'hugeicons:receipt-dollar',
    to: '/me/orders'
  }, {
    title: t('me.myPurchases'),
    icon: 'hugeicons:shopping-bag-check',
    to: '/me'
  }, {
    title: t('favorites'),
    icon: 'hugeicons:favourite',
    to: '/me/favorites'
  }]
}, {
  title: t('me.settings'),
  children: [{
    title: t('me.addresses'),
    icon: 'hugeicons:location-10',
    to: '/me/addresses'
  }]
}, ...user.value?.role === 'ADMINISTRATOR' ? [{
  title: t('me.administrative'),
  children: [{
    title: t('admin.title'),
    icon: 'hugeicons:dashboard-square-setting',
    to: '/admin'
  }]
}] : []]))
</script>

<template>
  <div class="side_menu pt-6">
    <div class="w-full flex items-center gap-2 rounded-lg bg-secondary-100 px-6 py-3">
      <div class="w-14 h-14 rounded-full flex bg-secondary-800 justify-center text-secondary-100 items-center">
        <Icon name="hugeicons:image-02" class="text-2xl"/>
      </div>
      <div>
        <div>
          {{ user?.username }}
        </div>
        <div
            class="cursor-pointer text-xs text-secondary-600 transition hover:underline hover:text-red-500"
            @click="store.setShowLogoutModal(true)"
        >
          {{ t('logout') }}
        </div>
      </div>
    </div>
    <div class="side_menu_list">
      <div v-for="(item, idx) in menuItems"
           :key="`menu-item-${idx}`"
           class="parent_item"
      >
        <div class="parent_title">
          {{ item.title }}
        </div>
        <NuxtLink
            v-for="(link, i) in item.children"
            :key="`me-link-${i}`"
            :to="link.to"
            class="child_item"
        >
          <Icon :name="link.icon" class="font-bold"/>
          {{ link.title }}
        </NuxtLink>
      </div>
    </div>
  </div>
  <section>
    <div class="scrolling_page_container">
      <div class="page-heading sticky-heading">
        <h1>
          {{ t('me.title') }}
        </h1>
      </div>
      user area
    </div>
  </section>
</template>
