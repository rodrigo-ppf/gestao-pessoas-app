# 🚀 Configuração de Deploy Automático no Google Cloud

Este guia explica como configurar o deploy automático do projeto no Google Cloud usando GitHub Actions.

## 📋 Pré-requisitos

1. **Conta no Google Cloud Platform** ativa
2. **Projeto criado** no Google Cloud
3. **Billing habilitado** no projeto
4. **Acesso ao GitHub** com permissões de admin no repositório

## 🔧 Configuração no Google Cloud

### 1. Criar Service Account

```bash
# Via gcloud CLI
gcloud iam service-accounts create github-actions \
    --description="Service account for GitHub Actions" \
    --display-name="GitHub Actions"

# Ou via Console Web
# 1. Vá para IAM & Admin > Service Accounts
# 2. Clique em "Create Service Account"
# 3. Nome: github-actions
# 4. Descrição: Service account for GitHub Actions
```

### 2. Configurar Permissões

```bash
# Dar permissões necessárias
gcloud projects add-iam-policy-binding SEU_PROJECT_ID \
    --member="serviceAccount:github-actions@SEU_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding SEU_PROJECT_ID \
    --member="serviceAccount:github-actions@SEU_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding SEU_PROJECT_ID \
    --member="serviceAccount:github-actions@SEU_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"
```

### 3. Criar Chave JSON

```bash
# Criar e baixar a chave
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=github-actions@SEU_PROJECT_ID.iam.gserviceaccount.com
```

### 4. Criar Bucket (se usando Cloud Storage)

```bash
# Criar bucket para hospedar o site
gsutil mb -p SEU_PROJECT_ID gs://SEU_BUCKET_NAME

# Configurar para servir site estático
gsutil web set -m index.html -e 404.html gs://SEU_BUCKET_NAME
```

## 🔐 Configuração dos Secrets no GitHub

### 1. Acessar Configurações do Repositório

1. Vá para seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** > **Actions**

### 2. Adicionar os Secrets

Clique em **New repository secret** e adicione:

#### `GCP_SA_KEY`
- **Valor**: Conteúdo completo do arquivo `github-actions-key.json`
- **Descrição**: Chave JSON da Service Account do Google Cloud

#### `GCP_PROJECT_ID`
- **Valor**: ID do seu projeto no Google Cloud
- **Descrição**: ID do projeto no Google Cloud Platform

#### `GCP_BUCKET_NAME`
- **Valor**: Nome do bucket criado (ex: `gestao-pessoas-app-bucket`)
- **Descrição**: Nome do bucket para hospedar o site

### 3. Secrets Opcionais (para outras opções de deploy)

#### `FIREBASE_TOKEN` (se usar Firebase)
- **Valor**: Token do Firebase CLI
- **Como obter**: `firebase login:ci`

#### `FIREBASE_PROJECT_ID` (se usar Firebase)
- **Valor**: ID do projeto Firebase
- **Descrição**: ID do projeto no Firebase

## 🚀 Opções de Deploy

### Opção 1: Google Cloud Storage (Recomendado para sites estáticos)

**Vantagens:**
- ✅ Gratuito para sites estáticos
- ✅ CDN global
- ✅ Fácil configuração
- ✅ Ideal para React/Expo Web

**Configuração:**
- O workflow já está configurado por padrão
- Apenas configure os secrets necessários

### Opção 2: Google Cloud Run

**Vantagens:**
- ✅ Suporte a aplicações dinâmicas
- ✅ Auto-scaling
- ✅ Pay-per-use

**Configuração:**
1. Descomente a seção "Deploy to Google Cloud Run" no workflow
2. Comente a seção "Deploy to Google Cloud Storage"

### Opção 3: Firebase Hosting

**Vantagens:**
- ✅ Integração com Firebase
- ✅ CDN global
- ✅ SSL automático

**Configuração:**
1. Descomente a seção "Deploy to Firebase Hosting" no workflow
2. Configure os secrets do Firebase

## 🧪 Testando o Deploy

### 1. Fazer um Commit

```bash
# Fazer uma pequena mudança
echo "# Teste de deploy" >> test-deploy.md
git add test-deploy.md
git commit -m "test: Teste de deploy automático"
git push origin master
```

### 2. Verificar o Workflow

1. Vá para a aba **Actions** no GitHub
2. Clique no workflow "Deploy to Google Cloud"
3. Verifique se está executando sem erros

### 3. Acessar o Site

Após o deploy bem-sucedido, acesse:
- **Cloud Storage**: `https://storage.googleapis.com/SEU_BUCKET_NAME/index.html`
- **Cloud Run**: URL fornecida pelo Cloud Run
- **Firebase**: URL do projeto Firebase

## 🔍 Troubleshooting

### Erro: "Service account key not found"
- Verifique se o secret `GCP_SA_KEY` está configurado corretamente
- Certifique-se de que a chave JSON está completa

### Erro: "Bucket not found"
- Verifique se o bucket foi criado
- Confirme se o nome no secret `GCP_BUCKET_NAME` está correto

### Erro: "Permission denied"
- Verifique se a Service Account tem as permissões necessárias
- Confirme se o projeto ID está correto

### Build falha
- Verifique se todas as dependências estão no `package.json`
- Confirme se o comando de build está correto

## 📊 Monitoramento

### Logs do GitHub Actions
- Acesse a aba **Actions** para ver logs detalhados
- Cada deploy gera um log completo

### Logs do Google Cloud
- Acesse o Console do Google Cloud
- Vá para **Logging** para ver logs detalhados

## 🔄 Atualizações

Para atualizar a configuração:

1. **Modifique o arquivo** `.github/workflows/deploy-google-cloud.yml`
2. **Commit e push** as mudanças
3. **O próximo deploy** usará a nova configuração

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do GitHub Actions
2. Consulte a documentação do Google Cloud
3. Abra uma issue no repositório
4. Entre em contato: rodrigo.ppfernandes@gmail.com

---

✅ **Após configurar tudo, cada commit na master ou merge request fechado será automaticamente deployado no Google Cloud!**
