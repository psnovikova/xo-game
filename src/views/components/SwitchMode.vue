<script setup lang="ts">
import {useVModel} from '@vueuse/core'
import {computed} from "vue";

const prop = defineProps<{
  modelValue: 'pve' | 'pvp'
}>()

const emit = defineEmits<{
  'update:modelValue': ['pve' | 'pvp']
}>()

const selectedMode = useVModel(prop, 'modelValue', emit)
const modes = ['PvE', 'PvP']

const isSelectedMode = computed(() => (mode: string) => {
  return mode.toLowerCase() === selectedMode.value.toLowerCase()
})

function changeMode(mode: string) {
  selectedMode.value = mode.toLowerCase()
}
</script>

<template>
  <div class="flex flex-row text-2xl">
    <button
        v-for="(mode, key) in modes"
        :key="key"
        class="p-2 rounded-sm hover:bg-[#FFA570] duration-200"
        :class="{'bg-[#E83100] hover:bg-[#E83100] cursor-default text-[#FAD074]': isSelectedMode(mode)}"
        @click="changeMode(mode)"
    >
      {{ mode }}
    </button>
  </div>
</template>
