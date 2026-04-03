import express, { Router } from "express";
import { criarCongregacao, criarEvento, listarCongregacoes, listarEventos } from "../controllers/adminController";

export const router: Router = express.Router();

router.get("/eventos", listarEventos);

router.post("/eventos", criarEvento);

router.get("/congregacoes", listarCongregacoes);

router.post("/congregacao", criarCongregacao);

// router.patch("/congregacoes", atualizarCongregacao);

// router.delete("/congregacoes", deletarCongregacao);