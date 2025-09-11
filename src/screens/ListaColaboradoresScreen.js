import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    Card,
    Chip,
    Divider,
    FAB,
    IconButton,
    Menu,
    Paragraph,
    Searchbar,
    Title
} from 'react-native-paper';

// Dados mockados para demonstração
const mockColaboradores = [
  {
    id: 1,
    codigoUsuario: 'USR001',
    nomeUsuario: 'João Silva',
    email: 'joao.silva@empresa.com',
    cargo: 'Desenvolvedor',
    perfil: 'colaborador',
    status: 'ativo',
    dataEntrada: '15/01/2023'
  },
  {
    id: 2,
    codigoUsuario: 'USR002',
    nomeUsuario: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    cargo: 'Gerente de Projetos',
    perfil: 'responsavel',
    status: 'ativo',
    dataEntrada: '10/03/2022'
  },
  {
    id: 3,
    codigoUsuario: 'USR003',
    nomeUsuario: 'Pedro Costa',
    email: 'pedro.costa@empresa.com',
    cargo: 'Analista',
    perfil: 'colaborador',
    status: 'inativo',
    dataEntrada: '20/06/2023'
  },
  {
    id: 4,
    codigoUsuario: 'USR004',
    nomeUsuario: 'Ana Oliveira',
    email: 'ana.oliveira@empresa.com',
    cargo: 'RH',
    perfil: 'admin_empresa',
    status: 'ativo',
    dataEntrada: '05/09/2021'
  }
];

export default function ListaColaboradoresScreen({ navigation }) {
  const [colaboradores, setColaboradores] = useState(mockColaboradores);
  const [filteredColaboradores, setFilteredColaboradores] = useState(mockColaboradores);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [menuVisible, setMenuVisible] = useState({});

  useEffect(() => {
    filterColaboradores();
  }, [searchQuery, filterStatus, colaboradores]);

  const filterColaboradores = () => {
    let filtered = colaboradores;

    // Filtro por texto
    if (searchQuery) {
      filtered = filtered.filter(colaborador =>
        colaborador.nomeUsuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
        colaborador.codigoUsuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
        colaborador.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por status
    if (filterStatus !== 'todos') {
      filtered = filtered.filter(colaborador => colaborador.status === filterStatus);
    }

    setFilteredColaboradores(filtered);
  };

  const getPerfilColor = (perfil) => {
    switch (perfil) {
      case 'admin_empresa': return '#d32f2f';
      case 'responsavel': return '#f57c00';
      case 'colaborador': return '#388e3c';
      default: return '#666';
    }
  };

  const getPerfilLabel = (perfil) => {
    switch (perfil) {
      case 'admin_empresa': return 'Admin';
      case 'responsavel': return 'Responsável';
      case 'colaborador': return 'Colaborador';
      default: return perfil;
    }
  };

  const getStatusColor = (status) => {
    return status === 'ativo' ? '#4caf50' : '#f44336';
  };

  const handleEdit = (colaborador) => {
    navigation.navigate('EditarColaborador', { colaborador });
  };

  const handleView = (colaborador) => {
    navigation.navigate('PerfilColaborador', { colaborador });
  };

  const handleDelete = (colaborador) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o colaborador ${colaborador.nomeUsuario}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setColaboradores(prev => prev.filter(c => c.id !== colaborador.id));
            Alert.alert('Sucesso', 'Colaborador excluído com sucesso!');
          }
        }
      ]
    );
  };

  const toggleMenu = (id) => {
    setMenuVisible(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Colaboradores</Title>
        <Paragraph>Gerencie os colaboradores da empresa</Paragraph>
      </View>

      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Buscar colaboradores..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          <Chip
            selected={filterStatus === 'todos'}
            onPress={() => setFilterStatus('todos')}
            style={styles.chip}
          >
            Todos
          </Chip>
          <Chip
            selected={filterStatus === 'ativo'}
            onPress={() => setFilterStatus('ativo')}
            style={styles.chip}
          >
            Ativos
          </Chip>
          <Chip
            selected={filterStatus === 'inativo'}
            onPress={() => setFilterStatus('inativo')}
            style={styles.chip}
          >
            Inativos
          </Chip>
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {filteredColaboradores.map((colaborador) => (
          <Card key={colaborador.id} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.colaboradorInfo}>
                  <Title style={styles.nome}>{colaborador.nomeUsuario}</Title>
                  <Paragraph style={styles.codigo}>{colaborador.codigoUsuario}</Paragraph>
                  <Paragraph style={styles.cargo}>{colaborador.cargo}</Paragraph>
                  <Paragraph style={styles.email}>{colaborador.email}</Paragraph>
                </View>

                <View style={styles.cardActions}>
                  <Chip
                    style={[styles.perfilChip, { backgroundColor: getPerfilColor(colaborador.perfil) }]}
                    textStyle={styles.perfilChipText}
                  >
                    {getPerfilLabel(colaborador.perfil)}
                  </Chip>
                  
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(colaborador.status) }]}
                    textStyle={styles.statusChipText}
                  >
                    {colaborador.status}
                  </Chip>

                  <Menu
                    visible={menuVisible[colaborador.id]}
                    onDismiss={() => toggleMenu(colaborador.id)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        onPress={() => toggleMenu(colaborador.id)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        toggleMenu(colaborador.id);
                        handleView(colaborador);
                      }}
                      title="Visualizar"
                      leadingIcon="eye"
                    />
                    <Menu.Item
                      onPress={() => {
                        toggleMenu(colaborador.id);
                        handleEdit(colaborador);
                      }}
                      title="Editar"
                      leadingIcon="pencil"
                    />
                    <Divider />
                    <Menu.Item
                      onPress={() => {
                        toggleMenu(colaborador.id);
                        handleDelete(colaborador);
                      }}
                      title="Excluir"
                      leadingIcon="delete"
                      titleStyle={{ color: '#f44336' }}
                    />
                  </Menu>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}

        {filteredColaboradores.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Title style={styles.emptyTitle}>Nenhum colaborador encontrado</Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery || filterStatus !== 'todos'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Adicione o primeiro colaborador clicando no botão +'}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CadastroColaborador')}
        label="Novo Colaborador"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#1976d2',
  },
  title: {
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    color: '#fff',
    opacity: 0.9,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchbar: {
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  colaboradorInfo: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    marginBottom: 4,
  },
  codigo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  cargo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    color: '#666',
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  perfilChip: {
    marginBottom: 4,
  },
  perfilChipText: {
    color: '#fff',
    fontSize: 10,
  },
  statusChip: {
    marginBottom: 8,
  },
  statusChipText: {
    color: '#fff',
    fontSize: 10,
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
