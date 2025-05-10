<script setup lang="ts">
const store = useAppStore()
const authStore = useAuthStore()
const {t} = useI18n()
const {formatTimeAbsolute, orderStatusIcons} = useMixins()
store.setTitle(t('orders.title'))
useHead({
  title: t('orders.title')
})
const currentTab: Ref<string> = ref('active')
const user = computed(() => authStore.user)
const page: Ref<number> = ref(0)
const requestParams = computed(() => new URLSearchParams({
  "page": page.value.toString(),
  "user_id": user.value?.id?.toString(),
  "type": currentTab.value,
  "sort": "id",
  "order": "desc"
}))
const {data: ordersData} = await useAsyncData('orders', () => $api(
    `/orders?${requestParams.value.toString()}`
)
    .catch(() => null))
const {data: ordersCountersData} = await useAsyncData('ordersCounters', () => $api("/orders/counters")
    .catch(() => null))
const orders = computed(() => ordersData?.value?.payload)
const pagesTotal = computed(() => ordersData?.value?.pages)
const ordersCounters = computed(() => ordersCountersData?.value?.payload)
if (!orders.value) {
  await navigateTo("/me")
}

watch(requestParams, () => {
  refreshNuxtData('orders').finally(() => {
    scrollElementsToTop()
  })
})

const breadcrumbItems = computed(() => ([{
  title: t('me.title'),
  path: '/me',
}, {
  title: t('orders.title'),
  path: '/me/orders'
}]))
const tabs = computed(() => ([{
  title: t('orders.active'),
  counter: ordersCounters.value?.active || 0,
  value: 'active'
}, {
  title: t('orders.completed'),
  counter: ordersCounters.value?.completed || 0,
  value: 'completed'
}]))
const toPage = (p: number) => {
  page.value = p - 1
}
const scrollElementsToTop = () => {
  document.querySelectorAll('.page_content').forEach((el: any) => {
    el.scrollTop = 0
  })
}
</script>

<template>
  <section>
    <Breadcrumbs :items="breadcrumbItems" class="h-12"/>
    <div class="page-heading sticky-heading">
      <h1>
        {{ t('orders.title') }}
      </h1>
    </div>
    <div class="heading-tabs mb-6">
      <div class="tab_item"
           v-for="(tab, idx) in tabs"
           :key="`orders-type-tab-${idx}`"
           :class="currentTab === tab.value ? 'active' : ''"
           @click="currentTab=tab.value"
      >
        {{ tab.title }}
        <sup class="counter">
          {{ tab.counter }}
        </sup>
      </div>
    </div>
    <div v-if="orders.length" class="orders_list">
      <NuxtLink v-for="item in orders"
                :key="`order-${item.id}`"
                :to="`/me/orders/${item.id}`"
                class="list_item">
        <div class="item_heading">
          <div class="flex gap-4 items-center">
            <Icon name="solar:bag-5-bold-duotone" class="text-4xl"/>
            <div class="flex-1">
              <div class="font-bold">
                {{ `${t('orders.from')} ${formatTimeAbsolute(item.createdAt)}` }}
              </div>
              <div>
                {{ `${t('orders.orderTitle')} #${item.id}` }}
              </div>
            </div>
          </div>
          <div class="font-bold text-lg">
            ${{ (item.payment?.sum || 0).toFixed(2) }}
          </div>
        </div>
        <div class="item_content">
          <div class="flex-1 shrink-0 font-bold text-xl flex items-center gap-2">
            <Icon :name="orderStatusIcons[item.status]" class="text-2xl"/>
            {{ t(`orderStatus.${item.status}`) }}
          </div>
          <div class="flex-[2] shrink-0 products_list max-w-[66%] overflow-x-auto">
            <div v-for="product in item.products"
                 :key="`order-${item.id}-product-${product.id}`"
                 class="image"
            >
              <img :src="product.product?.images?.[0]" :alt="product.product?.name">
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
    <EmptyPlaceholder v-else>
      <template #icon>
        <Icon name="solar:box-bold-duotone"/>
      </template>
      <div>
        {{ t('orders.empty') }}
      </div>
    </EmptyPlaceholder>
    <Pagination v-if="pagesTotal > 1"
                :pages="pagesTotal"
                :current-page="page + 1"
                class="mt-6"
                @to-page="toPage" />
  </section>
</template>
