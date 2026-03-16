import express, { Router } from "express";
import { health } from "../health";

export const router: Router = express.Router();

router.get("/healthcheck", async (req, res) => {
  const status = health.eSaudavel() ? 200 : 503;
  res.status(status).json(health.toJSON());
});
