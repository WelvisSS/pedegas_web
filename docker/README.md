# 🐳 Ambiente Docker - Pedegas

Este diretório contém a configuração Docker para o projeto Pedegas com Node.js 18.

## 📁 Estrutura

```
pedegas/
├── docker/              ← Você está aqui
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── docker.sh        ← Script de gerenciamento
│   ├── .dockerignore
│   └── README.md
├── src/
├── public/
└── package.json
```

## 🚀 Uso Rápido

### Iniciar e entrar no container
```bash
cd docker
./docker.sh
```

Isso vai:
1. ✅ Iniciar o container Docker
2. ✅ Instalar dependências
3. ✅ Iniciar o servidor Vite
4. ✅ Abrir o shell do container

### Outros comandos disponíveis

```bash
./docker.sh start    # Apenas inicia o container
./docker.sh stop     # Para o container
./docker.sh restart  # Reinicia o container
./docker.sh logs     # Exibe logs em tempo real
./docker.sh status   # Verifica status do container
./docker.sh shell    # Acessa o shell do container
./docker.sh help     # Exibe ajuda
```

## 📋 Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado

## 🔧 Configuração

### Dockerfile
Define a imagem base com Node.js 18 Alpine:
```dockerfile
FROM node:18-alpine
WORKDIR /app
CMD ["tail", "-f", "/dev/null"]
```

### docker-compose.yml
Configura o serviço e mapeamentos:
- **Volume**: Mapeia `pedegas/` para `/app/pedegas` no container
- **Porta**: Expõe porta 5173 (Vite dev server)
- **Env**: Carrega variáveis do arquivo `../.env` (pedegas/.env)

### .dockerignore
Evita copiar arquivos desnecessários:
- `node_modules`
- `dist`
- `.env`
- Logs

## 🌐 Acessar a Aplicação

Após iniciar o container, acesse:
```
http://localhost:5173
```

## 🛠️ Comandos Manuais

Se preferir não usar o script `docker.sh`:

```bash
# Iniciar
docker compose up --build -d

# Verificar status
docker ps

# Acessar shell
docker exec -it meu-node-env /bin/sh

# Ver logs
docker compose logs -f

# Parar
docker compose down
```

## 📝 Notas Importantes

- O arquivo `.env` deve estar em **`pedegas/.env`** (junto com o código)
- O container instala as dependências automaticamente ao iniciar
- Hot reload está habilitado - mudanças no código são refletidas automaticamente
- Para usar comandos npm/node, entre no shell do container primeiro

## 🐛 Troubleshooting

### Container não inicia
```bash
docker compose down
docker compose up --build -d
```

### Porta 5173 já está em uso
```bash
# Parar processo usando a porta
lsof -ti:5173 | xargs kill -9
```

### Permissões negadas no docker.sh
```bash
chmod +x docker.sh
```

## 📚 Referências

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Node.js Alpine Image](https://hub.docker.com/_/node)
- [Vite Dev Server](https://vitejs.dev/config/server-options.html)
