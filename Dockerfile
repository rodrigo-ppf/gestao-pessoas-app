# Dockerfile para React Native/Expo Web
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache git

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Build da aplicação para web
RUN npx expo export --platform web

# Instalar servidor web simples
RUN npm install -g serve

# Expor porta
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["serve", "-s", "dist", "-l", "3000"]
