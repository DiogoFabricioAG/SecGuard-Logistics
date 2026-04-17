@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"

echo == Pull del repositorio ==
echo.

where git >nul 2>&1
if errorlevel 1 (
	echo Git no esta disponible en el PATH.
	goto :fail
)

echo Selecciona la rama para hacer pull:
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
echo Haciendo pull en la rama: %selectedBranch%
git pull origin "%selectedBranch%" || goto :fail

echo.
echo Pull completado correctamente en la rama %selectedBranch%.
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
