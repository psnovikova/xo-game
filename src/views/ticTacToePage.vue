<script setup lang="ts">
import {computed, ref} from "vue";
import ConfettiExplosion from "vue-confetti-explosion";
import ReloadSvg from "../assets/reload.svg"

type FigerType = 'circle' | 'cross'

interface cellParam {
  id: number,
  isClicked: boolean
  figure: FigerType | null
}

const cellData = ref<cellParam[]>([
  {id: 1, isClicked: false, figure: null},
  {id: 2, isClicked: false, figure: null},
  {id: 3, isClicked: false, figure: null},
  {id: 4, isClicked: false, figure: null},
  {id: 5, isClicked: false, figure: null},
  {id: 6, isClicked: false, figure: null},
  {id: 7, isClicked: false, figure: null},
  {id: 8, isClicked: false, figure: null},
  {id: 9, isClicked: false, figure: null},
])

const lastSelectedFigure = ref<FigerType>('cross')

const isWinCombination = computed(() => {
  const winCombinations = [
    [1, 2, 3],
    [1, 4, 7],
    [1, 5, 9],
    [2, 5, 8],
    [3, 6, 9],
    [3, 5, 7],
    [4, 5, 6],
    [7, 8, 9],
  ]

  if (cellData.value.filter(cell => cell.isClicked).length < 5) return false
  else {
    const circleCells = cellData.value.filter(cell => cell.isClicked && cell.figure === 'circle').map(cell => cell.id)
    const crossCells = cellData.value.filter(cell => cell.isClicked && cell.figure === 'cross').map(cell => cell.id)

    const isCircleWin = winCombinations.some(combination => {
      return combination.every(cell => circleCells.includes(cell) && combination)
    })

    const isCrossWin = winCombinations.some(combination => {
      return combination.every(cell => crossCells.includes(cell))
    })

    if (isCircleWin) {
      return winCombinations.find(combination => {
        return combination.every(cell => circleCells.includes(cell))
      })
    }

    if (isCrossWin) {
      return winCombinations.find(combination => {
        return combination.every(cell => crossCells.includes(cell))
      })
    }
  }
})


function cellClicked(param: cellParam) {
  param.isClicked = true
  lastSelectedFigure.value = lastSelectedFigure.value === 'cross' ? 'circle' : 'cross'
  param.figure = lastSelectedFigure.value
}

function reload() {
  cellData.value = cellData.value.map(cell => {
    cell.isClicked = false
    cell.figure = null
    return cell
  })
}
</script>

<template>
  <div class="w-screen h-screen bg-[#FAD074] overflow-hidden">
    <div class="relative w-full h-full flex justify-center items-center">
      <div
          class="grid-container grid grid-rows-3 grid-cols-3 justify-center items-center gap-0 w-[30rem] h-[30rem]"
      >
        <button
            v-for="param in cellData"
            :key="param.id"
            :disabled="param.isClicked || !!isWinCombination"
            class="w-full h-full flex items-center justify-center duration-200"
            :class="{ 'hover:bg-[#8DC089]': !param.isClicked && !isWinCombination}"
            @click="cellClicked(param)"
        >
          <span
              v-if="param.isClicked && param.figure === 'circle'"
              class="circle w-[8rem] h-[8rem] border-8 border-[#FF6933] rounded-full"
              :class="{'spin': isWinCombination && isWinCombination.includes(param.id)}"
          />
          <span v-if="param.isClicked && param.figure === 'cross'"
                class="w-[8rem] h-[8rem] relative"
                :class="{'spin': isWinCombination && isWinCombination.includes(param.id)}"
          >
            <span class="absolute w-full h-2 rotate-45 bg-[#2D4628] top-1/2 left-0"/>
            <span class="absolute w-full h-2 -rotate-45 bg-[#2D4628] top-1/2 left-0"/>
          </span>
        </button>
      </div>
      <span class="absolute top-1/2 right-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <ConfettiExplosion v-if="isWinCombination"/>
      </span>
      <button
          @click="reload"
          class="absolute top-2 right-2 p-2 rounded-lg hover:bg-[#8DC089]"
      >
        <img
            :src="ReloadSvg"
            alt="reload"
            class="w-8 h-8"
        />
      </button>
    </div>
  </div>
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

.circle {
  transition: transform 0.5s ease-in-out;
}

.circle:hover {
  transform: rotate(360deg);
}

.spin {
  animation: spin 4s linear infinite;
}

@keyframes spin {
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(360deg);
  }
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
