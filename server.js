const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Verificar se a pasta dist existe
const distPath = path.join(__dirname, 'dist');
console.log(`📁 Verificando pasta dist: ${distPath}`);
console.log(`📁 Pasta dist existe: ${fs.existsSync(distPath)}`);

if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log(`📄 Arquivos na pasta dist: ${files.join(', ')}`);
} else {
  console.log('❌ Pasta dist não existe!');
}

// Servir arquivos estáticos da pasta dist
app.use(express.static(distPath, {
  maxAge: '1d',
  etag: true
}));

// Rota de health check
app.get('/health', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  const indexExists = fs.existsSync(indexPath);
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    distPath: distPath,
    indexExists: indexExists,
    distFiles: fs.existsSync(distPath) ? fs.readdirSync(distPath) : []
  });
});

// Rota para todas as páginas (SPA)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log(`Servindo index.html para: ${req.url}`);
  console.log(`Caminho do index.html: ${indexPath}`);
  console.log(`index.html existe: ${fs.existsSync(indexPath)}`);
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html não encontrado!');
    res.status(500).send(`
      <h1>Erro: index.html não encontrado</h1>
      <p>O arquivo index.html não foi gerado durante o build.</p>
      <p>Caminho esperado: ${indexPath}</p>
      <p>Pasta dist existe: ${fs.existsSync(distPath)}</p>
      <p>Arquivos na pasta dist: ${fs.existsSync(distPath) ? fs.readdirSync(distPath).join(', ') : 'N/A'}</p>
    `);
    return;
  }
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Erro ao servir index.html:', err);
      res.status(500).send('Erro interno do servidor');
    }
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📁 Servindo arquivos estáticos de: ${distPath}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
});
