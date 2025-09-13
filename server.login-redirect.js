const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

console.log('🚀 Iniciando servidor com redirecionamento para login...');
console.log(`📁 Diretório atual: ${__dirname}`);

// Servir arquivos estáticos do diretório atual
app.use(express.static(__dirname));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dirname: __dirname,
    files: fs.readdirSync(__dirname)
  });
});

// Rota raiz - redirecionar para /login
app.get('/', (req, res) => {
  console.log('🔄 Redirecionando de / para /login');
  res.redirect('/login');
});

// SPA routing - servir index.html para todas as outras rotas
app.get('*', (req, res) => {
  console.log(`📄 Requisição para: ${req.url}`);
  
  const indexPath = path.join(__dirname, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log('✅ Servindo index.html para rota:', req.url);
    res.sendFile(indexPath);
  } else {
    console.log('❌ index.html não encontrado');
    res.status(404).send('index.html not found');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔄 Redirecionamento automático: / → /login`);
});
