<script setup lang="ts">
const emit = defineEmits(['opened', 'closed'])
const model = defineModel()
const props = defineProps({
  hideMd: Boolean,
  fullscreen: Boolean,
  simple: Boolean,
  dark: Boolean,
  showClose: Boolean
})
const {hideMd, fullscreen, simple, dark, showClose} = toRefs(props)
const overlayClasses = computed(() => {
  return `${hideMd.value ? 'md:opacity-0 md:z-[-1] md:pointer-events-none' : ''}`
})
const containerClasses = computed(() => {
  return `${showClose.value ? 'relative' : ''} ${hideMd.value ? 'md:opacity-0 md:z-[-1] md:pointer-events-none' : ''} ${fullscreen.value ? 'fullscreen' : ''} ${simple.value ? 'simple secondary_bg_color' : ''}`
})
</script>

<template>
  <Transition name="fade">
    <div v-if="model" class="modal-overlay" :class="overlayClasses"/>
  </Transition>
  <Transition name="slide" appear @after-enter="emit('opened')" @after-leave="emit('closed')">
    <div v-if="model" class="modal-container-wrapper" :class="fullscreen ? 'fullscreen' : ''" @click="model=!model">
      <div class="modal-container" :class="containerClasses" :style="dark ? 'background-color: #191B22;' : ''"
           @click.stop>
        <button v-if="showClose" class="absolute top-6 right-6 transition opacity-60 hover:opacity-100"
                @click.stop="model=false">
          <i class="ri-close-large-line"/>
        </button>
        <div class="modal-title" :class="fullscreen ? 'fullscreen' :''">
          <div class="flex-1">
            <slot name="title"/>
          </div>
          <div v-show="fullscreen && !simple" class="modal-close" @click="model=false">
            <i class="ri-close-large-line"/>
          </div>
          <div v-show="fullscreen && simple" @click="model=false"
               class="cursor-pointer hint_color font-normal text-base hover:text_color">
            Отмена
          </div>
        </div>
        <div class="modal-inner" :class="fullscreen ? 'fullscreen' : ''">
          <slot/>
        </div>
      </div>
    </div>
  </Transition>
</template>
