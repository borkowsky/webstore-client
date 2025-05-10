<script setup lang="ts">
import { throttle } from 'lodash-es'
import type {Reactive} from "vue";
import Upload from "~/components/Upload.vue";

const store = useAppStore()
const {t} = useI18n()
const {notify} = useNotification()
store.setTitle(t('admin.manageProducts'))
useHead({
  title: t('admin.manageProducts')
})
const {
  data: categories
} = await useAsyncData('categories', () => $api('/categories?limit=500&category_id').catch(() => []))

const navItems = ref([{
  title: t('admin.title'),
  path: '/admin'
}, {
  title: t('admin.manageProducts'),
  path: '/admin/products'
}])
const currentCategory: Ref<any> = ref(null)
const currentSubcategory: Ref<any> = ref(null)
const products: Ref<any[]> = ref([])
const selected: Ref<any> = ref(null)
const showAddModal: Ref<boolean> = ref(false)
const showEditModal: Ref<boolean> = ref(false)
const showRemoveModal: Ref<boolean> = ref(false)
const uploadKey: Ref<number> = ref(0)
const uploading: Ref<boolean> = ref(false)
const deletingUploads: Ref<string[]> = ref([])
const editingCategory: Ref<any> = ref()
const editingSubcategory: Ref<any> = ref()
const brandSearchString: Ref<string> = ref('')
const inputedTag: Ref<string> = ref('')
const brands: Ref<any[]> = ref([])
const inputed: Reactive<{
  name: string,
  description: string | null,
  price: number,
  discountPrice: number,
  balance: number,
  category: any,
  brand: any,
  tags: string[],
  images: string[]
}> = reactive({
  name: '',
  description: null,
  price: 0.0,
  discountPrice: 0.0,
  balance: 0,
  category: null,
  brand: null,
  tags: [],
  images: []
})

watch(() => currentCategory.value, () => {
  if (currentCategory.value) {
    currentSubcategory.value = null
    fetchProducts()
  }
})

watch(() => currentSubcategory.value, () => {
  if (currentSubcategory.value) {
    fetchProducts()
  }
})
watch(brandSearchString, throttle(() => {
  searchBrand()
}, 500))

