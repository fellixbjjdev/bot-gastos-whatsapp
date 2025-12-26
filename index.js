require('dotenv').config();
const express = require('express');
const { pool, initDB } = require('./db');
const { enviarMensagem } = require('./whatsapp');
require('./relatorio');

const app = express();
app.use(express.json());

initDB();

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    return res.send(req.query['hub.challenge']);
  }
  res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return res.sendStatus(200);

  const texto = msg.text.body.toLowerCase();
  const telefone = msg.from;

  let user = await pool.query(
    'SELECT * FROM usuarios WHERE telefone=$1',
    [telefone]
  );

  if (user.rowCount === 0) {
    await pool.query(
      'INSERT INTO usuarios (nome, telefone) VALUES ($1,$2)',
      ['Usuário', telefone]
    );
    await enviarMensagem(telefone, '👋 Bot de gastos ativo!\nUse: /gasto 50 mercado');
    return res.sendStatus(200);
  }

  const usuarioId = user.rows[0].id;

  if (texto.startsWith('/gasto')) {
    const partes = texto.split(' ');
    const valor = parseFloat(partes[1]);
    const categoria = partes[2];
    const descricao = partes.slice(3).join(' ');

    await pool.query(
      'INSERT INTO gastos (usuario_id, valor, categoria, descricao) VALUES ($1,$2,$3,$4)',
      [usuarioId, valor, categoria, descricao]
    );

    await enviarMensagem(
      telefone,
      `✅ Gasto registrado\n💰 R$ ${valor}\n📂 ${categoria}`
    );
  }

  if (texto === '/total') {
    const total = await pool.query(`
      SELECT SUM(valor) FROM gastos
      WHERE DATE_TRUNC('month', data) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    await enviarMensagem(
      telefone,
      `💰 Total do mês: R$ ${total.rows[0].sum || 0}`
    );
  }

  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () =>
  console.log('🤖 Bot rodando...')
);
