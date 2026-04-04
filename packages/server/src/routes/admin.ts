import express, { Router } from "express";
import { criarCongregacao, criarEvento, listarCongregacoes, listarEventos, criarAdmin } from "../controllers/adminController";

export const router: Router = express.Router();

router.get("/eventos", listarEventos);

router.post("/eventos", criarEvento);

router.get("/congregacoes", listarCongregacoes);

router.post("/congregacao", criarCongregacao);

// rota para testar criação de usuários admin
router.post("/usuarios", criarAdmin);

// router.patch("/congregacoes", atualizarCongregacao);

// router.delete("/congregacoes", deletarCongregacao);