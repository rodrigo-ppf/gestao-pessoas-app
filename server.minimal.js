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
    files: fs.readdirSync(__dirname),
    message: 'Servidor funcionando perfeitamente'
  });
});

// Servir arquivos estáticos da pasta atual (dist)
app.use(express.static(__dirname, {
  index: ['index.html'],
  extensions: ['html', 'js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot'],
  setHeaders: (res, path) => {
    // Configurar headers para arquivos estáticos
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
  }
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
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(indexPath);
  } else {
    console.log('❌ index.html não encontrado em:', indexPath);
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erro 404 - Gestão de Pessoas</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
          .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Gestão de Pessoas</h1>
          <div class="error">
            <strong>❌ Erro 404 - Página não encontrada</strong><br>
            index.html não encontrado em: ${indexPath}
          </div>
          <p><strong>Arquivos disponíveis:</strong> ${fs.readdirSync(__dirname).join(', ')}</p>
          <p><a href="/health">Verificar Status do Servidor</a></p>
        </div>
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
  
  // Listar arquivos na pasta dist
  try {
    const files = fs.readdirSync(__dirname);
    console.log(`📋 Arquivos na pasta dist:`, files);
    
    // Verificar se há arquivos JS/CSS
    const jsFiles = files.filter(f => f.endsWith('.js'));
    const cssFiles = files.filter(f => f.endsWith('.css'));
    console.log(`📄 Arquivos JS encontrados:`, jsFiles);
    console.log(`🎨 Arquivos CSS encontrados:`, cssFiles);
  } catch (error) {
    console.error('❌ Erro ao listar arquivos:', error);
  }
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
});