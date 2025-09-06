import "dotenv/config";
import { auth } from "./lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { GameSchema, type GameType } from "./validation/game-validation-schema";
import prisma from "../prisma/index";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: process.env.CORS_ORIGIN || "",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.post("/create-game", async (c) => {
  const body: GameType = await c.req.json();

  const isValidated = GameSchema.safeParse(body);

  if (!isValidated.success) {
    return c.json(
      {
        message: "please provide the right input",
      },
      400
    );
  }

  function generate12DigitNumber() {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  }

  const gameNumber = await generate12DigitNumber();

  const newGame = await prisma.game.create({
    data: {
      gameName: `game-${gameNumber.toString()}`,
      gameType: body.gameType,
      imageUrls: body.imageUrls,
      hint: body.hint,
      time: body.time,
      answer: body.answer,
    },
  });

  return c.json({
    message: "game created successfully",
    data: newGame,
  });
});

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
