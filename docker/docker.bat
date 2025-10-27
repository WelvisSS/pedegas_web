@echo off
REM Script para gerenciar o ambiente Docker do projeto Pedegas
REM Uso: docker.bat [start|stop|restart|logs|status|shell|help]

setlocal enabledelayedexpansion

REM Verifica se o Docker está instalado
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [31mX Docker nao esta instalado![0m
    echo [33mi Instale o Docker Desktop: https://www.docker.com/products/docker-desktop[0m
    exit /b 1
)

REM Se não houver argumentos, inicia e entra no container
if "%~1"=="" (
    call :start_and_shell
    exit /b 0
)

REM Processa o comando
if /i "%~1"=="start" (
    call :start
) else if /i "%~1"=="stop" (
    call :stop
) else if /i "%~1"=="restart" (
    call :restart
) else if /i "%~1"=="logs" (
    call :logs
) else if /i "%~1"=="status" (
    call :status
) else if /i "%~1"=="shell" (
    call :shell
) else if /i "%~1"=="help" (
    call :help
) else if /i "%~1"=="--help" (
    call :help
) else if /i "%~1"=="-h" (
    call :help
) else (
    echo [31mX Comando invalido: %~1[0m
    echo.
    call :help
    exit /b 1
)

exit /b 0

REM ==================== FUNCOES ====================

:start
echo [33mi Iniciando o ambiente Docker...[0m
docker ps | findstr "meu-node-env" >nul 2>nul
if %errorlevel% equ 0 (
    echo [33mi Container ja esta rodando![0m
    docker ps | findstr "meu-node-env"
) else (
    docker.exe compose up --build -d
    if %errorlevel% equ 0 (
        echo [32m✓ Container iniciado com sucesso![0m
        echo [33mi Aguardando inicializacao...[0m
        timeout /t 3 /nobreak >nul
        docker ps | findstr "meu-node-env"
        echo [32m✓ Aplicacao disponivel em: http://localhost:5173[0m
    ) else (
        echo [31mX Erro ao iniciar o container![0m
        exit /b 1
    )
)
exit /b 0

:stop
echo [33mi Parando o ambiente Docker...[0m
docker.exe compose down
if %errorlevel% equ 0 (
    echo [32m✓ Container parado com sucesso![0m
) else (
    echo [31mX Erro ao parar o container![0m
    exit /b 1
)
exit /b 0

:restart
echo [33mi Reiniciando o ambiente Docker...[0m
call :stop
timeout /t 2 /nobreak >nul
call :start
exit /b 0

:logs
echo [33mi Exibindo logs do container...[0m
docker.exe compose logs -f
exit /b 0

:status
echo [33mi Status do container:[0m
docker ps | findstr "meu-node-env" >nul 2>nul
if %errorlevel% equ 0 (
    echo [32m✓ Container esta rodando[0m
    docker ps | findstr "meu-node-env"
    echo.
    echo [33mi Para acessar o shell do container, execute:[0m
    echo   docker exec -it meu-node-env /bin/sh
) else (
    echo [31mX Container nao esta rodando[0m
    echo.
    echo [33mi Para iniciar, execute:[0m
    echo   docker.bat start
)
exit /b 0

:shell
docker ps | findstr "meu-node-env" >nul 2>nul
if %errorlevel% equ 0 (
    echo [33mi Acessando shell do container...[0m
    docker exec -it meu-node-env /bin/sh
) else (
    echo [31mX Container nao esta rodando![0m
    echo [33mi Execute 'docker.bat start' primeiro[0m
    exit /b 1
)
exit /b 0

:start_and_shell
docker ps | findstr "meu-node-env" >nul 2>nul
if %errorlevel% equ 0 (
    echo [33mi Container ja esta rodando![0m
) else (
    echo [33mi Iniciando o ambiente Docker...[0m
    docker.exe compose up --build -d
    if %errorlevel% equ 0 (
        echo [32m✓ Container iniciado com sucesso![0m
        echo [33mi Aguardando inicializacao...[0m
        timeout /t 3 /nobreak >nul
        echo [32m✓ Aplicacao disponivel em: http://localhost:5173[0m
    ) else (
        echo [31mX Erro ao iniciar o container![0m
        exit /b 1
    )
)
echo.
echo [33mi Acessando shell do container...[0m
echo [33mi Para sair do container, digite: exit[0m
echo.
docker exec -it meu-node-env /bin/sh
exit /b 0

:help
echo Script de gerenciamento Docker - Pedegas
echo.
echo Uso: docker.bat [comando]
echo.
echo Sem argumentos:
echo   docker.bat  - Inicia o container e entra no shell automaticamente
echo.
echo Comandos disponiveis:
echo   start    - Inicia o container Docker (sem entrar no shell)
echo   stop     - Para o container Docker
echo   restart  - Reinicia o container Docker
echo   logs     - Exibe os logs do container
echo   status   - Verifica o status do container
echo   shell    - Acessa o shell do container
echo   help     - Exibe esta mensagem de ajuda
echo.
echo Exemplos:
echo   docker.bat          # Inicia e entra no container
echo   docker.bat start    # Apenas inicia
echo   docker.bat logs     # Ver logs
echo   docker.bat stop     # Parar container
exit /b 0
