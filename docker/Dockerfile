# 1. Define a imagem base
FROM node:22.12.0-alpine

# 2. Define o diretório de trabalho dentro do container
WORKDIR /app/pedegas

# Copia os arquivos de dependência e instala as dependências
# O contexto de build é o diretório pai (pedegas/)
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Copia o restante do código-fonte
COPY . .

# Expor porta do Vite
EXPOSE 5173

# Comando padrão para desenvolvimento
CMD ["sh", "-c", "npm install && npx vite --host --strictPort"]

