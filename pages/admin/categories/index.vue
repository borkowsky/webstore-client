<script setup lang="ts">
import type {Reactive} from "vue";

const store = useAppStore()
const {t} = useI18n()
const {notify} = useNotification()
store.setTitle(t('admin.manageCategories'))
useHead({
  title: t('admin.manageCategories')
})
const {
  data: categories
} = await useAsyncData('categories', () => $api('/categories?category_id=').catch(() => []))

const navItems = ref([{
  title: t('admin.title'),
  path: '/admin'
}, {
  title: t('admin.manageCategories'),
  path: '/admin/categories'
}])
const selected: Ref<any> = ref(null)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showRemoveModal = ref(false)
const inputed: Reactive<{
  name: string,
  description: string | null,
  icon: string | null,
  category: any
}> = reactive({
  name: '',
  description: null,
  icon: null,
  category: null
})

const doEdit = (item: any) => {
  if (!item) return false
  inputed.name = item.name
  inputed.description = item.description
  inputed.icon = item.icon
  inputed.category = item.category ?
      (categories.value?.payload || []).find((c: any) => +c.id === +item.category.id) : null
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
  const {name, description, icon, category} = inputed
  $api('/categories', {
    method: 'post',
    body: JSON.stringify({
      name,
      description,
      icon,
      category_id: category?.id || null
    })
  }).then(() => {
    showAddModal.value = false
    notify({
      type: 'success',
      title: t('save'),
      text: t('admin.dataSaveOk')
    })
    refreshData()
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('dataSaveError')
    })
  })
}
const edit = () => {
  if (!selected.value) return false
  const {name, description, icon, category} = inputed
  $api(`/categories/${selected.value.id}`, {
    method: 'patch',
    body: JSON.stringify({
      name,
      description,
      icon,
      category_id: category?.id || null
    })
  }).then(() => {
    showEditModal.value = false
    notify({
      type: 'success',
      title: t('save'),
      text: t('admin.categorySaved')
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
  inputed.description = null
  inputed.icon = null
  inputed.category = null
}
const refreshData = () => {
  refreshNuxtData('categories')
}
const switchEnabled = (e: Event, item: any) => {
  if (!item) return false
  $api(`/categories/${item.id}`, {
    method: 'patch',
    body: JSON.stringify({
      enabled: e.target?.checked || false
    })
  }).then(() => {
    notify({
      type: 'success',
      title: t('save'),
      text: t('dataSaveOk')
    })
    refreshData()
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('errorOccurredTryAgain')
    })
  })
}
const remove = () => {
  if (!selected.value) return false
  $api(`/categories/${selected.value.id}`, {
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
</script>

<template>
  <section>
    <Breadcrumbs :items="navItems"/>
    <div class="flex justify-between mt-6">
      <div class="page-heading">
        <h1>
          {{ t('categories') }}
        </h1>
      </div>
      <button class="small" @click="showAddModal=true">
        <Icon name="hugeicons:folder-add"/>
        {{ t('create') }}
      </button>
    </div>
    <div>
      <div v-if="categories?.payload?.length" class="list">
        <div
            v-for="item in categories.payload"
            :key="`adm-category-${item.id}`"
        >
          <div class="list_item">
            <div class="list_icon">
              <Icon :name="item.icon || 'hugeicons:structure-folder'"/>
            </div>
            <NuxtLink :to="`/admin/categories/${item.id}`" class="list_content">
              <div class="text-sm">
                {{ item.name }}
              </div>
              <div>
                {{ `${t('description')}: ${item.description || t('empty').toLowerCase()}` }}
              </div>
            </NuxtLink>
            <div class="list_actions">
              <label class="switch mx-2">
                <input type="checkbox" :checked="item.enabled" @change="e => switchEnabled(e, item)">
                <span class="slider round"></span>
              </label>
              <div @click="doEdit(item)">
                <Icon name="hugeicons:folder-edit"/>
              </div>
              <div class="error" @click="doRemove(item)">
                <Icon name="hugeicons:folder-remove"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        {{ t('emptyList') }}
      </div>
    </div>

    <Modal v-model="showAddModal" @closed="flushInputed">
      <template #title>
        {{ t('admin.createCategory') }}
      </template>
      <div class="flex flex-col gap-2">
        <label for="name_input">
          {{ t('admin.categoryName') }}
        </label>
        <input type="text"
               id="name_input"
               v-model="inputed.name"
               :placeholder="t('input_text')"/>
        <label for="icon_input">
          {{ t('admin.categoryIcon') }}
        </label>
        <input type="text"
               id="icon_input"
               v-model="inputed.icon"
               :placeholder="t('input_text')"/>
        <label for="description_input">
          {{ t('description') }}
        </label>
        <textarea
            id="description_input"
            v-model="inputed.description"
            :placeholder="t('input_text')"/>
        <label for="categoryId_input">
          {{ t('category') }}
        </label>
        <div class="select">
          <select v-model="inputed.category" id="categoryId_input">
            <option value="null" selected>
              {{ t('noCategory') }}
            </option>
            <option v-for="item in (categories.payload || []).filter((c: any) => c.id !== selected?.id)"
                    :key="`s-category-${item.id}`"
                    :value="item"
            >
              {{ item.name }}
            </option>
          </select>
        </div>
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
        {{ t('admin.editCategory') }}
      </template>
      <div class="flex flex-col gap-2">
        <label for="name_input">
          {{ t('admin.categoryName') }}
        </label>
        <input type="text"
               id="name_input"
               v-model="inputed.name"
               :placeholder="t('input_text')"/>
        <label for="icon_input">
          {{ t('admin.categoryIcon') }}
        </label>
        <input type="text"
               id="icon_input"
               v-model="inputed.icon"
               :placeholder="t('input_text')"/>
        <label for="description_input">
          {{ t('description') }}
        </label>
        <textarea
            id="description_input"
            v-model="inputed.description"
            :placeholder="t('input_text')"/>
        <label for="categoryId_input">
          {{ t('category') }}
        </label>
        <div class="select">
          <select v-model="inputed.category" id="categoryId_input">
            <option value="null" selected>
              {{ t('noCategory') }}
            </option>
            <option v-for="item in (categories.payload || []).filter((c: any) => c.id !== selected?.id)"
                    :key="`s-category-${item.id}`"
                    :value="item"
            >
              {{ item.name }}
            </option>
          </select>
        </div>
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
        {{ t('admin.removeCategory') }}
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
