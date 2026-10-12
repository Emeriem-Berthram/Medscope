/* Room-based play (Challenge Room and Battle Room).
   Demo mode: room state lives in localStorage, so rooms work
   on this device for the demo. Swap the storage layer for
   Supabase Realtime for real multi-device play. */

export interface RoomPlayer {
  name: string;
  score: number;
  answered: number;
  correct: number;
}

export interface Room {
  code: string;
  kind: "challenge" | "battle";
  title: string;
  topic: string;
  exam: string;
  faculty: string;
  questionCount: number;
  secondsPerQuestion: number;
  host: string;
  players: RoomPlayer[];
  status: "waiting" | "live" | "finished";
  scheduledFor?: string;
  visibility: "public" | "private";
  currentQuestion: number;
  createdAt: number;
}

function key(code: string): string {
  return `medscope_room_${code}`;
}

export function generateCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createRoom(room: Room): Room {
  localStorage.setItem(key(room.code), JSON.stringify(room));
  if (room.kind === "battle" && room.visibility === "public") {
    const list = listBattles();
    list.unshift(room.code);
    localStorage.setItem("medscope_battle_list", JSON.stringify(list.slice(0, 50)));
  }
  return room;
}

export function getRoom(code: string): Room | null {
  try {
    const raw = localStorage.getItem(key(code));
    return raw ? (JSON.parse(raw) as Room) : null;
  } catch {
    return null;
  }
}

export function saveRoom(room: Room) {
  localStorage.setItem(key(room.code), JSON.stringify(room));
}

export function listBattles(): string[] {
  try {
    const raw = localStorage.getItem("medscope_battle_list");
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function listBattleRooms(): Room[] {
  return listBattles()
    .map((code) => getRoom(code))
    .filter((r): r is Room => r !== null && r.status !== "finished");
}

export function joinRoom(code: string, playerName: string): Room | null {
  const room = getRoom(code.toUpperCase().trim());
  if (!room) return null;
  if (room.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase())) {
    return room;
  }
  const maxPlayers = room.kind === "battle" ? 20 : 2;
  if (room.players.length >= maxPlayers) return null;
  room.players.push({ name: playerName, score: 0, answered: 0, correct: 0 });
  if (
    room.kind === "challenge" &&
    room.players.length === 2 &&
    room.status === "waiting"
  ) {
    room.status = "live";
  }
  saveRoom(room);
  return room;
}

export function answerInRoom(
  code: string,
  playerName: string,
  correct: boolean
): Room | null {
  const room = getRoom(code);
  if (!room) return null;
  const player = room.players.find((p) => p.name === playerName);
  if (!player) return null;
  player.score = Math.round((player.score + (correct ? 2 : -0.5)) * 10) / 10;
  player.answered += 1;
  if (correct) player.correct += 1;
  saveRoom(room);
  return room;
}
