import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Card,
    FAB,
    Paragraph,
    Title
} from 'react-native-paper';

export default function HomeScreen({ route }) {
  const navigation = useNavigation();
  const userProfile = route?.params?.userProfile || 'colaborador';

  const getMenuItems = () => {
    const baseItems = [
      {
        title: 'Empresas',
        description: 'Gerenciar empresas cadastradas',
        icon: 'domain',
        onPress: () => navigation.navigate('CompanyList'),
        profiles: ['admin_sistema']
      },
      {
        title: 'Colaboradores',
        description: 'Gerenciar colaboradores',
        icon: 'account-group',
        onPress: () => navigation.navigate('ListaColaboradores'),
        profiles: ['admin_sistema', 'admin_empresa']
      },
      {
        title: 'Tarefas',
        description: 'Gerenciar tarefas',
        icon: 'clipboard-list',
        onPress: () => navigation.navigate('ListaTarefas'),
        profiles: ['admin_sistema', 'admin_empresa', 'responsavel', 'colaborador']
      },
      {
        title: 'Agenda de Tarefas',
        description: 'Visualizar agenda de tarefas',
        icon: 'calendar',
        onPress: () => navigation.navigate('AgendaTarefas'),
        profiles: ['admin_sistema', 'admin_empresa', 'responsavel', 'colaborador']
      },
      {
        title: 'Ponto',
        description: 'Registrar ponto',
        icon: 'clock',
        onPress: () => navigation.navigate('RegistrarPonto'),
        profiles: ['admin_sistema', 'admin_empresa', 'responsavel', 'colaborador']
      },
      {
        title: 'Histórico de Ponto',
        description: 'Visualizar histórico de ponto',
        icon: 'history',
        onPress: () => navigation.navigate('HistoricoPonto'),
        profiles: ['admin_sistema', 'admin_empresa', 'responsavel', 'colaborador']
      },
      {
        title: 'Aprovar Ponto',
        description: 'Aprovar batidas de ponto',
        icon: 'check-circle',
        onPress: () => navigation.navigate('AprovarPonto'),
        profiles: ['admin_sistema', 'admin_empresa', 'responsavel']
      },
      {
        title: 'Férias',
        description: 'Solicitar férias',
        icon: 'beach',
        onPress: () => navigation.navigate('SolicitarFerias'),
        profiles: ['admin_sistema', 'admin_empresa', 'responsavel', 'colaborador']
      },
      {
        title: 'Histórico de Férias',
        description: 'Visualizar histórico de férias',
        icon: 'calendar-heart',
        onPress: () => navigation.navigate('HistoricoFerias'),
        profiles: ['admin_sistema', 'admin_empresa', 'responsavel', 'colaborador']
      },
      {
        title: 'Aprovar Férias',
        description: 'Aprovar solicitações de férias',
        icon: 'check-circle-outline',
        onPress: () => navigation.navigate('AprovarFerias'),
        profiles: ['admin_sistema', 'admin_empresa', 'responsavel']
      },
      {
        title: 'Justificativas',
        description: 'Upload de documentos/justificativas',
        icon: 'file-upload',
        onPress: () => navigation.navigate('UploadDocumento'),
        profiles: ['admin_sistema', 'admin_empresa', 'responsavel', 'colaborador']
      },
      {
        title: 'Histórico de Justificativas',
        description: 'Visualizar histórico de justificativas',
        icon: 'file-document',
        onPress: () => navigation.navigate('HistoricoJustificativas'),
        profiles: ['admin_sistema', 'admin_empresa', 'responsavel', 'colaborador']
      },
      {
        title: 'Aprovar Justificativas',
        description: 'Aprovar justificativas',
        icon: 'approval',
        onPress: () => navigation.navigate('AprovarDocumento'),
        profiles: ['admin_sistema', 'admin_empresa', 'responsavel']
      },
      {
        title: 'Relatórios',
        description: 'Visualizar relatórios',
        icon: 'chart-line',
        onPress: () => navigation.navigate('RelatorioPonto'),
        profiles: ['admin_sistema', 'admin_empresa', 'responsavel']
      }
    ];

    return baseItems.filter(item => item.profiles.includes(userProfile));
  };

  const menuItems = getMenuItems();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title>Bem-vindo ao Sistema</Title>
          <Paragraph>Gerencie empresas, colaboradores e tarefas</Paragraph>
        </View>

        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <Card key={index} style={styles.menuCard} onPress={item.onPress}>
              <Card.Content style={styles.menuContent}>
                <Title style={styles.menuTitle}>{item.title}</Title>
                <Paragraph style={styles.menuDescription}>
                  {item.description}
                </Paragraph>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      {userProfile === 'admin_sistema' && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('CompanyRegister')}
          label="Nova Empresa"
        />
      )}
      {userProfile === 'admin_empresa' && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('CadastroColaborador')}
          label="Novo Colaborador"
        />
      )}
      {(userProfile === 'admin_empresa' || userProfile === 'responsavel') && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('CriarTarefa')}
          label="Nova Tarefa"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#1976d2',
  },
  menuGrid: {
    padding: 16,
  },
  menuCard: {
    marginBottom: 16,
    elevation: 2,
  },
  menuContent: {
    padding: 20,
  },
  menuTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  menuDescription: {
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});