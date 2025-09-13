# 🚀 Deploy Estável - Estrutura Mantida

## ⚠️ **PROBLEMA IDENTIFICADO E RESOLVIDO**

### 🔍 **Causa do Problema:**
- Toda vez que fazemos mudanças no código, o `package.json` volta ao original (com Expo)
- O Google App Engine não consegue encontrar o módulo `express`
- Erro: `Cannot find module 'express'`
- Sistema para de funcionar após cada deploy

### ✅ **SOLUÇÃO IMPLEMENTADA:**
- Manter `package.json` mínimo com apenas Express
- **NÃO restaurar** o `package.json` original após deploy
- Usar scripts de deploy que preservam a configuração de produção

## 📁 **Estrutura de Deploy Estável**

### **Arquivos Essenciais:**
```
├── package.json (MÍNIMO - apenas Express)
├── server.js (servidor robusto)
├── app.yaml (configuração App Engine)
├── .gcloudignore (otimização)
├── dist/ (arquivos estáticos)
└── scripts/ (scripts de deploy)
```

### **package.json (PRODUÇÃO):**
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

## 🛠️ **Scripts de Deploy**

### **Deploy Corrigido (Windows):**
```bash
# Usar este script para deploys futuros
scripts/deploy-fixed.bat
```

### **Deploy Manual (Passo a Passo):**
```bash
# 1. Build da aplicação
npm run build:production

# 2. Copiar servidor
copy server.robust.js dist\server.js

# 3. Usar package mínimo (IMPORTANTE: NÃO restaurar!)
copy package.minimal.json package.json

# 4. Deploy
gcloud app deploy --quiet
```

## ⚠️ **REGRAS CRÍTICAS**

### ❌ **NUNCA FAZER:**
- `git checkout package.json` após deploy
- Restaurar package.json original
- Fazer commit do package.json original
- Usar scripts que restauram package.json

### ✅ **SEMPRE FAZER:**
- Manter package.json mínimo em produção
- Usar scripts de deploy corrigidos
- Verificar logs após cada deploy
- Testar health check após deploy

## 🔧 **Comandos de Verificação**

### **Verificar Logs:**
```bash
gcloud logging read "resource.type=gae_app" --limit=10 --format="table(timestamp,severity,textPayload)"
```

### **Verificar Health Check:**
```bash
curl https://gestao-pessoas-app-2024-471821.uc.r.appspot.com/health
```

### **Verificar Versões:**
```bash
gcloud app versions list --service=default
```

## 📊 **Status Atual**

- **Versão Estável**: Funcionando
- **Tamanho Deploy**: ~5MB (otimizado)
- **Health Check**: ✅ Funcionando
- **Menu Lateral**: ✅ Implementado
- **URL Produção**: https://gestao-pessoas-app-2024-471821.uc.r.appspot.com

## 🚨 **Troubleshooting**

### **Se o sistema parar de funcionar:**

1. **Verificar Logs:**
   ```bash
   gcloud logging read "resource.type=gae_app" --limit=5
   ```

2. **Se erro "Cannot find module 'express'":**
   ```bash
   copy package.minimal.json package.json
   gcloud app deploy --quiet
   ```

3. **Se erro 502/503:**
   ```bash
   # Verificar se server.js está correto
   copy server.robust.js dist\server.js
   gcloud app deploy --quiet
   ```

## 📝 **Checklist de Deploy**

- [ ] Build da aplicação executado
- [ ] server.js copiado para dist/
- [ ] package.json mínimo configurado
- [ ] Deploy executado
- [ ] Health check testado
- [ ] Logs verificados
- [ ] **NÃO restaurar package.json**

## 🎯 **Próximos Passos**

1. **Sempre usar** `scripts/deploy-fixed.bat`
2. **Manter** package.json mínimo em produção
3. **Verificar** logs após cada mudança
4. **Testar** health check após deploy
5. **Documentar** qualquer mudança na estrutura

---

**Última atualização**: 13/09/2025  
**Status**: ✅ Estável e Funcionando  
**Próximo deploy**: Usar `scripts/deploy-fixed.bat`
