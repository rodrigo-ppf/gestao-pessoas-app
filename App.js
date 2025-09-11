import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';

// Importar telas
import CompanyListScreen from './src/screens/CompanyListScreen';
import CompanyRegisterScreen from './src/screens/CompanyRegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileSelectionScreen from './src/screens/ProfileSelectionScreen';

// Importar telas de colaboradores
import CadastroColaboradorScreen from './src/screens/CadastroColaboradorScreen';
import EditarColaboradorScreen from './src/screens/EditarColaboradorScreen';
import ListaColaboradoresScreen from './src/screens/ListaColaboradoresScreen';
import PerfilColaboradorScreen from './src/screens/PerfilColaboradorScreen';

// Importar telas de tarefas
import AgendaTarefasScreen from './src/screens/AgendaTarefasScreen';
import CriarTarefaScreen from './src/screens/CriarTarefaScreen';
import ExecutarTarefaScreen from './src/screens/ExecutarTarefaScreen';
import ListaTarefasScreen from './src/screens/ListaTarefasScreen';

// Importar telas de ponto
import AprovarPontoScreen from './src/screens/AprovarPontoScreen';
import HistoricoPontoScreen from './src/screens/HistoricoPontoScreen';
import RegistrarPontoScreen from './src/screens/RegistrarPontoScreen';

// Importar telas de férias
import AprovarFeriasScreen from './src/screens/AprovarFeriasScreen';
import HistoricoFeriasScreen from './src/screens/HistoricoFeriasScreen';
import SolicitarFeriasScreen from './src/screens/SolicitarFeriasScreen';

// Importar telas de justificativas
import AprovarDocumentoScreen from './src/screens/AprovarDocumentoScreen';
import HistoricoJustificativasScreen from './src/screens/HistoricoJustificativasScreen';
import UploadDocumentoScreen from './src/screens/UploadDocumentoScreen';

// Importar telas de relatórios
import RelatorioPontoScreen from './src/screens/RelatorioPontoScreen';
import RelatorioSolicitacoesScreen from './src/screens/RelatorioSolicitacoesScreen';
import RelatorioTarefasScreen from './src/screens/RelatorioTarefasScreen';

// Importar banco de dados
import { initDatabase } from './src/database/database';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Inicializar banco de dados
      await initDatabase();
      
      // Verificar se usuário está logado
      // TODO: Implementar verificação de login
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao inicializar app:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // TODO: Adicionar tela de loading
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1976d2',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {!isLoggedIn ? (
            <>
              <Stack.Screen 
                name="Login" 
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="ProfileSelection" 
                component={ProfileSelectionScreen}
                options={{ headerShown: false }}
              />
            </>
          ) : (
            <>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{ title: 'Gestão de Pessoas' }}
              />
              
              {/* Telas de Empresas */}
              <Stack.Screen 
                name="CompanyRegister" 
                component={CompanyRegisterScreen}
                options={{ title: 'Cadastro de Empresa' }}
              />
              <Stack.Screen 
                name="CompanyList" 
                component={CompanyListScreen}
                options={{ title: 'Empresas Cadastradas' }}
              />

              {/* Telas de Colaboradores */}
              <Stack.Screen 
                name="CadastroColaborador" 
                component={CadastroColaboradorScreen}
                options={{ title: 'Cadastro de Colaborador' }}
              />
              <Stack.Screen 
                name="ListaColaboradores" 
                component={ListaColaboradoresScreen}
                options={{ title: 'Colaboradores' }}
              />
              <Stack.Screen 
                name="PerfilColaborador" 
                component={PerfilColaboradorScreen}
                options={{ title: 'Perfil do Colaborador' }}
              />
              <Stack.Screen 
                name="EditarColaborador" 
                component={EditarColaboradorScreen}
                options={{ title: 'Editar Colaborador' }}
              />

              {/* Telas de Tarefas */}
              <Stack.Screen 
                name="CriarTarefa" 
                component={CriarTarefaScreen}
                options={{ title: 'Criar Tarefa' }}
              />
              <Stack.Screen 
                name="ListaTarefas" 
                component={ListaTarefasScreen}
                options={{ title: 'Tarefas' }}
              />
              <Stack.Screen 
                name="ExecutarTarefa" 
                component={ExecutarTarefaScreen}
                options={{ title: 'Executar Tarefa' }}
              />
              <Stack.Screen 
                name="AgendaTarefas" 
                component={AgendaTarefasScreen}
                options={{ title: 'Agenda de Tarefas' }}
              />

              {/* Telas de Ponto */}
              <Stack.Screen 
                name="RegistrarPonto" 
                component={RegistrarPontoScreen}
                options={{ title: 'Registrar Ponto' }}
              />
              <Stack.Screen 
                name="HistoricoPonto" 
                component={HistoricoPontoScreen}
                options={{ title: 'Histórico de Ponto' }}
              />
              <Stack.Screen 
                name="AprovarPonto" 
                component={AprovarPontoScreen}
                options={{ title: 'Aprovar Ponto' }}
              />

              {/* Telas de Férias */}
              <Stack.Screen 
                name="SolicitarFerias" 
                component={SolicitarFeriasScreen}
                options={{ title: 'Solicitar Férias' }}
              />
              <Stack.Screen 
                name="AprovarFerias" 
                component={AprovarFeriasScreen}
                options={{ title: 'Aprovar Férias' }}
              />
              <Stack.Screen 
                name="HistoricoFerias" 
                component={HistoricoFeriasScreen}
                options={{ title: 'Histórico de Férias' }}
              />

              {/* Telas de Justificativas */}
              <Stack.Screen 
                name="UploadDocumento" 
                component={UploadDocumentoScreen}
                options={{ title: 'Upload de Documento' }}
              />
              <Stack.Screen 
                name="AprovarDocumento" 
                component={AprovarDocumentoScreen}
                options={{ title: 'Aprovar Justificativas' }}
              />
              <Stack.Screen 
                name="HistoricoJustificativas" 
                component={HistoricoJustificativasScreen}
                options={{ title: 'Histórico de Justificativas' }}
              />

              {/* Telas de Relatórios */}
              <Stack.Screen 
                name="RelatorioPonto" 
                component={RelatorioPontoScreen}
                options={{ title: 'Relatório de Ponto' }}
              />
              <Stack.Screen 
                name="RelatorioTarefas" 
                component={RelatorioTarefasScreen}
                options={{ title: 'Relatório de Tarefas' }}
              />
              <Stack.Screen 
                name="RelatorioSolicitacoes" 
                component={RelatorioSolicitacoesScreen}
                options={{ title: 'Relatório de Solicitações' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}