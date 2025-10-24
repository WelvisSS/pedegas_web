#!/bin/bash

# Script para gerenciar o ambiente Docker do projeto Pedegas
# Uso: ./docker.sh [start|stop|restart|logs|status]

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para exibir mensagens coloridas
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Função para iniciar o Docker
start() {
    print_info "Iniciando o ambiente Docker..."
    
    if docker ps | grep -q "meu-node-env"; then
        print_info "Container já está rodando!"
        docker ps | grep "meu-node-env"
    else
        docker compose up --build -d
        print_success "Container iniciado com sucesso!"
        print_info "Aguardando inicialização..."
        sleep 3
        docker ps | grep "meu-node-env"
        print_success "Aplicação disponível em: http://localhost:5173"
    fi
}

# Função para parar o Docker
stop() {
    print_info "Parando o ambiente Docker..."
    docker compose down
    print_success "Container parado com sucesso!"
}

# Função para reiniciar o Docker
restart() {
    print_info "Reiniciando o ambiente Docker..."
    stop
    sleep 2
    start
}

# Função para exibir logs
logs() {
    print_info "Exibindo logs do container..."
    docker compose logs -f
}

# Função para verificar status
status() {
    print_info "Status do container:"
    if docker ps | grep -q "meu-node-env"; then
        print_success "Container está rodando"
        docker ps | grep "meu-node-env"
        echo ""
        print_info "Para acessar o shell do container, execute:"
        echo "  docker exec -it meu-node-env /bin/sh"
    else
        print_error "Container não está rodando"
        echo ""
        print_info "Para iniciar, execute:"
        echo "  ./docker.sh start"
    fi
}

# Função para entrar no container
shell() {
    if docker ps | grep -q "meu-node-env"; then
        print_info "Acessando shell do container..."
        docker exec -it meu-node-env /bin/sh
    else
        print_error "Container não está rodando!"
        print_info "Execute './docker.sh start' primeiro"
        exit 1
    fi
}

# Função para iniciar e entrar no container
start_and_shell() {
    if docker ps | grep -q "meu-node-env"; then
        print_info "Container já está rodando!"
    else
        print_info "Iniciando o ambiente Docker..."
        docker compose up --build -d
        print_success "Container iniciado com sucesso!"
        print_info "Aguardando inicialização..."
        sleep 3
        print_success "Aplicação disponível em: http://localhost:5173"
    fi
    echo ""
    print_info "Acessando shell do container..."
    print_info "Para sair do container, digite: exit"
    echo ""
    docker exec -it meu-node-env /bin/sh
}

# Menu de ajuda
help() {
    echo "Script de gerenciamento Docker - Pedegas"
    echo ""
    echo "Uso: ./docker.sh [comando]"
    echo ""
    echo "Sem argumentos:"
    echo "  ./docker.sh  - Inicia o container e entra no shell automaticamente"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start    - Inicia o container Docker (sem entrar no shell)"
    echo "  stop     - Para o container Docker"
    echo "  restart  - Reinicia o container Docker"
    echo "  logs     - Exibe os logs do container"
    echo "  status   - Verifica o status do container"
    echo "  shell    - Acessa o shell do container"
    echo "  help     - Exibe esta mensagem de ajuda"
    echo ""
    echo "Exemplos:"
    echo "  ./docker.sh          # Inicia e entra no container"
    echo "  ./docker.sh start    # Apenas inicia"
    echo "  ./docker.sh logs     # Ver logs"
    echo "  ./docker.sh stop     # Parar container"
}

# Verifica se o Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado!"
    print_info "Instale o Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Processa o comando
# Se não houver argumentos, inicia e entra no container
if [ $# -eq 0 ]; then
    start_and_shell
    exit 0
fi

case "${1}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    shell)
        shell
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Comando inválido: $1"
        echo ""
        help
        exit 1
        ;;
esac
