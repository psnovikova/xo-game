import {computed, onBeforeUnmount, ref} from 'vue'

type FigureType = 'circle' | 'cross'
type WinnerType = FigureType | 'draw' | null

interface OnlineStatePayload {
  type: 'state'
  roomId: string
  board: Array<FigureType | null>
  turn: FigureType
  winner: WinnerType
  players: number
}

export function useOnlinePvp() {
  const eventSource = ref<EventSource | null>(null)
  const sessionId = ref(localStorage.getItem('xo_session_id') ?? crypto.randomUUID())
  const roomId = ref('')
  const side = ref<FigureType>('cross')
  const board = ref<Array<FigureType | null>>(Array(9).fill(null))
  const turn = ref<FigureType>('cross')
  const winner = ref<WinnerType>(null)
  const players = ref(1)
  const isConnected = ref(false)
  const error = ref('')

  const roomLink = computed(() => {
    if (!roomId.value)
      return ''
    const url = new URL(window.location.href)
    url.searchParams.set('room', roomId.value)
    return url.toString()
  })

  const isWaitingOpponent = computed(() => players.value < 2)
  const isMyTurn = computed(() => side.value === turn.value)
  const apiBase = computed(() => {
    const host = window.location.hostname
    const port = import.meta.env.VITE_SOCKET_PORT ?? '8787'
    return `${window.location.protocol}//${host}:${port}`
  })

  function disconnect() {
    eventSource.value?.close()
    eventSource.value = null
    isConnected.value = false
  }

  async function connect(roomQuery: string) {
    disconnect()
    error.value = ''
    localStorage.setItem('xo_session_id', sessionId.value)

    const joinResponse = await fetch(`${apiBase.value}/api/join`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({roomId: roomQuery, sessionId: sessionId.value}),
    })

    if (!joinResponse.ok) {
      const body = await joinResponse.json().catch(() => ({message: 'Connection failed'}))
      error.value = body.message
      return
    }

    const joinData = await joinResponse.json() as {roomId: string, side: FigureType}
    roomId.value = joinData.roomId
    side.value = joinData.side

    const es = new EventSource(`${apiBase.value}/api/events?roomId=${encodeURIComponent(roomId.value)}`)
    eventSource.value = es

    es.onopen = () => {
      isConnected.value = true
    }

    es.onmessage = (event) => {
      const data = JSON.parse(event.data) as OnlineStatePayload
      board.value = data.board
      turn.value = data.turn
      winner.value = data.winner
      players.value = data.players
    }

    es.onerror = () => {
      error.value = 'Connection failed'
    }
  }

  async function sendMove(index: number) {
    if (!roomId.value)
      return
    await fetch(`${apiBase.value}/api/move`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({roomId: roomId.value, sessionId: sessionId.value, index}),
    })
  }

  async function resetOnlineGame() {
    if (!roomId.value)
      return
    await fetch(`${apiBase.value}/api/reset`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({roomId: roomId.value}),
    })
  }

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    board,
    connect,
    error,
    isConnected,
    isMyTurn,
    isWaitingOpponent,
    players,
    resetOnlineGame,
    roomId,
    roomLink,
    sendMove,
    side,
    turn,
    winner,
  }
}
