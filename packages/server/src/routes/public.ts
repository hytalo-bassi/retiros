import express, { Router } from "express";
import { inscreverSe, pegarEvento } from "../controllers/publicController";

export const router: Router = express.Router();

router.get("/inscricao", pegarEvento);

router.get("/inscricao/:slug", pegarEvento);

router.post("/inscricao/:slug", inscreverSe);