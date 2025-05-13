<script setup lang="ts">
const store = useAppStore()
const {t} = useI18n()
const {formatTimeAbsolute, paymentStatusIcons} = useMixins()
const authStore = useAuthStore()
store.setTitle(t('me.payments.title'))
useHead({
  title: t('me.payments.title')
})

const user = computed(() => authStore.user)
const page: Ref<number> = ref(0)
const requestParams = computed(() => new URLSearchParams({
  "page": page.value.toString(),
  "user_id": user.value?.id?.toString()
}))
const { data: paymentsData } = await useAsyncData("payments", () => $api(`/payments?${requestParams.value}`)
    .catch(() => null))
const payments = computed(() => paymentsData.value?.payload || [])
const pagesTotal = computed(() => paymentsData.value?.pages || 1)

watch(requestParams, () => {
  refreshNuxtData("payments")
})

const breadcrumbItems = computed(() => ([{
  title: t('me.title'),
  path: '/me',
}, {
  title: t('me.payments.title'),
  path: '/me/payments'
}]))
</script>

<template>
  <section>
    <Breadcrumbs :items="breadcrumbItems" />
    <div class="page-heading sticky-heading">
      <h1>
        {{ t('me.payments.title') }}
      </h1>
    </div>
    <div>
      <div v-if="payments?.length" class="list">
        <div v-for="item in payments"
             :key="`payment-${item.id}`"
             class="list_item"
        >
          <div class="list_icon light">
            <Icon :name="paymentStatusIcons[item.status]" class="" />
          </div>
          <div class="list_content">
            <div class="font-bold flex items-center gap-2">
              <div class="text-lg">
                ${{ item.sum }}
              </div>
              <div class="font-normal text-sm opacity-80">
                {{ t(`paymentStatus.${item.status}`) }}
              </div>
            </div>
            <div class="text-sm">{{ formatTimeAbsolute(item.createdAt) }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
