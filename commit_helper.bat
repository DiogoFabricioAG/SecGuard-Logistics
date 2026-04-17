@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"

for /f %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "C_RESET=%ESC%[0m"
set "C_TITLE=%ESC%[96m"
set "C_INFO=%ESC%[94m"
set "C_OK=%ESC%[92m"
set "C_WARN=%ESC%[93m"
set "C_ERR=%ESC%[91m"

echo %C_TITLE%== Asistente de commit ==%C_RESET%
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo %C_ERR%Git no esta disponible en el PATH.%C_RESET%
  goto :fail
)

echo %C_INFO%Archivos con cambios detectados en el repositorio:%C_RESET%
git status --short
echo.

echo %C_INFO%Selecciona la rama donde quieres hacer el commit:%C_RESET%
set "branchCount=0"
for /f "delims=" %%B in ('git for-each-ref --format^="%%(refname:short)" refs/heads 2^>nul') do (
  set /a branchCount+=1
  set "branch!branchCount!=%%B"
  echo !branchCount!^) %%B
)

if "%branchCount%"=="0" (
  echo %C_ERR%No se encontraron ramas locales.%C_RESET%
  goto :fail
)

set /p "branchChoice=Ingresa el numero de la rama: "
echo %branchChoice%| findstr /r "^[0-9][0-9]*$" >nul || (
  echo %C_ERR%Opcion de rama invalida.%C_RESET%
  goto :fail
)

if %branchChoice% LSS 1 (
  echo %C_ERR%Opcion de rama invalida.%C_RESET%
  goto :fail
)
if %branchChoice% GTR %branchCount% (
  echo %C_ERR%Opcion de rama invalida.%C_RESET%
  goto :fail
)

set "selectedBranch=!branch%branchChoice%!"
for /f "delims=" %%C in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "currentBranch=%%C"

if not "%selectedBranch%"=="%currentBranch%" (
  echo %C_WARN%Cambiando a la rama %selectedBranch%...%C_RESET%
  git checkout "%selectedBranch%" || goto :fail
)

echo.
echo %C_INFO%Selecciona el tipo de commit:%C_RESET%
set "type1=feat"
set "type2=fix"
set "type3=chore"
set "type4=docs"
set "type5=refactor"
set "type6=style"
set "type7=test"
set "type8=perf"
set "type9=ci"
set "type10=build"
set "type11=revert"

for /l %%I in (1,1,11) do echo %%I^) !type%%I!

set /p "typeChoice=Ingresa el numero del tipo de commit: "
echo %typeChoice%| findstr /r "^[0-9][0-9]*$" >nul || (
  echo %C_ERR%Opcion invalida.%C_RESET%
  goto :fail
)

if %typeChoice% LSS 1 (
  echo %C_ERR%Opcion invalida.%C_RESET%
  goto :fail
)
if %typeChoice% GTR 11 (
  echo %C_ERR%Opcion invalida.%C_RESET%
  goto :fail
)

set "type=!type%typeChoice%!"

set /p "commitMsg=Escribe el mensaje del commit en espanol: "
if "%commitMsg%"=="" (
  echo %C_ERR%El mensaje no puede estar vacio.%C_RESET%
  goto :fail
)

set "fullMessage=%type%: %commitMsg%"
echo %C_INFO%Mensaje final: %fullMessage%%C_RESET%

git add . || goto :fail
echo.
echo %C_INFO%Archivos que se van a subir en este commit:%C_RESET%
git diff --cached --name-status

git diff --cached --quiet
if not errorlevel 1 (
  echo %C_ERR%No hay cambios para commitear despues de git add .%C_RESET%
  goto :fail
)

git commit -m "%fullMessage%" || goto :fail
echo %C_WARN%Enviando commit al remoto origin/%selectedBranch%...%C_RESET%
git push origin "%selectedBranch%" || goto :fail

echo.
echo %C_OK%Rama usada: %selectedBranch%%C_RESET%
echo %C_OK%Commit y push realizados correctamente: %fullMessage%%C_RESET%
echo %C_OK%Esta confirmacion se cerrara en 5 segundos...%C_RESET%
timeout /t 5 /nobreak >nul
goto :end

:fail
echo.
echo %C_ERR%El proceso termino con error. Revisa el mensaje anterior.%C_RESET%
pause
exit /b 1

:end
pause
exit /b 0
