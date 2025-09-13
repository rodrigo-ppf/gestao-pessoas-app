const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

console.log('🚀 Iniciando servidor minimal...');
console.log(`📁 Diretório atual: ${__dirname}`);
console.log(`📁 Arquivos disponíveis:`, fs.readdirSync(__dirname));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check - MUITO IMPORTANTE para App Engine
app.get('/health', (req, res) => {
  console.log('🏥 Health check chamado');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dirname: __dirname,
    files: fs.readdirSync(__dirname)
  });
});

// Servir arquivos estáticos da pasta atual (dist)
app.use(express.static(__dirname, {
  index: ['index.html'],
  extensions: ['html', 'js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico']
}));

// Rota raiz - redirecionar para /login
app.get('/', (req, res) => {
  console.log('🔄 Redirecionando de / para /login');
  res.redirect(302, '/login');
});

// SPA routing - servir index.html para todas as outras rotas
app.get('*', (req, res) => {
  console.log(`📄 Requisição SPA para: ${req.url}`);
  
  const indexPath = path.join(__dirname, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log('✅ Servindo index.html para rota SPA:', req.url);
    res.sendFile(indexPath);
  } else {
    console.log('❌ index.html não encontrado em:', indexPath);
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Erro 404</title></head>
      <body>
        <h1>404 - Página não encontrada</h1>
        <p>index.html não encontrado em: ${indexPath}</p>
        <p>Arquivos disponíveis: ${fs.readdirSync(__dirname).join(', ')}</p>
        <p><a href="/health">Verificar Status</a></p>
      </body>
      </html>
    `);
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Servidor minimal rodando na porta ${PORT}`);
  console.log(`🏥 Health check disponível em: http://localhost:${PORT}/health`);
  console.log(`📁 Servindo arquivos de: ${__dirname}`);
  console.log(`📄 index.html existe: ${fs.existsSync(path.join(__dirname, 'index.html'))}`);
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
});