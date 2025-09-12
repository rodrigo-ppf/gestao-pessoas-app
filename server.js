const express = require('express');
const path = require('path');
const app = express();

// Servir arquivos estáticos da pasta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Rota para todas as páginas (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
