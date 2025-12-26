const cron = require('node-cron');
const { pool } = require('./db');
const { enviarMensagem } = require('./whatsapp');

cron.schedule('0 9 1 * *', async () => {
  const { rows } = await pool.query(`
    SELECT u.nome, SUM(g.valor) total
    FROM gastos g
    JOIN usuarios u ON u.id = g.usuario_id
    WHERE DATE_TRUNC('month', g.data) =
          DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    GROUP BY u.nome
  `);

  let msg = '📊 Relatório Mensal\n\n';
  rows.forEach(r => {
    msg += `👤 ${r.nome}: R$ ${r.total}\n`;
  });

  const usuarios = await pool.query('SELECT telefone FROM usuarios');
  for (const u of usuarios.rows) {
    await enviarMensagem(u.telefone, msg);
  }
});
