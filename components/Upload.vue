<script setup lang="ts">
const {notify} = useNotification()
const {t} = useI18n()

const emit = defineEmits<{
  (e: 'file-selected', value: File): void
  (e: 'uploading'): void
  (e: 'upload-ok', value: string): void
  (e: 'upload-error', value: Error): void
}>()
const props = defineProps({
  triggerEl: {
    type: String,
    required: true
  },
  preview: String,
  type: {
    required: true,
    type: String
  }
})
const {triggerEl, preview, type} = toRefs(props)
const fileUpload = ref()
const selectedFile: Ref<null | File> = ref(null)

onMounted(() => {
  const trigger = document.getElementById(triggerEl?.value)
  if (trigger) {
    trigger.addEventListener('click', onTriggerClick)
  }
})

onBeforeUnmount(() => {
  const trigger = document.getElementById(triggerEl?.value)
  if (trigger) {
    trigger.removeEventListener('click', onTriggerClick)
  }
})

const onTriggerClick = () => {
  fileUpload.value.click()
}
const clearPreviews = (): void => {
  if (preview?.value) {
    const oldP: NodeListOf<Element> = document.querySelectorAll(`#${preview.value}> .upload_preview`)
    oldP.forEach((node: Element): void => {
      node?.parentNode?.removeChild(node)
    })
  }
}
const onChange = (event: Event) => {
  const target: HTMLInputElement = event.target as HTMLInputElement
  if (target.files?.length) {
    if (target?.files[0].type.startsWith('image/') && preview?.value) {
      clearPreviews()
      const img: HTMLImageElement = document.createElement('img')
      img.classList.add('upload_preview')
      img.style.objectFit = 'contain'
      img.style.height = 'inherit'
      img.style.width = 'inherit'
      img.style.maxHeight = 'inherit'
      img.style.maxWidth = '100%'
      img.style.borderRadius = 'inherit'
      img.style.zIndex = '50'
      document.getElementById(preview.value)?.appendChild(img)
      const reader: FileReader = new FileReader()
      reader.onload = (function (aImg) {
        return function (i) {
          aImg.src = i.target?.result?.toString() || ''
        }
      })(img)
      reader.readAsDataURL(target?.files[0])
    }
    selectedFile.value = target.files[0]
    emit("file-selected", selectedFile.value)
    upload()
  }
}
const upload = (): void => {
  if (!selectedFile.value) return
  emit('uploading')
  $api('/uploads/sign-url', {
    method: 'post',
    body: JSON.stringify({
      filename: selectedFile.value.name,
      mime: selectedFile.value.type,
      type: type.value.toUpperCase()
    })
  }).then((res) => {
    if (!res?.payload?.uploadURL || !res?.payload?.publicURL) {
      notify({
        type: 'error',
        title: t('error'),
        text: t('admin.getUploadUrlInvalidResponse')
      })
      emit('upload-error', new Error('Failed to get upload URL'))
    } else {
      sendFile(res.payload.uploadURL, res?.payload?.publicURL)
    }
  }).catch(() => {
    notify({
      type: 'error',
      title: t('error'),
      text: t('admin.getUploadUrlError')
    })
  })
}
const sendFile = (uploadUrl: string, publicUrl: string): void => {
  if (!selectedFile.value || !uploadUrl || !publicUrl) return
  $fetch(uploadUrl, {
    method: 'put',
    headers: {
      'Content-Type': selectedFile.value.type
    },
    body: selectedFile.value
  }).then(() => {
    emit('upload-ok', publicUrl)
    clearPreviews()
  }).catch((err: Error) => {
    emit('upload-error', err)
  })
}
</script>

<template>
  <input class="hidden" type="file" ref="fileUpload" accept="image/*" @change="onChange"/>
</template>
