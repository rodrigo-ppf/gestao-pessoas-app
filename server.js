const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Log de inicialização
console.log('🚀 Iniciando servidor...');
console.log(`📁 Diretório atual: ${__dirname}`);

// Estamos dentro da pasta dist, então servir arquivos do diretório atual
const currentPath = __dirname;
const publicPath = path.join(__dirname, 'public');

console.log(`📁 Diretório atual: ${currentPath}`);
console.log(`📁 Pasta public: ${publicPath} (existe: ${fs.existsSync(publicPath)})`);

// Servir arquivos estáticos do diretório atual (dist)
app.use(express.static(currentPath));
console.log('✅ Servindo arquivos do diretório atual');

// Servir arquivos estáticos da pasta public (fallback)
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  console.log('✅ Servindo arquivos da pasta public');
}

// Rota de health check
app.get('/health', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  const indexExists = fs.existsSync(indexPath);
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    currentPath: currentPath,
    indexExists: indexExists,
    files: fs.readdirSync(currentPath)
  });
});

// Rota para todas as páginas (SPA)
app.get('*', (req, res) => {
  console.log(`📄 Requisição para: ${req.url}`);
  
  // Se for uma rota da API ou health check, retornar 404
  if (req.url.startsWith('/api/') || req.url.startsWith('/health')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // Tentar servir index.html do diretório atual
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('📄 Servindo index.html do diretório atual');
    res.sendFile(indexPath);
    return;
  }
  
  // Tentar servir index.html da pasta public
  const publicIndexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(publicIndexPath)) {
    console.log('📄 Servindo index.html da pasta public');
    res.sendFile(publicIndexPath);
    return;
  }
  
  // Se não existe nenhum index.html, retornar página simples
  console.log('❌ Nenhum index.html encontrado, servindo página simples');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Gestão de Pessoas</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        .success { color: #2e7d32; background: #e8f5e8; padding: 15px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Gestão de Pessoas</h1>
        <div class="success">
          <strong>✅ Servidor Funcionando!</strong><br>
          O servidor Express está rodando corretamente no Google App Engine.
        </div>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Uptime:</strong> ${process.uptime()} segundos</p>
        <p><a href="/health">Verificar Status</a></p>
      </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Aplicação disponível!`);
});
