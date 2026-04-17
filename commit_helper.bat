@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"

echo == Asistente de commit ==
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo Git no esta disponible en el PATH.
  goto :fail
)

echo Selecciona la rama donde quieres hacer el commit:
set "branchCount=0"
for /f "delims=" %%B in ('git for-each-ref --format^="%%(refname:short)" refs/heads 2^>nul') do (
  set /a branchCount+=1
  set "branch!branchCount!=%%B"
  echo !branchCount!^) %%B
)

if "%branchCount%"=="0" (
  echo No se encontraron ramas locales.
  goto :fail
)

set /p "branchChoice=Ingresa el numero de la rama: "
echo %branchChoice%| findstr /r "^[0-9][0-9]*$" >nul || (
  echo Opcion de rama invalida.
  goto :fail
)

if %branchChoice% LSS 1 (
  echo Opcion de rama invalida.
  goto :fail
)
if %branchChoice% GTR %branchCount% (
  echo Opcion de rama invalida.
  goto :fail
)

set "selectedBranch=!branch%branchChoice%!"
for /f "delims=" %%C in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "currentBranch=%%C"

if not "%selectedBranch%"=="%currentBranch%" (
  git checkout "%selectedBranch%" || goto :fail
)

echo.
echo Selecciona el tipo de commit:
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
  echo Opcion invalida.
  goto :fail
)

if %typeChoice% LSS 1 (
  echo Opcion invalida.
  goto :fail
)
if %typeChoice% GTR 11 (
  echo Opcion invalida.
  goto :fail
)

set "type=!type%typeChoice%!"

set /p "commitMsg=Escribe el mensaje del commit en espanol: "
if "%commitMsg%"=="" (
  echo El mensaje no puede estar vacio.
  goto :fail
)

set "fullMessage=%type%: %commitMsg%"
echo Mensaje final: %fullMessage%

git add . || goto :fail
git commit -m "%fullMessage%" || goto :fail

echo.
echo Rama usada: %selectedBranch%
echo Commit realizado correctamente: %fullMessage%
echo Esta confirmacion se cerrara en 5 segundos...
timeout /t 5 /nobreak >nul
goto :end

:fail
echo.
echo El proceso termino con error. Revisa el mensaje anterior.
pause
exit /b 1

:end
pause
exit /b 0
