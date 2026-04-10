import type { Party, Server, Connection } from "partykit/server";

export default class MogpolyRoom implements Server {
  constructor(readonly room: Party) {}

  onConnect(conn: Connection) {
    conn.send(JSON.stringify({ type: "connected", id: conn.id }));
  }

  onMessage(message: string, sender: Connection) {
    // placeholder — full game logic added in Task 5
  }

  onClose(conn: Connection) {
    // placeholder
  }
}
