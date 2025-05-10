<script setup lang="ts">
import {throttle} from 'lodash-es'

const store = useAppStore()
const {t} = useI18n()
const {notify} = useNotification()
const {paymentStatuses, orderStatuses} = useMixins()
store.setTitle(t('admin.manageOrders'))
useHead({
  title: t('admin.manageOrders')
})

const selectedUser: Ref<any> = ref(null)
const searchType: Ref<string> = ref('active')
const page: Ref<number> = ref(0)
const requestParams = computed(() => new URLSearchParams({
  "page": page.value.toString(),
  "user_id": selectedUser.value?.id || '',
  "type": searchType.value,
  "sort": "id",
  "order": "desc"
}))
const {data: ordersData} = await useAsyncData('orders', () =>
    $api(`/orders?${requestParams.value.toString()}`)
        .catch(() => null))
const {data: countersData} = await useAsyncData('counters', () =>
    $api(`/orders/counters?${requestParams.value.toString()}`)
        .catch(() => null))
const orders = computed(() => ordersData.value?.payload || [])
const pagesTotal = computed(() => ordersData?.value?.pages)
const counters = computed(() => countersData.value?.payload || [])
const breadcrumbItems = ref([{
  title: t('admin.title'),
  path: '/admin'
}, {
  title: t('admin.manageOrders'),
  path: '/admin/orders'
}])
const tabs: Ref<any[]> = ref([{
  title: t('admin.orders.active'),
  value: 'active'
}, {
  title: t('admin.orders.completed'),
  value: 'completed'
}])
const paymentStatusesSelect: any = computed((): any => paymentStatuses.reduce((a: any, b: any): any => ({
  ...a,
  [b]: t(`paymentStatus.${b}`)
}), {}))
const orderStatusesSelect: any = computed((): any => orderStatuses.reduce((a: any, b: any): any => ({
  ...a,
  [b]: t(`orderStatus.${b}`)
}), {}))
const selected: Ref<any> = ref(null)
const usernameSearchString: Ref<string> = ref('')
const usersSearchResult: Ref<any[]> = ref([])
const showEditModal: Ref<boolean> = ref(false)
const inputed = reactive({
  order_status: '',
  payment_status: ''
})

watch(requestParams, () => {
  refreshData()
})
watch(usernameSearchString, throttle(() => {
  searchUsers()
}, 500))

