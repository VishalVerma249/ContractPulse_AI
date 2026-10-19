@echo off
setlocal
set "MAVEN_EXE=%USERPROFILE%\.maven\apache-maven-3.9.9\bin\mvn.cmd"
if exist "%MAVEN_EXE%" (
    call "%MAVEN_EXE%" %*
) else (
    call mvn %*
)
