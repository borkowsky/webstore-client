<script setup lang="ts">
const {t} = useI18n()
const id = useId()
const emit = defineEmits(['to-page']);
const props = defineProps({
  pages: {
    type: Number,
    required: true
  },
  currentPage: {
    type: Number,
    required: true
  }
})
const {pages, currentPage} = toRefs(props)
</script>

<template>
  <div class="pagination">
    <div class="pagination_arrow" :class="currentPage > 1 ? '' : 'disabled'" @click="emit('to-page', currentPage - 1)">
      <Icon name="hugeicons:arrow-left-02" />
      {{ t('prev') }}
    </div>
    <div v-if="currentPage !== 1" class="pagination_item" @click="emit('to-page', 1)">
      1
    </div>
    <div v-if="currentPage - 3 > 1" class="pagination_item disabled">
      ...
    </div>
    <div v-if="currentPage - 2 > 1" class="pagination_item" @click="emit('to-page', currentPage - 2)">
      {{ currentPage - 2 }}
    </div>
    <div v-if="currentPage - 1 > 1" class="pagination_item" @click="emit('to-page', currentPage - 1)">
      {{ currentPage - 1 }}
    </div>
    <div class="pagination_item active">
      {{ currentPage }}
    </div>
    <div v-if="currentPage < pages" class="pagination_item" @click="emit('to-page', currentPage + 1)">
      {{ currentPage + 1 }}
    </div>
    <div v-if="currentPage + 1 < pages" class="pagination_item" @click="emit('to-page', currentPage + 2)">
      {{ currentPage + 2 }}
    </div>
    <div v-if="currentPage + 3 < pages" class="pagination_item disabled">
      ...
    </div>
    <div v-if="currentPage + 2 < pages" class="pagination_item" @click="emit('to-page', pages)">
      {{ pages }}
    </div>
    <div class="pagination_arrow" :class="currentPage === pages ? 'disabled' : ''" @click="emit('to-page', currentPage + 1)">
      {{ t('next') }}
      <Icon name="hugeicons:arrow-right-02" />
    </div>
  </div>
</template>