const searchUsers = (): void => {
  $api(`/users/search?username=${usernameSearchString.value}`).then((res: any) => {
    usersSearchResult.value = res?.payload || []
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('admin.searchError')
    })
  })
}
const selectUser = (user: any): void => {
  if (!user) return
  selectedUser.value = user
  nextTick(() => {
    usernameSearchString.value = ''
  })
}
const doEdit = (item: any): void => {
  if (!item) return
  selected.value = item
  inputed.payment_status = item.payment?.status
  inputed.order_status = item.status
  nextTick(() => {
    showEditModal.value = true
  })
}
const edit = (): void => {
  if (!selected.value) return
  $api(`/orders/${selected.value.id}`, {
    method: "patch",
    body: JSON.stringify({
      ...inputed
    })
  }).then(() => {
    showEditModal.value = false
    selected.value = null
    notify({
      type: 'success',
      title: t('information'),
      text: t('admin.orders.editOk')
    })
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('admin.orders.editError')
    })
  }).finally(() => {
    refreshData()
  })
}
const refreshData = (): void => {
  refreshNuxtData('counters')
  refreshNuxtData('orders').finally(() => {
    scrollElementsToTop()
  })
}
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
        {{ t('admin.manageOrders') }}
      </h1>
    </div>
    <div class="heading-tabs">
      <div v-for="(tab, idx) in tabs"
           :key="`tab-${idx}-${tab.value}`"
           :class="searchType===tab.value ? 'active' : ''"
           @click="searchType=tab.value"
           class="tab_item">
        {{ tab.title }}
        <sup class="ml-2 text-sm">{{ counters?.[tab.value] || '0' }}</sup>
      </div>
    </div>
    <div class="border-y border-secondary-200/80 border-dashed my-2 py-2">
      <div v-if="selectedUser?.id">
        <div class="font-bold text-secondary-800">
          {{ t('admin.orders.currentUser') }}
        </div>
        <div class="search_pill large my-2 max-w-max">
          <div class="icon">
            <Icon name="hugeicons:user"/>
          </div>
          <div class="name">
            {{ selectedUser.username }}
          </div>
          <div class="close" @click="selectedUser=null">
            <Icon name="hugeicons:cancel-01"/>
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col gap-2">
        <div class="text-sm font-bold text-secondary-800">
          {{ t('admin.searchUser') }}
        </div>
        <input type="search" class="max-w-max px-3 py-2 rounded-lg focus:shadow-lg" v-model="usernameSearchString"
               :placeholder="t('admin.searchUser')">
        <div v-if="usernameSearchString.length">
          <div v-if="usersSearchResult.length" class="search_pills">
            <div v-for="user in usersSearchResult"
                 :key="`search-user-${user.id}`"
                 class="search_pill"
                 @click="selectUser(user)"
            >
              <div class="icon -mr-1">
                <Icon name="hugeicons:user"/>
              </div>
              <div class="name">
                {{ user.username }}
              </div>
            </div>
          </div>
          <div v-else>
            {{ t('empty') }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="orders.length" class="list">
      <div v-for="item in orders"
           :key="`order-${item.id}`"
           class="list_item">
        <div class="list_icon">
          <Icon name="hugeicons:delivery-box-01"/>
        </div>
        <div class="list_content">
          <div class="flex items-center gap-4">
            {{ `${t('orders.orderTitle')} #${item.id}` }}
            <Icon name="hugeicons:arrow-right-02"/>
            <strong class="text-small text-secondary-700">{{ item.user?.username }} (#{{ item.user?.id }})</strong>
          </div>
          <div>
            {{
              `${t('status')}: ${t(`orderStatus.${item.status}`)}, ${t('payment.payment')}: ${t(`paymentStatus.${item.payment?.status}`)} ($${item.payment?.sum}),`
            }}
            {{ t('orders.productsQuantity').toLowerCase() }}:
            {{ item.products.map((i: any) => i.amount).reduce((a: any, b: any) => +a + +b, 0) }}
          </div>
        </div>
        <div class="list_actions">
          <div role="button" @click="doEdit(item)">
            <Icon name="hugeicons:edit-02"/>
          </div>
        </div>
      </div>
    </div>
    <EmptyPlaceholder v-else>
      <template #icon>
        <Icon name="hugeicons:dropbox"/>
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

    <Modal v-model="showEditModal">
      <template #title>
        {{ t('orders.orderTitle') }} #{{ selected?.id }}
      </template>
      <div class="flex flex-col gap-2">
        <div>
          <div class="heading">
            {{ t('user') }}
          </div>
          <div class="flex items-center gap-2 mt-2">
            <div class="h-12 w-12 flex items-center justify-center bg-secondary-600/40 rounded-full shrink-0">
              <Icon name="solar:user-bold-duotone" class="text-2xl" />
            </div>
            <div>
              <div class="font-bold">
                {{ selected.user?.username }} <span class="font-normal">#{{ selected.user?.id }}</span>
              </div>
              <div class="text-sm">
                {{ selected.user?.email }}
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="heading">
            {{ t('orders.shippingInfo') }}
          </div>
          <div class="flex items-center gap-2 mt-2">
            <div class="h-12 w-12 flex items-center justify-center bg-secondary-600/40 rounded-full shrink-0">
              <Icon name="solar:map-point-wave-bold-duotone" class="text-2xl" />
            </div>
            <div>
              <div class="font-bold">
                {{ selected.address?.address }}
              </div>
              <div class="text-sm">
                {{ [selected.address?.city, selected.address?.region, selected.address?.country, selected.address?.postalCode].join(', ') }}
              </div>
            </div>
          </div>
        </div>
        <div class="mb-6">
          <div class="heading">
            {{ t('products') }}
          </div>
          <div class="mt-2 flex flex-col gap-1">
            <div v-for="(product, idx) in selected.products"
                 :key="`selected-${selected.id}-product-${product.id}-${idx}`"
                 class="flex items-stretch gap-2 bg-secondary-50 py-3 rounded-lg"
            >
              <div class="flex items-center shrink-0 justify-center w-12 h-12">
                <img :src="product.product?.images?.[0]" :alt="product.product?.name">
              </div>
              <div class="flex-1 flex flex-col justify-between">
                <div class="truncate">
                  {{ product.product?.name }}
                </div>
                <div class="text-sm">
                  {{ t('amount') }}: {{ product.amount }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="border-b border-secondary-200 border-dashed mb-4" />
      <div>
        <label for="order_status_select">
          {{ t('admin.orders.changeOrderStatus') }}
        </label>
        <div class="select my-2">
          <select v-model="inputed.order_status" id="order_status_select">
            <option value="" selected disabled>
              {{ t('selectOption') }}
            </option>
            <option v-for="(key, idx) in Object.keys(orderStatusesSelect)"
                    :key="`order-select-${key}-${idx}`"
                    :value="key">
              {{ orderStatusesSelect[key] }}
            </option>
          </select>
        </div>
        <label for="payment_status_select">
          {{ t('admin.orders.changePaymentStatus') }}
        </label>
        <div class="select my-2">
          <select v-model="inputed.payment_status" id="payment_status_select">
            <option value="" selected disabled>
              {{ t('selectOption') }}
            </option>
            <option v-for="(key, idx) in Object.keys(paymentStatusesSelect)"
                    :key="`payment-select-${key}-${idx}`"
                    :value="key">
              {{ paymentStatusesSelect[key] }}
            </option>
          </select>
        </div>
      </div>
      <div class="confirm_buttons mt-6">
        <button class="flat" @click="showEditModal=false">
          <span class="text-secondary-800">
            {{ t('cancel') }}
          </span>
        </button>
        <button role="button" @click="edit">
          {{ t('save') }}
        </button>
      </div>
    </Modal>
  </section>
</template>