const fetchProducts = (): void => {
  $api(`/products?category_id=${currentSubcategory?.value?.id || currentCategory.value?.id || null}`).then((res) => {
    products.value = res.payload || []
  }).catch((err: Error) => {
    notify({
      type: 'error',
      title: t('error'),
      message: t('fetchProductsError')
    })
  })
}
const doEdit = (item: any): void | boolean => {
  if (!item) return false
  inputed.name = item.name
  inputed.description = item.description
  inputed.price = item.price
  inputed.discountPrice = item.discountPrice
  inputed.images = item.images
  inputed.balance = item.balance
  inputed.category = item.category
  inputed.brand = item.brand
  inputed.tags = item.tags
  selected.value = item
  editingCategory.value = currentCategory.value
  editingSubcategory.value = currentSubcategory.value
  nextTick(() => {
    showEditModal.value = true
  })
}
const doRemove = (item: any): boolean | void => {
  if (!item) return false
  selected.value = item
  nextTick(() => {
    showRemoveModal.value = true
  })
}
const add = (): void => {
  const {name, description, price, discountPrice, images, balance, brand, tags} = inputed
  $api('/products', {
    method: 'post',
    body: JSON.stringify({
      name,
      description,
      price,
      discountPrice,
      images,
      balance,
      tags,
      brand_id: brand?.id || null,
      category_id: currentSubcategory?.value?.id || currentCategory?.value?.id || null
    })
  }).then(() => {
    showAddModal.value = false
    notify({
      type: 'success',
      title: t('save'),
      text: t('admin.dataSaveOk')
    })
    flushInputed()
    refreshData()
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('dataSaveError')
    })
  })
}
const edit = async (): Promise<void> => {
  if (!selected.value) return Promise.resolve()
  const {name, description, price, discountPrice, balance, images, brand, tags} = inputed
  $api(`/products/${selected.value.id}`, {
    method: 'patch',
    body: JSON.stringify({
      name,
      description,
      price,
      discountPrice,
      balance,
      images,
      tags,
      brand_id: brand?.id || null,
      ...editingSubcategory.value || editingCategory.value ? {
        category_id: editingSubcategory.value?.id || editingCategory.value?.id || null
      } : {}
    })
  }).then(() => {
    showEditModal.value = false
    notify({
      type: 'success',
      title: t('save'),
      text: t('admin.productSaved')
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
const flushInputed = (): void => {
  inputed.name = ''
  inputed.description = null
  inputed.price = 0.0
  inputed.discountPrice = 0.0
  inputed.balance = 0
  inputed.category = null
  inputed.brand = null
  inputed.tags = []
  inputed.images = []
  brandSearchString.value = ''
  inputedTag.value = ''
}
const refreshData = (): void => {
  refreshNuxtData('categories')
  fetchProducts()
}
const switchEnabled = (e: Event, item: any): void | boolean => {
  if (!item) return false
  $api(`/products/${item.id}`, {
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
const remove = (): void | boolean => {
  if (!selected.value) return false
  $api(`/products/${selected.value.id}`, {
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
const deleteUpload = (name: string): void => {
  if (!name) return
  deletingUploads.value.push(name)
  $api('/uploads', {
    method: 'delete',
    body: JSON.stringify({
      filename: name.split("/").pop(),
      type: "PRODUCT_IMAGE"
    })
  }).then(() => {
    inputed.images = inputed.images.filter((i: string) => i !== name)
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('admin.delete_upload_error')
    })
  }).finally(() => {
    deletingUploads.value = deletingUploads.value.filter((i: string) => i !== name)
  })
}
const flushAllInputed = (): void => {
  if (inputed.images.length) {
    $api('/uploads/multiple', {
      method: 'delete',
      body: JSON.stringify({
        filenames: inputed.images,
        type: "PRODUCT_IMAGE"
      })
    }).catch((e: Error) => {
      notify({
        type: 'error',
        title: t('error'),
        text: `${t('admin.flush_images_error')} (${e.message})`
      })
    })
  }
  flushInputed()
  showAddModal.value = false
}
const searchBrand = () => {
  if (!brandSearchString.value.length) {
    brands.value = []
  } else {
    $api(`/brands?name_query=${brandSearchString.value}`).then((r: any) => {
      brands.value = r?.payload || []
    }).catch((e: Error) => {
      notify({
        type: 'error',
        title: t('error'),
        text: `${t('loadDataError')} (${e.message})`
      })
    })
  }
}
const onUploaded = (url: string): void => {
  if (!url) return
  inputed.images.push(url)
  nextTick(() => {
    uploading.value = false
    uploadKey.value++
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
const selectBrand = (brand: any): void => {
  if (!brand) return
  brandSearchString.value = brand.name
  inputed.brand = brand
}
const addTag = (): void => {
  if (!inputedTag.value.length) return
  inputed.tags.push(inputedTag.value)
  inputedTag.value = ''
}
const removeTag = (idx: number): void => {
  if (!(idx in inputed.tags)) return
  idx ? inputed.tags.splice(idx, 1) : inputed.tags.shift()
}
</script>

<template>
  <section>
    <Breadcrumbs :items="navItems"/>
    <div class="flex justify-between mt-6">
      <div class="page-heading">
        <h1>
          {{ t('products') }}
        </h1>
      </div>
      <button class="small" @click="showAddModal=true">
        <Icon name="hugeicons:plus-sign-square"/>
        {{ t('create') }}
      </button>
<!--      <button v-if="currentCategory || currentSubcategory" class="small" @click="showAddModal=true">-->
<!--        <Icon name="hugeicons:plus-sign-square"/>-->
<!--        {{ t('create') }}-->
<!--      </button>-->
    </div>
    <div class="flex w-full md:items-center bg-accent-100 pl-6 pr-2 py-2 gap-4 flex-col md:flex-row rounded-lg rounded-b-none">
      <div class="flex-1 flex items-center">
        <div class="flex-1 text-lg leading-none flex items-center gap-2">
          <Icon name="hugeicons:folder-links"/>
          {{ t('category') }}
        </div>
        <div class="select flex-[3]">
          <select v-model="currentCategory">
            <option disabled selected value="null">{{ t('admin.selectCategory') }}</option>
            <option
                v-for="category in (categories.payload || [])"
                :key="`category-${category.id}`"
                :value="category">
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="flex-1 flex items-center gap-2">
        <div class="flex-1 text-lg leading-none flex items-center gap-2">
          <Icon name="hugeicons:folder-links"/>
          {{ t('subcategory') }}
        </div>
        <div class="select flex-[3]">
          <select v-model="currentSubcategory">
            <option disabled selected value="null">{{ t('admin.selectSubcategory') }}</option>
            <option
                v-for="category in (currentCategory?.categories || [])"
                :key="`subcategory-${category.id}`"
                :value="category">
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div class="rounded-t-none flex w-full md:items-center bg-accent-100 pl-6 pr-2 py-2 gap-4 flex-col md:flex-row rounded-lg">
      <div class="text-lg flex items-center gap-2">
        <Icon name="hugeicons:folder-02" />
        {{ t('admin.workingCategory') }}: <span class="underline">{{ currentSubcategory?.name || currentCategory?.name || t('notSelected') }}</span>
      </div>
    </div>
    <div class="mt-4">
      <div v-if="products?.length" class="list">
        <div
            v-for="item in products"
            :key="`adm-product-${item.id}`"
        >
          <div class="list_item">
            <div class="list_icon large">
              <img :src="item.images?.[0]" :alt="item.name" />
            </div>
            <div class="list_content">
              <div class="text-sm">
                {{ item.name }}
              </div>
              <div class="line-clamp-2">
                {{ `${t('description')}: ${item.description || t('empty').toLowerCase()}` }},
                {{ `${t('price')}: ${item.price.toFixed(2)}$` }},
                {{ `${t('discountPrice')}: ${(item.discountPrice || 0).toFixed(2)}$` }},
              </div>
            </div>
            <div class="list_actions">
              <label class="switch mx-2">
                <input type="checkbox" :checked="item.enabled" @change="e => switchEnabled(e, item)">
                <span class="slider round"></span>
              </label>
              <div @click="doEdit(item)">
                <Icon name="hugeicons:edit-02"/>
              </div>
              <div class="error" @click="doRemove(item)">
                <Icon name="hugeicons:delete-04"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        {{ t('emptyList') }}
      </div>
    </div>

    <Modal v-model="showAddModal">
      <template #title>
        {{ t('admin.createProduct') }}
      </template>
      <div class="flex flex-col gap-2">
        <div>
          {{ t('admin.productImages') }}
        </div>
        <div class="overflow-y-hidden overflow-x-auto flex items-center gap-4">
          <div id="upload-trigger-create" :key="uploadKey" class="image_placeholder small">
            <div class="overlay" :class="uploading ? 'opacity-100' : 'opacity-0'">
              <i class="bx bx-loader-alt bx-spin text-4xl leading-none"/>
            </div>
            <Icon name="hugeicons:image-add-02" class="text-4xl font-bold"/>
          </div>
          <div v-for="(image, idx) in inputed.images"
               :key="`inputed-image-${idx}`"
               class="image_placeholder small">
            <div class="delete_button"
                 @click="deleteUpload(image)"
            >
              <i v-if="deletingUploads.includes(image)" class="bx bx-loader-alt bx-spin text-lg leading-none"/>
              <Icon v-else name="hugeicons:delete-02" />
            </div>
            <img :src="image" class="w-full h-full object-cover" alt="">
          </div>
        </div>
        <Upload trigger-el="upload-trigger-create"
                preview="upload-trigger-create"
                :key="uploadKey"
                type="product_image"
                @upload-ok="onUploaded"
                @upload-error="onUploadError"
                @uploading="uploading = true"/>
        <label for="name_input">
          {{ t('admin.productName') }}
        </label>
        <input type="text"
               id="name_input"
               v-model="inputed.name"
               :placeholder="t('input_text')"/>
        <label for="description_input">
          {{ t('description') }}
        </label>
        <textarea
            id="description_input"
            v-model="inputed.description"
            :placeholder="t('input_text')"/>
        <label for="brand_search_input">
          {{ t('brand') }}
        </label>
        <div class="flex items-center gap-2">
          <div v-if="inputed.brand" class="pill">
            <div class="icon">
              <img :src="inputed.brand.image" alt="">
            </div>
            <div class="name">
              {{ inputed.brand.name }}
            </div>
            <div class="close" @click="inputed.brand=null">
              <Icon name="hugeicons:cancel-01" />
            </div>
          </div>
          <input type="text"
                 id="brand_search_input"
                 class="flex-1"
                 :disabled="!!inputed.brand"
                 v-model="brandSearchString"
                 @change="searchBrand()"
                 :placeholder="t('input_to_search')"/>
        </div>
        <div v-if="!inputed.brand">
          <div v-if="brandSearchString.length">
            <div v-if="brands.length" class="search_pills">
              <div
                v-for="brand in brands"
                :key="`brand-search-${brand.id}`"
                class="search_pill"
                @click="selectBrand(brand)"
              >
                <div class="icon">
                  <img :src="brand.image" alt="">
                </div>
                <div class="name">
                  {{ brand.name }}
                </div>
              </div>
            </div>
            <div v-else>
              {{ t('brandsNotFound') }}
            </div>
          </div>
        </div>
        <label for="tags_input">
          {{ t('tags') }}
        </label>
        <div class="flex items-center gap-2 flex-wrap">
          <div v-for="(tag, idx) in inputed.tags" :key="`create-tag-${idx}`" class="pill small">
            <div class="icon">
              <Icon name="hugeicons:tag-01" />
            </div>
            {{ tag }}
            <div class="close" @click="removeTag(idx)">
              <Icon name="hugeicons:cancel-01" />
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <input type="text"
                 id="tags_input"
                 class="flex-1"
                 v-model="inputedTag"
                 @keyup.enter="addTag"
                 :placeholder="t('input_text')"/>
          <button :disabled="!inputedTag.length" @click="addTag">
            {{ t('add') }}
          </button>
        </div>
        <label for="price_input">
          {{ t('price') }}
        </label>
        <input type="text"
               id="price_input"
               v-model="inputed.price"
               :placeholder="t('input_number')"/>
        <label for="discount_price_input">
          {{ t('discountPrice') }}
        </label>
        <input type="text"
               id="discount_price_input"
               v-model="inputed.discountPrice"
               :placeholder="t('input_number')"/>
        <label for="balance_input">
          {{ t('productBalance') }}
        </label>
        <input type="number"
               id="balance_input"
               v-model="inputed.balance"
               :placeholder="t('input_number')"/>
      </div>
      <div class="confirm_buttons mt-6">
        <div @click="flushAllInputed">
          {{ t('cancel') }}
        </div>
        <div class="success" @click="add">
          {{ t('create') }}
        </div>
      </div>
    </Modal>

    <Modal v-model="showEditModal" @closed="flushInputed">
      <template #title>
        {{ t('admin.editProduct') }}
      </template>
      <div class="flex flex-col gap-2">
        <div>
          {{ t('admin.productImages') }}
        </div>
        <div class="overflow-y-hidden overflow-x-auto flex items-center gap-4">
          <div id="upload-trigger-patch" :key="uploadKey" class="image_placeholder small">
            <div class="overlay" :class="uploading ? 'opacity-100' : 'opacity-0'">
              <i class="bx bx-loader-alt bx-spin text-4xl leading-none"/>
            </div>
            <Icon name="hugeicons:image-add-02" class="text-4xl font-bold"/>
          </div>
          <div v-for="(image, idx) in inputed.images"
               :key="`inputed-image-${idx}`"
               class="image_placeholder small">
            <div class="delete_button"
                 @click="inputed.images = inputed.images.filter((i: string) => i !== image)"
            >
              <i v-if="deletingUploads.includes(image)" class="bx bx-loader-alt bx-spin text-lg leading-none"/>
              <Icon v-else name="hugeicons:delete-02" />
            </div>
            <img :src="image" class="w-full h-full object-cover" alt="">
          </div>
        </div>
        <Upload trigger-el="upload-trigger-patch"
                preview="upload-trigger-patch"
                :key="uploadKey"
                type="product_image"
                @upload-ok="onUploaded"
                @upload-error="onUploadError"
                @uploading="uploading = true"/>
        <label for="name_input">
          {{ t('admin.productName') }}
        </label>
        <input type="text"
               id="name_input"
               v-model="inputed.name"
               :placeholder="t('input_text')"/>
        <label for="description_input">
          {{ t('description') }}
        </label>
        <textarea
            id="description_input"
            v-model="inputed.description"
            :placeholder="t('input_text')"/>
        <label for="brand_search_input">
          {{ t('brand') }}
        </label>
        <div class="flex items-center gap-2">
          <div v-if="inputed.brand" class="pill">
            <div class="icon">
              <img :src="inputed.brand.image" alt="">
            </div>
            <div class="name">
              {{ inputed.brand.name }}
            </div>
            <div class="close" @click="inputed.brand=null">
              <Icon name="hugeicons:cancel-01" />
            </div>
          </div>
          <input type="text"
                 id="brand_search_input"
                 class="flex-1"
                 :disabled="!!inputed.brand"
                 v-model="brandSearchString"
                 @change="searchBrand()"
                 :placeholder="t('input_to_search')"/>
        </div>
        <div v-if="!inputed.brand">
          <div v-if="brandSearchString.length">
            <div v-if="brands.length" class="search_pills">
              <div
                  v-for="brand in brands"
                  :key="`brand-p-search-${brand.id}`"
                  class="search_pill"
                  @click="selectBrand(brand)"
              >
                <div class="icon">
                  <img :src="brand.image" alt="">
                </div>
                <div class="name">
                  {{ brand.name }}
                </div>
              </div>
            </div>
            <div v-else>
              {{ t('brandsNotFound') }}
            </div>
          </div>
        </div>
        <label for="tags_input">
          {{ t('tags') }}
        </label>
        <div class="flex items-center gap-2 flex-wrap">
          <div v-for="(tag, idx) in inputed.tags" :key="`update-tag-${idx}`" class="pill small">
            <div class="icon">
              <Icon name="hugeicons:tag-01" />
            </div>
            {{ tag }}
            <div class="close" @click="removeTag(idx)">
              <Icon name="hugeicons:cancel-01" />
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <input type="text"
                 id="tags_input"
                 class="flex-1"
                 v-model="inputedTag"
                 @keyup.enter="addTag"
                 :placeholder="t('input_text')"/>
          <button :disabled="!inputedTag.length" @click="addTag">
            {{ t('add') }}
          </button>
        </div>
        <label for="price_input">
          {{ t('price') }}
        </label>
        <input type="text"
               id="price_input"
               v-model="inputed.price"
               :placeholder="t('input_number')"/>
        <label for="discount_price_input">
          {{ t('discountPrice') }}
        </label>
        <input type="text"
               id="discount_price_input"
               v-model="inputed.discountPrice"
               :placeholder="t('input_number')"/>
        <label for="balance_input">
          {{ t('productBalance') }}
        </label>
        <input type="number"
               id="balance_input"
               v-model="inputed.balance"
               :placeholder="t('input_number')"/>
        <div>
          {{ t('category') }}
        </div>
        <div class="select">
          <select v-model="editingCategory">
            <option :value="null" selected disabled>{{ t('admin.selectCategory') }}</option>
            <option
              v-for="category in (categories.payload || [])"
              :key="`editing-cat-${category.id}`"
              :value="category"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
        <template v-if="editingCategory">
          <div>
            {{ t('subcategory') }}
          </div>
          <div class="select">
            <select v-model="editingSubcategory">
              <option :value="null" selected disabled>{{ t('admin.selectSubcategory') }}</option>
              <option
                  v-for="category in (editingCategory.categories || [])"
                  :key="`editing-subcategory-${category.id}`"
                  :value="category"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
        </template>
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
