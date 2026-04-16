import http from "http";

import cors, { type CorsOptions } from "cors";
import express from "express";
import { WebSocketServer, WebSocket } from "ws";

import { Message } from "#models/Messages.js";
import { User } from "#models/Users.js";
import userRoutes from "#routes/userRoutes.js";
import "#connection.js";
import type { Request, Response } from "express";

type LogoutBody = {
  _id: string;
  newMessages: Record<string, unknown>;
};

const HEARTBEAT_INTERVAL = 30_000;

const rooms = ["general", "tech", "finance", "crypto"] as const;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const corsOptions: CorsOptions = {};
app.use(cors(corsOptions));

app.use("/users", userRoutes);

const server = http.createServer(app);

const PORT = process.env.PORT_NUMBER;

const wss = new WebSocketServer({ server });

interface ClientInfo {
  currentRoom: string | null;
}

const clients = new Map<WebSocket, ClientInfo>();

function broadcast(data: unknown): void {
  const msg = JSON.stringify(data);
  for (const client of clients.keys()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

function broadcastToRoom(room: string, data: unknown): void {
  const msg = JSON.stringify(data);
  for (const [client, info] of clients.entries()) {
    if (info.currentRoom === room && client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

function broadcastExcept(senderWs: WebSocket, data: unknown): void {
  const msg = JSON.stringify(data);
  for (const client of clients.keys()) {
    if (client !== senderWs && client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

async function getLastMessagesFromRoom(room: string) {
  const roomMessages = await Message.aggregate([
    { $match: { to: room } },
    { $group: { _id: "$date", messagesByDate: { $push: "$$ROOT" } } },
  ]);
  return roomMessages;
}

function sortRoomMessagesByDate(messages: { _id: string }[]) {
  return messages.sort((a, b) => {
    const [aMonth, aDay, aYear] = a._id.split("/");
    const [bMonth, bDay, bYear] = b._id.split("/");
    const date1 = `${aYear}${aMonth}${aDay}`;
    const date2 = `${bYear}${bMonth}${bDay}`;
    return date1 < date2 ? -1 : 1;
  });
}

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

wss.on("connection", (ws: ExtendedWebSocket) => {
  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  clients.set(ws, { currentRoom: null });

  ws.on("message", async (raw) => {
    let parsed: { type: string; payload: Record<string, string> };

    try {
      parsed = JSON.parse(raw.toString()) as typeof parsed;
    } catch {
      console.error("Invalid JSON from client:", raw);
      return;
    }

    const { type, payload } = parsed;

    if (type === "new-user") {
      const members = await User.find();
      broadcast({ type: "new-user", payload: members });
    }

    if (type === "join-room") {
      const { newRoom } = payload;
      clients.set(ws, { currentRoom: newRoom });
      let roomMessages = await getLastMessagesFromRoom(newRoom);
      roomMessages = sortRoomMessagesByDate(roomMessages);
      ws.send(JSON.stringify({ type: "room-messages", payload: roomMessages }));
    }

    if (type === "message-room") {
      const { room, content, sender, time, date } = payload;
      await Message.create({ content, from: sender as any, time, date, to: room });
      let roomMessages = await getLastMessagesFromRoom(room);
      roomMessages = sortRoomMessagesByDate(roomMessages);
      broadcastToRoom(room, { type: "room-messages", payload: roomMessages });
      broadcastExcept(ws, { type: "notifications", payload: room });
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("WS error:", error);
    ws.terminate();
  });
});

const interval = setInterval(() => {
  for (const ws of clients.keys()) {
    const extWs = ws as ExtendedWebSocket;
    if (!extWs.isAlive) {
      extWs.terminate();
      continue;
    }
    extWs.isAlive = false;
    extWs.ping();
  }
}, HEARTBEAT_INTERVAL);

wss.on("close", () => {
  clearInterval(interval);
});


app.delete(
  "/logout",
  async (req: Request<{}, {}, LogoutBody>, res: Response) => {
    const { _id, newMessages } = req.body;

    const user = await User.findById(_id);
    if (!user) {
      res.status(404).send();
      return;
    }

    user.status = "offline";
    user.newMessages = newMessages;

    await user.save();

    const members = await User.find();
    broadcast({ type: "new-user", payload: members });

    res.status(200).send();
  }
);


app.get("/rooms", (_req, res) => {
  res.json(rooms);
});

server.listen(PORT, () => {
  console.log("Server started...");
});