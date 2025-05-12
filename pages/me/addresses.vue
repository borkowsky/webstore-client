<script setup lang="ts">
import countries from '../../assets/json/countries.json'

const store = useAppStore()
const {t} = useI18n()
const authStore = useAuthStore()
const {notify} = useNotification()
store.setTitle(t('addresses.title'))
useHead({
  title: t('addresses.title')
})
const user = computed(() => authStore.user)
const breadcrumbItems = computed(() => ([{
  title: t('me.title'),
  path: '/me',
}, {
  title: t('addresses.title'),
  path: '/me/addresses'
}]))
const selected: Ref<any> = ref(null)
const showAddModal: Ref<boolean> = ref(false)
const showEditModal: Ref<boolean> = ref(false)
const showDeleteModal: Ref<boolean> = ref(false)
const inputed = reactive({
  address: '',
  city: '',
  region: '',
  country: '',
  postalCode: '',
})
const canProcess = computed(() => inputed.address.length > 0 &&
    inputed.postalCode.toString().length > 0 &&
    inputed.country.length > 0 &&
    inputed.city.length > 0 &&
    inputed.region.length > 0)

onBeforeMount(() => {
  authStore.fetch()
})

const doEdit = (item: any): void => {
  if (!item) return
  selected.value = item
  inputed.address = selected.value.address
  inputed.city = selected.value.city
  inputed.postalCode = selected.value.postalCode
  inputed.country = selected.value.country
  inputed.region = selected.value.region
  nextTick(() => {
    showEditModal.value = true
  })
}
const doDelete = (item: any): void => {
  if (!item) return
  selected.value = item
  nextTick(() => {
    showDeleteModal.value = true
  })
}
const add = (): void => {
  if (!canProcess.value) return
  const {address, country, region, city, postalCode} = inputed
  $api("/addresses", {
    method: "post",
    body: JSON.stringify({
      address,
      country,
      region,
      city,
      postalCode
    })
  }).then(() => {
    showAddModal.value = false
    notify({
      type: 'success',
      title: t('information'),
      inputed: t('addresses.addOk')
    })
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      inputed: t('addresses.addError')
    })
  }).finally(() => {
    authStore.fetch()
  })
}
const edit = (): void => {
  if (!canProcess.value || !selected.value) return
  const {address, country, region, city, postalCode} = inputed
  $api(`/addresses/${selected.value.id}`, {
    method: "patch",
    body: JSON.stringify({
      address,
      country,
      region,
      city,
      postalCode
    })
  }).then(() => {
    showEditModal.value = false
    notify({
      type: 'success',
      title: t('information'),
      text: t('addresses.updateOk')
    })
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('addresses.updateError')
    })
  }).finally(() => {
    authStore.fetch()
  })
}
const remove = (): void => {
  if (!selected.value) return
  $api(`/addresses/${selected.value.id}`, {
    method: "delete"
  }).then(() => {
    showEditModal.value = false
    notify({
      type: 'success',
      title: t('information'),
      text: t('addresses.deleteOk')
    })
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('addresses.deleteError')
    })
  }).finally(() => {
    authStore.fetch()
  })
}
const flushInputed = (): void => {
  inputed.address = ''
  inputed.postalCode = ''
  inputed.city = ''
  inputed.region = ''
  inputed.country = ''
}
</script>

