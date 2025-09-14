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
      console.log(`📄 Últimas 200 caracteres: ${indexContent.substring(indexContent.length - 200)}`);
      
      // Verificar se contém conteúdo da página de status
      const isStatusPage = indexContent.includes('Build em Progresso') || indexContent.includes('Servidor Funcionando');
      console.log(`📄 É página de status: ${isStatusPage}`);
      
      // Verificar se o index.html contém conteúdo válido do React/Expo
      const hasReactContent = indexContent.includes('react') || indexContent.includes('React') || indexContent.includes('_expo');
      const hasScriptTags = indexContent.includes('<script');
      const hasValidHTML = indexContent.includes('<!DOCTYPE html>') || indexContent.includes('<html');
      
      if (indexContent.length < 100 || !hasValidHTML || !hasScriptTags) {
        console.log('⚠️ AVISO: index.html parece estar vazio, corrompido ou incompleto!');
        console.log(`   - Tamanho: ${indexContent.length} caracteres`);
        console.log(`   - Tem HTML válido: ${hasValidHTML}`);
        console.log(`   - Tem script tags: ${hasScriptTags}`);
        console.log(`   - Tem conteúdo React: ${hasReactContent}`);
        console.log('📄 Conteúdo completo:', indexContent);
        
        // Se o index.html está vazio ou corrompido, servir uma página de erro informativa
        res.status(500).send(`
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Erro de Build - Gestão de Pessoas</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
              .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .error { color: #d32f2f; }
              .info { background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 15px 0; }
              .code { background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; }
              .btn { background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">❌ Erro de Build Detectado</h1>
              <p>O build do Expo gerou um <code>index.html</code> vazio, corrompido ou incompleto.</p>
              
              <div class="info">
                <h3>📊 Informações do Build:</h3>
                <ul>
                  <li><strong>Tamanho:</strong> ${indexContent.length} caracteres</li>
                  <li><strong>HTML válido:</strong> ${hasValidHTML ? '✅' : '❌'}</li>
                  <li><strong>Script tags:</strong> ${hasScriptTags ? '✅' : '❌'}</li>
                  <li><strong>Conteúdo React:</strong> ${hasReactContent ? '✅' : '❌'}</li>
                </ul>
              </div>
              
              <div class="info">
                <h3>🔧 Possíveis Soluções:</h3>
                <ul>
                  <li>Verificar se o build do Expo foi executado corretamente</li>
                  <li>Verificar se todas as dependências foram instaladas</li>
                  <li>Verificar se há erros no script de build</li>
                  <li>Verificar se o <code>package.dev.json</code> está correto</li>
                </ul>
              </div>
              
              <h3>📄 Conteúdo do index.html:</h3>
              <div class="code">${indexContent || '(arquivo vazio)'}</div>
              
              <div style="margin-top: 20px;">
                <a href="/health" class="btn">Verificar Status do Servidor</a>
                <a href="https://github.com/rodrigo-ppf/gestao-pessoas-app" class="btn" target="_blank">Ver Código no GitHub</a>
              </div>
            </div>
          </body>
          </html>
        `);
        return;
      }
    } catch (error) {
      console.error('❌ Erro ao ler index.html:', error);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Erro de Leitura</title></head>
        <body>
          <h1>❌ Erro ao Ler index.html</h1>
          <p>Erro: ${error.message}</p>
          <p><a href="/health">Verificar Status do Servidor</a></p>
        </body>
        </html>
      `);
      return;
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