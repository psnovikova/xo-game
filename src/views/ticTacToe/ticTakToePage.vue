<script setup lang="ts">
import {ref} from "vue";

interface cellParam {
  id: number,
  isClicked: boolean
}

const cellData = ref<cellParam[]>([
  {id: 1, isClicked: false},
  {id: 2, isClicked: false},
  {id: 3, isClicked: false},
  {id: 4, isClicked: false},
  {id: 5, isClicked: false},
  {id: 6, isClicked: false},
  {id: 7, isClicked: false},
  {id: 8, isClicked: false},
  {id: 9, isClicked: false},
])

function cellClicked(param: cellParam) {
  param.isClicked = true
}
</script>

<template>
  <div class="w-screen h-screen bg-[#FAD074] overflow-hidden">
    <div class="w-full h-full flex justify-center items-center">
      <div class="grid-container grid grid-rows-3 grid-cols-3 justify-center items-center gap-0 w-[30rem] h-[30rem]">
        <button
            v-for="param in cellData"
            :key="param.id"
            class="w-full h-full flex items-center justify-center"
            :class="{ 'hover:bg-[#FFA570]': !param.isClicked}"
            @click="cellClicked(param)"
        >
          <canvas
              v-if="param.isClicked"
              class="circle w-[8rem] h-[8rem] border-2 border-[#FF6933] rounded-full"
          />
        </button>
      </div>
    </div>
  </div>
  e
</template>

<style scoped>
.grid-container > button:nth-child(-n + 3) {
  border-bottom: 4px solid #E83100;
}

.grid-container > button:nth-child(n + 7) {
  border-top: 4px solid #E83100;
}

.grid-container > button:nth-child(3n + 1) {
  border-right: 4px solid #E83100;
}

.grid-container > button:nth-child(3n) {
  border-left: 4px solid #E83100;
}

.grid-container > button {
  opacity: 0;
  transform: scale(0.5);
  animation: show 2s ease-out forwards;
}

.circle {
  animation: draw 2s ease-in-out;
}

@keyframes show {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes draw {
  from {
    stroke-dashoffset: 314;
  }
  to {
    stroke-dashoffset: 0;
  }
}
</style>
