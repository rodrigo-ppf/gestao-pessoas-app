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

// Health check
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
  index: false, // Não servir index.html automaticamente
  extensions: ['html', 'js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot']
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
  const publicIndexPath = path.join(__dirname, 'public', 'index.html');
  
  console.log(`🔍 Verificando arquivos:`);
  console.log(`   - index.html do build: ${indexPath} - Existe: ${fs.existsSync(indexPath)}`);
  console.log(`   - index.html da public: ${publicIndexPath} - Existe: ${fs.existsSync(publicIndexPath)}`);
  
  // Verificar se existe o index.html do build do Expo
  if (fs.existsSync(indexPath)) {
    console.log('✅ Servindo index.html do build Expo para rota SPA:', req.url);
    
    // Verificar o conteúdo do index.html
    try {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      console.log(`📄 Tamanho do index.html: ${indexContent.length} caracteres`);
      console.log(`📄 Primeiras 200 caracteres: ${indexContent.substring(0, 200)}`);
      
      if (indexContent.length < 100) {
        console.log('⚠️ AVISO: index.html parece estar vazio ou muito pequeno!');
        console.log('📄 Conteúdo completo:', indexContent);
      }
    } catch (error) {
      console.error('❌ Erro ao ler index.html:', error);
    }
    
    res.sendFile(indexPath);
  } 
  // Se não existe, servir a página de status da pasta public
  else if (fs.existsSync(publicIndexPath)) {
    console.log('⚠️ Servindo página de status (build não encontrado) para rota:', req.url);
    res.sendFile(publicIndexPath);
  } 
  else {
    console.log('❌ Nenhum index.html encontrado');
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