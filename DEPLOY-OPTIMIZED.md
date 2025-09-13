# 🚀 Deploy Otimizado - Google App Engine

## 📊 Otimizações Implementadas

### ✅ Redução de Tamanho
- **Antes**: 368MB (com `node_modules` completo)
- **Agora**: ~5MB (apenas arquivos essenciais)
- **Redução**: 98% menor!

### ✅ Arquivos Enviados
- `dist/` - Arquivos estáticos da aplicação
- `server.js` - Servidor Express otimizado
- `app.yaml` - Configuração do App Engine
- `package.json` - Mínimo com apenas Express

### ✅ Arquivos Ignorados (.gcloudignore)
- `node_modules/` - Dependências (instaladas pelo App Engine)
- `.git/` - Controle de versão
- `app/`, `components/`, `src/` - Código fonte
- Arquivos de configuração desnecessários

## 🛠️ Scripts Disponíveis

### Deploy Otimizado (Windows)
```bash
npm run deploy:optimized
```

### Deploy Manual
```bash
# 1. Build
npm run build:production

# 2. Copiar servidor
copy server.robust.js dist\server.js

# 3. Usar package mínimo
copy package.minimal.json package.json

# 4. Deploy
gcloud app deploy --quiet

# 5. Restaurar package original
git checkout package.json
```

## 📁 Arquivos de Configuração

### `.gcloudignore`
```
# Ignore everything except what we need for production
*
!dist/
!server.js
!app.yaml
!package.json

# Ignore large directories
node_modules/
.git/
.expo/
.expo-shared/
dist/node_modules/

# Ignore source files
app/
components/
src/
constants/
scripts/
assets/

# Ignore config files
*.config.js
*.config.ts
metro.config.js
babel.config.js
web.config.js
app.json
expo.json

# Ignore development files
*.md
*.txt
*.log
.env*
.eslintrc*
.prettierrc*
tsconfig.json
```

### `package.minimal.json`
```json
{
  "name": "gestao-pessoas-app",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "4.18.2"
  },
  "engines": {
    "node": "20"
  }
}
```

### `server.robust.js`
- Servidor Express otimizado
- Health check detalhado
- Logs para debugging
- Tratamento de erros
- SPA routing

## 🌐 URLs de Produção

- **Aplicação**: https://gestao-pessoas-app-2024-471821.uc.r.appspot.com
- **Health Check**: https://gestao-pessoas-app-2024-471821.uc.r.appspot.com/health

## 📝 Comandos Úteis

### Verificar Logs
```bash
gcloud app logs tail -s default
```

### Verificar Versões
```bash
gcloud app versions list --service=default
```

### Abrir no Browser
```bash
gcloud app browse
```

## ✅ Benefícios

1. **Deploy Rápido**: 98% menor que antes
2. **Eficiência**: Apenas arquivos essenciais
3. **Confiabilidade**: Servidor robusto com logs
4. **Manutenibilidade**: Scripts automatizados
5. **Custo**: Menor uso de recursos do Google Cloud

---

**Última atualização**: 13/09/2025
**Versão**: 1.0.0
**Status**: ✅ Funcionando perfeitamente
