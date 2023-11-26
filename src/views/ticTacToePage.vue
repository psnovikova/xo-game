<script setup lang="ts">
import {computed, ref, watch} from "vue";
import ConfettiExplosion from "vue-confetti-explosion";
import ReloadSvg from "../assets/reload.svg"
import SwitchMode from "./components/SwitchMode.vue";

type FigureType = 'circle' | 'cross'
type ModeType = 'pve' | 'pvp'

const WIN_COMBINATIONS = [
  [1, 2, 3],
  [1, 4, 7],
  [1, 5, 9],
  [2, 5, 8],
  [3, 6, 9],
  [3, 5, 7],
  [4, 5, 6],
  [7, 8, 9],
]

interface cellParam {
  id: number,
  isClicked: boolean
  figure: FigureType | null
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

const lastSelectedFigure = ref<FigureType>('cross')
const selectedMode = ref<ModeType>('pve')
const isDisabledClick = ref(false)

const isWinCombination = computed(() => {

  if (cellData.value.filter(cell => cell.isClicked).length < 5) return false
  else {
    const circleCells = cellData.value.filter(cell => cell.isClicked && cell.figure === 'circle').map(cell => cell.id)
    const crossCells = cellData.value.filter(cell => cell.isClicked && cell.figure === 'cross').map(cell => cell.id)

    const isCircleWin = WIN_COMBINATIONS.some(combination => {
      return combination.every(cell => circleCells.includes(cell) && combination)
    })

    const isCrossWin = WIN_COMBINATIONS.some(combination => {
      return combination.every(cell => crossCells.includes(cell))
    })

    if (isCircleWin) {
      return WIN_COMBINATIONS.find(combination => {
        return combination.every(cell => circleCells.includes(cell))
      })
    }

    if (isCrossWin) {
      return WIN_COMBINATIONS.find(combination => {
        return combination.every(cell => crossCells.includes(cell))
      })
    }
  }
})

function isCouldBeWinCombination(cells: number[]) {
  const preWinCombination = WIN_COMBINATIONS.find(combination => {
    return combination.filter(cell => cells.includes(cell)).length === 2
        && combination.find(cell => cellData.value.find(cellData => cellData.id === cell)?.isClicked === false)
  })
  return preWinCombination ?? false
}

function findWinCell(cell: number) {
  const cellCombination = WIN_COMBINATIONS.find(combination => {
    return combination.includes(cell) && combination.filter(cell => cellData.value.find(cellData => cellData.id === cell)?.isClicked === false).length === 2
  })
  if (cellCombination) {
    const emptyCells = cellCombination.filter(cell => cellData.value.find(cellData => cellData.id === cell)?.isClicked === false)
    const randomEmptyCell = Math.floor(Math.random() * emptyCells.length)
    return emptyCells[randomEmptyCell]
  } else return false
}

async function playAgainstHuman() {
  if (isWinCombination.value) return
  const emptyCells = cellData.value.filter(cell => !cell.isClicked) as cellParam[]
  if (emptyCells.length === 0) return
  else {
    isDisabledClick.value = true
    setTimeout(() => {
      isDisabledClick.value = false
      if (emptyCells.length === 8) {
        if (emptyCells.find(cell => cell.id === 5)) {
          cellClicked(emptyCells.find(cell => cell.id === 5) as cellParam)
          return
        } else {
          const cornerCellsIds = [1, 3, 7, 9]
          const randomCornerCell = Math.floor(Math.random() * cornerCellsIds.length)
          cellClicked(emptyCells.find(cell => cell.id === cornerCellsIds[randomCornerCell]) as cellParam)
          return
        }

      } else if (emptyCells.length === 6) {
        const circleCells = cellData.value.filter(cell => cell.figure === 'circle').map(cell => cell.id)
        const preWinCombination = isCouldBeWinCombination(circleCells)
        if (preWinCombination) {
          const cellToClick = emptyCells.find(cell => preWinCombination.includes(cell.id))
          cellClicked(cellToClick as cellParam)
          return
        } else {
          const crossCell = cellData.value.find(cell => cell.figure === 'cross')
          if (crossCell && findWinCell(crossCell.id)) {
            const cellToClick = cellData.value.find(cell => cell.id === findWinCell(crossCell.id)) ?? emptyCells[0]
            cellClicked(cellToClick as cellParam)
            return
          }
        }
      } else if (emptyCells.length === 4) {
        const crossCells = cellData.value.filter(cell => cell.figure === 'cross').map(cell => cell.id)
        const preWinCombination = isCouldBeWinCombination(crossCells)
        if (preWinCombination) {
          const cellToClick = emptyCells.find(cell => preWinCombination.includes(cell.id))
          cellClicked(cellToClick as cellParam)
          return
        } else {
          const circleCells = cellData.value.filter(cell => cell.figure === 'circle').map(cell => cell.id)
          const preWinCombination = isCouldBeWinCombination(circleCells)
          if (preWinCombination) {
            const cellToClick = emptyCells.find(cell => preWinCombination.includes(cell.id))
            cellClicked(cellToClick as cellParam)
            return
          } else {
            const crossCells = cellData.value.filter(cell => cell.figure === 'cross').map(cell => cell.id)
            for (let i = 0; i < crossCells.length; i++) {
              if (findWinCell(crossCells[i])) {
                cellClicked(cellData.value.find(cell => cell.id === findWinCell(crossCells[i])) as cellParam)
                return
              }
            }
          }
        }

      } else if (emptyCells.length === 2) {
        const crossCells = cellData.value.filter(cell => cell.figure === 'cross').map(cell => cell.id)
        const preWinCombination = isCouldBeWinCombination(crossCells)
        if (preWinCombination) {
          const cellToClick = emptyCells.find(cell => preWinCombination.includes(cell.id))
          cellClicked(cellToClick as cellParam)
          return
        } else {
          const circleCells = cellData.value.filter(cell => cell.figure === 'circle').map(cell => cell.id)
          const preWinCombination = isCouldBeWinCombination(circleCells)
          if (preWinCombination) {
            const cellToClick = emptyCells.find(cell => preWinCombination.includes(cell.id))
            cellClicked(cellToClick as cellParam)
            return
          } else {
            const crossCells = cellData.value.filter(cell => cell.figure === 'cross').map(cell => cell.id)
            for (let i = 0; i < crossCells.length; i++) {
              if (findWinCell(crossCells[i])) {
                cellClicked(cellData.value.find(cell => cell.id === findWinCell(crossCells[i])) as cellParam)
                return
              }
            }
          }
        }
      }
    }, 400)
  }
}

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
  lastSelectedFigure.value = 'cross'
  isDisabledClick.value = false
}

watch(selectedMode, () => {
  reload()
})

watch(lastSelectedFigure, () => {
  if (selectedMode.value === 'pve' && lastSelectedFigure.value === 'circle') {
    playAgainstHuman()
  }
})
</script>

<template>
  <div class="w-screen h-screen bg-[#FAD074] overflow-hidden">
    <div class="relative w-full h-full flex justify-center items-center">
      <div
          class="grid-container grid grid-rows-3 grid-cols-3 justify-center items-center gap-0 sm:w-[30rem] sm:h-[30rem]
          w-[20rem] h-[20rem]"
      >
        <button
            v-for="param in cellData"
            :key="param.id"
            :disabled="isDisabledClick || param.isClicked || !!isWinCombination"
            class="w-full h-full flex items-center justify-center duration-200"
            :class="{ 'hover:bg-[#8DC089]': !param.isClicked && !isWinCombination && !isDisabledClick}"
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
      <div class="absolute top-2 right-2 flex flex-row space-x-2">
        <SwitchMode v-model="selectedMode"/>
        <button
            @click="reload"
            class="p-2 rounded-sm hover:bg-[#8DC089]"
        >
          <img
              :src="ReloadSvg"
              alt="reload"
              class="w-8 h-8"
          />
        </button>
      </div>
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
