const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// 🔹 GET - Verificação do Webhook (META)
app.get("/webhook", (req, res) => {
  const verifyToken = process.env.VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ Webhook verificado com sucesso");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// 🔹 POST - Receber mensagens do WhatsApp
app.post("/webhook", (req, res) => {
  console.log("📩 Mensagem recebida:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// 🔹 Health check
app.get("/", (req, res) => {
  res.send("🤖 Bot de gastos rodando");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

app.post("/webhook", (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  if (!message) {
    return res.sendStatus(200);
  }

  const from = message.from;
  const text = message.text?.body;

  console.log("📩 Mensagem recebida");
  console.log("De:", from);
  console.log("Texto:", text);

  res.sendStatus(200);
});