<template>
  <section>
    <Breadcrumbs :items="breadcrumbItems" class="h-12"/>
    <div class="page-heading sticky-heading">
      <div class="flex items-center justify-between">
        <h1>
          {{ t('addresses.title') }}
        </h1>
        <button @click="showAddModal=true">
          <Icon name="hugeicons:location-add-01"/>
          {{ t('add') }}
        </button>
      </div>
    </div>
    <div>
      <div v-if="user?.addresses?.length" class="list">
        <div v-for="item in user.addresses"
             :key="`address-${item.id}`"
             class="list_item"
        >
          <div class="list_icon">
            <Icon name="hugeicons:location-01"/>
          </div>
          <div class="list_content">
            <div>{{ item.address }}</div>
            <div class="text-secondary-800">
              {{ [item.city, item.country, item.postalCode].join(', ') }}
            </div>
          </div>
          <div class="list_actions">
            <div role="button" @click="doEdit(item)">
              <Icon name="hugeicons:edit-02"/>
            </div>
            <div role="button" class="error" @click="doDelete(item)">
              <Icon name="hugeicons:delete-01"/>
            </div>
          </div>
        </div>
      </div>
      <EmptyPlaceholder v-else>
        <template #icon>
          <Icon name="hugeicons:location-offline-03"/>
        </template>
        <div>
          {{ t('addresses.empty') }}
        </div>
      </EmptyPlaceholder>
    </div>

    <Modal v-model="showAddModal" @closed="flushInputed">
      <template #title>
        {{ t('addresses.add') }}
      </template>
      <div class="flex flex-col">
        <label for="address_input">
          {{ t('addresses.address') }}
        </label>
        <input type="text"
               v-model="inputed.address"
               id="address_input"
               :placeholder="t('input_text')">
        <label for="city_input">
          {{ t('addresses.city') }}
        </label>
        <input type="text"
               v-model="inputed.city"
               id="city_input"
               :placeholder="t('input_text')">
        <label for="region_input">
          {{ t('addresses.region') }}
        </label>
        <input type="text"
               v-model="inputed.region"
               id="region_input"
               :placeholder="t('input_text')">
        <label for="postal_code_input">
          {{ t('addresses.postalCode') }}
        </label>
        <input type="number"
               v-model.number="inputed.postalCode"
               id="postal_code_input"
               :placeholder="t('input_text')">
        <label for="country_input">
          {{ t('addresses.country') }}
        </label>
        <div class="select">
          <select v-model="inputed.country" id="country_input">
            <option value="" disabled selected>
              {{ t('addresses.selectCountry') }}
            </option>
            <option v-for="(country, idx) in countries"
                    :key="`country-add-${idx}`"
                    :value="country.code">
              {{ country.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="confirm_buttons mt-6">
        <button @click="showAddModal=false" class="flat">
          <span class="text-primary-800">
            {{ t('cancel') }}
          </span>
        </button>
        <button :disabled="!canProcess" @click="add">
          {{ t('add') }}
        </button>
      </div>
    </Modal>

    <Modal v-model="showEditModal" @closed="flushInputed">
      <template #title>
        {{ t('addresses.edit') }}
      </template>
      <div class="flex flex-col">
        <label for="address_input">
          {{ t('addresses.address') }}
        </label>
        <input type="text"
               v-model="inputed.address"
               id="address_input"
               :placeholder="t('input_text')">
        <label for="city_input">
          {{ t('addresses.city') }}
        </label>
        <input type="text"
               v-model="inputed.city"
               id="city_input"
               :placeholder="t('input_text')">
        <label for="region_input">
          {{ t('addresses.region') }}
        </label>
        <input type="text"
               v-model="inputed.region"
               id="region_input"
               :placeholder="t('input_text')">
        <label for="postal_code_input">
          {{ t('addresses.postalCode') }}
        </label>
        <input type="number"
               v-model.number="inputed.postalCode"
               id="postal_code_input"
               :placeholder="t('input_text')">
        <label for="country_input">
          {{ t('addresses.country') }}
        </label>
        <div class="select">
          <select v-model="inputed.country" id="country_input">
            <option value="" disabled selected>
              {{ t('addresses.selectCountry') }}
            </option>
            <option v-for="(country, idx) in countries"
                    :key="`country-add-${idx}`"
                    :value="country.code">
              {{ country.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="confirm_buttons mt-6">
        <button @click="showEditModal=false" class="flat">
          <span class="text-primary-800">
            {{ t('cancel') }}
          </span>
        </button>
        <button :disabled="!canProcess" @click="edit">
          {{ t('save') }}
        </button>
      </div>
    </Modal>

    <Modal v-model="showDeleteModal">
      <template #title>
        {{ t('addresses.remove') }}
      </template>
      <div class="flex flex-col gap-2">
        {{ t('addresses.deleteQuestion') }}
      </div>
      <div class="confirm_buttons mt-6">
        <div @click="showDeleteModal=false">
          {{ t('cancel') }}
        </div>
        <div class="error" @click="remove">
          {{ t('remove') }}
        </div>
      </div>
    </Modal>
  </section>
</template>
