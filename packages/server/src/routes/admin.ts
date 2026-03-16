import express, { Router } from "express";
import { criarEvento, listarEventos } from "../controllers/adminController";

export const router: Router = express.Router();

router.get("/eventos", listarEventos);

router.post("/eventos", criarEvento);
