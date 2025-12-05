// server.ts

import express from "express";
import gameRoutes from "./routes/gameRoutes";
import path from "path";
import cors from "cors"; // <-- PASSO 1: Importa o CORS

const app = express();
const port = 3000;

app.use(cors()); // <-- PASSO 2: Usa o middleware CORS (permite comunicação Front/Back)
app.use(express.json());
app.use("/game", gameRoutes); // Rotas da sua API (POST /game/start, etc.)

// PASSO 3: Serve os arquivos estáticos (index.html, front.js, style.css)
// **CRÍTICO:** Seu Frontend (index.html, front.js, style.css) DEVE estar dentro da pasta 'public'
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});