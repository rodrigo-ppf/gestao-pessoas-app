import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/src/contexts/AuthContext';
import '@/src/i18n';
// import { initDatabase } from '../src/database/database';

// Rota inicial será gerenciada por app/index.tsx
// export const unstable_settings = {
//   anchor: 'login',
// };

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Inicializar banco de dados (desabilitado temporariamente para web)
    // initDatabase().catch(error => {
    //   console.error('Erro ao inicializar banco de dados:', error);
    // });
  }, []);

  // Tema customizado com cor primária azul
  const customTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#1976d2',
      primaryContainer: '#e3f2fd',
      secondary: '#2196f3',
      secondaryContainer: '#e1f5fe',
    },
  };

  return (
    <AuthProvider>
      <PaperProvider theme={customTheme}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            {/* Rotas principais */}
            <Stack.Screen name="home" 
              options={{ 
                title: 'Gestão de Pessoas',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            
            {/* Módulo: Autenticação - app/(auth)/ */}
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen 
              name="verificar-email" 
              options={{ 
                title: 'Verificar Email',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            
            {/* Módulo: Empresas - app/(empresas)/ */}
            <Stack.Screen 
              name="company-register" 
              options={{ 
                title: 'Cadastro de Empresa',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="company-list" 
              options={{ 
                title: 'Empresas Cadastradas',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="cadastro-empresa" 
              options={{ 
                title: 'Cadastro de Empresa',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="home-empresa" 
              options={{ 
                title: 'Home Empresa',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="selecionar-empresa" 
              options={{ 
                title: 'Selecionar Empresa',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            
            {/* Módulo: Colaboradores - app/(colaboradores)/ */}
            <Stack.Screen 
              name="colaboradores" 
              options={{ 
                title: 'Colaboradores',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="cadastro-usuario" 
              options={{ 
                title: 'Cadastro de Usuário',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="gerenciar-equipe" 
              options={{ 
                title: 'Gerenciar Equipe',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="cadastro-lider" 
              options={{ 
                title: 'Cadastrar Líder',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="cadastro-funcionario" 
              options={{ 
                title: 'Cadastrar Funcionário',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="editar-lider" 
              options={{ 
                title: 'Editar Líder',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="editar-funcionario" 
              options={{ 
                title: 'Editar Funcionário',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            
            {/* Módulo: Tarefas - app/(tarefas)/ */}
            <Stack.Screen 
              name="tarefas" 
              options={{ 
                title: 'Tarefas',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="criar-tarefa" 
              options={{ 
                title: 'Criar Tarefa',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="editar-tarefa" 
              options={{ 
                title: 'Editar Tarefa',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="detalhes-tarefa" 
              options={{ 
                title: 'Detalhes da Tarefa',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="atribuir-tarefas-lote" 
              options={{ 
                title: 'Atribuir Tarefas em Lote',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            
            {/* Módulo: Ponto - app/(ponto)/ */}
            <Stack.Screen 
              name="registrar-ponto" 
              options={{ 
                title: 'Registrar Ponto',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="historico-ponto" 
              options={{ 
                title: 'Histórico de Ponto',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="aprovar-pontos" 
              options={{ 
                title: 'Aprovar Pontos',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            
            {/* Módulo: Férias - app/(ferias)/ */}
            <Stack.Screen 
              name="solicitar-ferias" 
              options={{ 
                title: 'Solicitar Férias',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="historico-ferias" 
              options={{ 
                title: 'Histórico de Férias',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            <Stack.Screen 
              name="aprovar-ferias" 
              options={{ 
                title: 'Aprovar Férias',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' }
              }} 
            />
            
            {/* Tabs */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PaperProvider>
    </AuthProvider>
  );
}