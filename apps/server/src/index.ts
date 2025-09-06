import "dotenv/config";
import { auth } from "./lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
  GameSchema,
  ProjectGameSchema,
  type GameType,
  type ProjectGameType,
} from "./validation/game-validation-schema";
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

app.post("/create-project-game", async (c) => {
  const body: ProjectGameType = await c.req.json();

  const isValidated = ProjectGameSchema.safeParse(body);

  if (!isValidated.success) {
    return c.json(
      {
        message: "please provide the right input",
        errors: isValidated.error.message,
      },
      400
    );
  }

  // Create project first
  const newProject = await prisma.project.create({
    data: {
      projectName: body.project.projectName,
      description: body.project.description,
    },
  });

  // Generate game number
  function generate12DigitNumber() {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  }

  const gameNumber = generate12DigitNumber();

  // Create game associated with the project
  const newGame = await prisma.game.create({
    data: {
      gameName: `game-${gameNumber.toString()}`,
      gameType: body.game.gameType,
      imageUrls: body.game.imageUrls,
      hint: body.game.hint,
      time: body.game.time,
      answer: body.game.answer,
      projectId: newProject.Id,
    },
  });

  return c.json({
    message: "project and game created successfully",
    data: {
      project: newProject,
      game: newGame,
    },
  });
});

app.post("/create-game", async (c) => {
  const body: GameType = await c.req.json();

  const isValidated = GameSchema.safeParse(body);

  if (!isValidated.success) {
    return c.json(
      {
        message: "please provide the right input",
        errors: isValidated.error.message,
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

app.get("/games", async (c) => {
  try {
    const games = await prisma.game.findMany({
      include: {
        project: true,
      },
      orderBy: {
        Id: "desc",
      },
    });

    return c.json({
      message: "games fetched successfully",
      data: games,
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    return c.json(
      {
        message: "failed to fetch games",
        error: "Internal server error",
      },
      500
    );
  }
});

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
