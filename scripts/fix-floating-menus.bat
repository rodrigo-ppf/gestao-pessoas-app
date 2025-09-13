@echo off
echo 🔧 Corrigindo menus flutuantes em todas as telas...

REM Lista de arquivos para corrigir
set files=editar-tarefa.tsx editar-funcionario.tsx editar-lider.tsx cadastro-funcionario.tsx criar-tarefa.tsx cadastro-lider.tsx atribuir-tarefas-lote.tsx colaboradores.tsx verificar-email.tsx cadastro-empresa.tsx home-empresa.tsx cadastro-usuario.tsx registrar-ponto.tsx

for %%f in (%files%) do (
    echo 📝 Processando app\%%f...
    
    REM Substituir import
    powershell -Command "(Get-Content 'app\%%f') -replace 'import FloatingMenu from ''@/components/FloatingMenu'';', 'import MainLayout from ''@/components/MainLayout'';' | Set-Content 'app\%%f'"
    
    REM Substituir return
    powershell -Command "(Get-Content 'app\%%f') -replace 'return \(', 'return (' | Set-Content 'app\%%f'"
    powershell -Command "(Get-Content 'app\%%f') -replace '<View style=\{styles\.container\}>', '<MainLayout title=\"Tela\">' | Set-Content 'app\%%f'"
    
    REM Substituir fechamento
    powershell -Command "(Get-Content 'app\%%f') -replace '<FloatingMenu />', '' | Set-Content 'app\%%f'"
    powershell -Command "(Get-Content 'app\%%f') -replace '</View>', '</MainLayout>' | Set-Content 'app\%%f'"
)

echo ✅ Menus flutuantes corrigidos!
echo ⚠️  Verifique manualmente os títulos das telas
