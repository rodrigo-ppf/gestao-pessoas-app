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

// Servir arquivos estáticos da pasta atual (dist)
app.use(express.static(__dirname));

// Health check
app.get('/health', (req, res) => {
  console.log('🏥 Health check chamado');
  try {
    const response = { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      dirname: __dirname,
      files: fs.readdirSync(__dirname),
      message: 'Servidor funcionando perfeitamente'
    };
    console.log('✅ Health check response:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ Erro no health check:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Rota raiz - redirecionar para /login
app.get('/', (req, res) => {
  console.log('🔄 Redirecionando de / para /login');
  res.redirect(302, '/login');
});

// SPA routing - servir index.html para todas as outras rotas
app.get('/*', (req, res) => {
  console.log(`📄 Requisição para: ${req.url}`);
  
  try {
    const indexPath = path.join(__dirname, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      console.log('✅ Servindo index.html para rota:', req.url);
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
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('❌ Erro ao servir arquivo:', error);
    res.status(500).send('Erro interno do servidor');
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