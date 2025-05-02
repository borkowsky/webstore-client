<script setup lang="ts">
import type {Reactive} from "vue";

const store = useAppStore()
const {t} = useI18n()
const {notify} = useNotification()
store.setTitle(t('admin.manageBrands'))
useHead({
  title: t('admin.manageBrands')
})
const {
  data: brands
} = await useAsyncData('brands', () => $api('/brands').catch((e: Error) => {
  console.log(e)
  return null
}))

const navItems = ref([{
  title: t('admin.title'),
  path: '/admin'
}, {
  title: t('admin.manageBrands'),
  path: '/admin/brands'
}])
const selected: Ref<any> = ref(null)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showRemoveModal = ref(false)
const uploading: Ref<boolean> = ref(false)
const inputed: Reactive<{
  name: string,
  image: string | null
}> = reactive({
  name: '',
  image: null
})

const doEdit = (item: any) => {
  if (!item) return false
  inputed.name = item.name
  inputed.image = item.image
  selected.value = item
  nextTick(() => {
    showEditModal.value = true
  })
}
const doRemove = (item: any) => {
  if (!item) return false
  selected.value = item
  nextTick(() => {
    showRemoveModal.value = true
  })
}
const add = () => {
  const {name, image} = inputed
  $api('/brands', {
    method: 'post',
    body: JSON.stringify({
      name,
      image
    })
  }).then(() => {
    flushInputed()
    nextTick(() => {
      showAddModal.value = false
    })
    notify({
      type: 'success',
      title: t('save'),
      text: t('admin.dataSaveOk')
    })
    refreshData()
  }).catch(() => {
    showAddModal.value = false
    notify({
      type: 'error',
      title: t('error'),
      text: t('dataSaveError')
    })
  })
}
const edit = () => {
  if (!selected.value) return false
  const {name, image} = inputed
  $api(`/brands/${selected.value.id}`, {
    method: 'patch',
    body: JSON.stringify({
      name,
      image
    })
  }).then(() => {
    showEditModal.value = false
    notify({
      type: 'success',
      title: t('save'),
      text: t('admin.brandSaved')
    })
    refreshData()
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('dataUpdateError')
    })
  })
}
const flushInputed = () => {
  inputed.name = ''
  inputed.image = null
}
const refreshData = () => {
  refreshNuxtData('brands')
}
const remove = () => {
  if (!selected.value) return false
  $api(`/brands/${selected.value.id}`, {
    method: 'delete'
  }).then(() => {
    notify({
      type: 'success',
      title: t('information'),
      text: t('dataRemoveOk')
    })
    showRemoveModal.value = false
    refreshData()
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('dataRemoveError')
    })
  })
}
const onUploaded = (url: string): void => {
  if (!url) return
  inputed.image = url
  nextTick(() => {
    uploading.value = false
  })
}
const onUploadError = (err: Error): void => {
  uploading.value = false
  notify({
    type: 'error',
    title: t('error'),
    text: `${t('admin.upload_error')} (${err.message})`
  })
}
const flushAllInputed = (): void => {
  if (inputed.image?.length) {
    $api('/uploads', {
      method: 'delete',
      body: JSON.stringify({
        filename: inputed.image,
        type: "BRAND_IMAGE"
      })
    }).catch(() => {
      notify({
        type: 'error',
        title: t('error'),
        text: t('admin.delete_upload_error')
      })
    })
  }
  flushInputed()
  showAddModal.value = false
}
</script>

<template>
  <section>
    <Breadcrumbs :items="navItems"/>
    <div class="flex justify-between mt-6">
      <div class="page-heading">
        {{ t('brands') }}
      </div>
      <button class="small" @click="showAddModal=true">
        <Icon name="hugeicons:folder-add"/>
        {{ t('create') }}
      </button>
    </div>
    <div>
      <div v-if="brands?.payload?.length" class="list">
        <div
            v-for="item in brands.payload"
            :key="`adm-brand-${item.id}`"
        >
          <div class="list_item">
            <div class="list_icon overflow-hidden small">
              <img :src="item.image" alt="" class="w-full h-full object-cover">
            </div>
            <div class="list_content">
              <div class="text-sm">
                {{ item.name }}
              </div>
            </div>
            <div class="list_actions">
              <div @click="doEdit(item)">
                <Icon name="hugeicons:edit-02"/>
              </div>
              <div class="error" @click="doRemove(item)">
                <Icon name="hugeicons:delete-02"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        {{ t('emptyList') }}
      </div>
    </div>

    <Modal v-model="showAddModal" @closed="flushAllInputed">
      <template #title>
        {{ t('admin.createBrand') }}
      </template>
      <div class="flex flex-col gap-2">
        <div class="flex gap-2 items-center">
          <div id="upload-trigger-create" class="image_placeholder small">
            <div class="overlay" :class="uploading ? 'opacity-100' : 'opacity-0'">
              <i class="bx bx-loader-alt bx-spin text-4xl leading-none"/>
            </div>
            <Icon name="hugeicons:image-add-02" class="text-4xl font-bold"/>
          </div>
          <div v-if="inputed.image" class="image_placeholder small">
            <img :src="inputed.image" alt="" class="w-full h-full object-contain"/>
          </div>
        </div>
        <label for="name_input">
          {{ t('admin.brandName') }}
        </label>
        <input type="text"
               id="name_input"
               v-model="inputed.name"
               :placeholder="t('input_text')"/>
        <Upload trigger-el="upload-trigger-create"
                preview="upload-trigger-create"
                type="brand_image"
                @upload-ok="onUploaded"
                @upload-error="onUploadError" />
      </div>
      <div class="confirm_buttons mt-6">
        <div @click="showAddModal=false">
          {{ t('cancel') }}
        </div>
        <div class="success" @click="add">
          {{ t('create') }}
        </div>
      </div>
    </Modal>

    <Modal v-model="showEditModal" @closed="flushInputed">
      <template #title>
        {{ t('admin.editBrand') }}
      </template>
      <div class="flex flex-col gap-2">
        <div class="flex gap-2 items-center">
          <div id="upload-trigger-patch" class="image_placeholder small">
            <div class="overlay" :class="uploading ? 'opacity-100' : 'opacity-0'">
              <i class="bx bx-loader-alt bx-spin text-4xl leading-none"/>
            </div>
            <img v-if="inputed.image" :src="inputed.image" alt="" class="w-full h-full object-contain"/>
          </div>
        </div>
        <label for="name_input">
          {{ t('admin.brandName') }}
        </label>
        <input type="text"
               id="name_input"
               v-model="inputed.name"
               :placeholder="t('input_text')"/>
        <Upload trigger-el="upload-trigger-patch"
                preview="upload-trigger-patch"
                type="brand_image"
                @upload-ok="onUploaded"
                @upload-error="onUploadError" />
      </div>
      <div class="confirm_buttons mt-6">
        <div @click="showEditModal=false">
          {{ t('cancel') }}
        </div>
        <div class="success" @click="edit">
          {{ t('save') }}
        </div>
      </div>
    </Modal>

    <Modal v-model="showRemoveModal">
      <template #title>
        {{ t('admin.removeBrand') }}
      </template>
      <div class="flex flex-col gap-2">
        {{ t('removeQuestion') }}
      </div>
      <div class="confirm_buttons mt-6">
        <div @click="showRemoveModal=false">
          {{ t('cancel') }}
        </div>
        <div class="error" @click="remove">
          {{ t('remove') }}
        </div>
      </div>
    </Modal>
  </section>
</template>
