<script setup lang="ts">
const id  = useId()
const model  = defineModel<number>()
const props = defineProps({
  size: {
    type: Number,
    default: 16
  },
  readonly: Boolean,
  val: {
    type: Number,
    default: 0
  }
})
const { size, readonly, val } = toRefs(props)
watch(val, () => {
  model.value = val.value || 0
})
onMounted(() => {
  if (val.value) {
    model.value = val.value || 0
  }
})
const starActive = (i: number) => {
  return i <= (model.value || 0)
}
const starClass = (i: number) => {
  return starActive(i) ? 'solar:star-bold-duotone' : 'solar:star-linear'
}
const starColor = (i: number) => {
  return starActive(i) ? 'text-accent-600' : ''
}
</script>

<template>
  <div v-if="readonly" class="flex gap-x-1">
    <div v-for="ii in 5" :key="`star-rating-ro-${id}-${ii}`" :style="`font-size:${size}px;`">
      <Icon v-if="starActive(ii)" name="solar:star-bold-duotone" class="text-accent-500" />
      <Icon v-else name="solar:star-linear" />
<!--      <Icon :name="starClass(ii)" :class="starColor(ii)" />-->
    </div>
  </div>
  <div v-else class="flex gap-x-1">
    <div v-for="i in 5" :key="`star-rating-${id}-${i}`" :style="`font-size:${size}px;`" @click="model = i">
      <Icon class="cursor-pointer" :class="starColor(i)" :name="starClass(i)" />
    </div>
  </div>
</template>
