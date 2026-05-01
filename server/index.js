import {createServer} from 'node:http'

const PORT = Number(process.env.PORT ?? 8787)
const MAX_ROOMS = 5000
const MAX_PLAYERS_IN_ROOM = 2

/** @type {Map<string, { board: Array<'cross' | 'circle' | null>, turn: 'cross' | 'circle', winner: 'cross' | 'circle' | 'draw' | null, sessions: Map<string, 'cross' | 'circle'>, streams: Set<import('node:http').ServerResponse> }>} */
const rooms = new Map()

function randomRoomId() {
  return Math.random().toString(36).slice(2, 8)
}

function sendSse(stream, payload) {
  stream.write(`data: ${JSON.stringify(payload)}\n\n`)
}

function ensureRoom(roomId) {
  if (rooms.has(roomId))
    return rooms.get(roomId)

  if (rooms.size >= MAX_ROOMS)
    return null

  const room = {
    sessions: new Map(),
    streams: new Set(),
    board: Array(9).fill(null),
    turn: 'cross',
    winner: null,
  }
  rooms.set(roomId, room)
  return room
}

function calcWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return board[a]
  }

  if (board.every(Boolean))
    return 'draw'

  return null
}

function broadcastState(room, roomId) {
  const payload = {
    type: 'state',
    roomId,
    board: room.board,
    turn: room.turn,
    winner: room.winner,
    players: room.sessions.size,
  }
  for (const stream of room.streams)
    sendSse(stream, payload)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url ?? '/', `http://${req.headers.host}`)

  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, {'content-type': 'text/plain'})
    res.end('XO online server is running\n')
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/join') {
    const body = JSON.parse(await readBody(req) || '{}')
    const roomId = (body.roomId ?? randomRoomId()).trim().toLowerCase()
    const sessionId = (body.sessionId ?? '').trim()
    if (!roomId || !sessionId) {
      res.writeHead(400, {'content-type': 'application/json'})
      res.end(JSON.stringify({message: 'Invalid room or session'}))
      return
    }

    const room = ensureRoom(roomId)
    if (!room) {
      res.writeHead(503, {'content-type': 'application/json'})
      res.end(JSON.stringify({message: 'Room limit reached'}))
      return
    }

    if (!room.sessions.has(sessionId) && room.sessions.size >= MAX_PLAYERS_IN_ROOM) {
      res.writeHead(403, {'content-type': 'application/json'})
      res.end(JSON.stringify({message: 'Room is full'}))
      return
    }

    if (!room.sessions.has(sessionId)) {
      const side = room.sessions.size === 0 ? 'cross' : 'circle'
      room.sessions.set(sessionId, side)
    }

    const side = room.sessions.get(sessionId)
    broadcastState(room, roomId)
    res.writeHead(200, {'content-type': 'application/json'})
    res.end(JSON.stringify({roomId, side}))
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/events') {
    const roomId = (url.searchParams.get('roomId') ?? '').trim().toLowerCase()
    if (!roomId || !rooms.has(roomId)) {
      res.writeHead(404)
      res.end()
      return
    }

    const room = rooms.get(roomId)
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
    })
    room.streams.add(res)
    broadcastState(room, roomId)

    req.on('close', () => {
      room.streams.delete(res)
    })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/move') {
    const body = JSON.parse(await readBody(req) || '{}')
    const {roomId, sessionId, index} = body
    const roomKey = (roomId ?? '').trim().toLowerCase()
    const room = rooms.get(roomKey)

    if (!room || typeof index !== 'number' || index < 0 || index > 8) {
      res.writeHead(400)
      res.end()
      return
    }

    const side = room.sessions.get(sessionId)
    if (!side || room.turn !== side || room.winner || room.board[index]) {
      res.writeHead(200)
      res.end()
      return
    }

    room.board[index] = side
    room.winner = calcWinner(room.board)
    if (!room.winner)
      room.turn = side === 'cross' ? 'circle' : 'cross'

    broadcastState(room, roomKey)
    res.writeHead(200)
    res.end()
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/reset') {
    const body = JSON.parse(await readBody(req) || '{}')
    const roomId = (body.roomId ?? '').trim().toLowerCase()
    const room = rooms.get(roomId)
    if (!room) {
      res.writeHead(404)
      res.end()
      return
    }

    room.board = Array(9).fill(null)
    room.turn = 'cross'
    room.winner = null
    broadcastState(room, roomId)
    res.writeHead(200)
    res.end()
    return
  }

  res.writeHead(404)
  res.end()
})

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`XO online server listening on ${PORT}`)
})
