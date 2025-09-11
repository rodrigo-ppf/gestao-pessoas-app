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
const mockTarefas = [
  {
    id: 1,
    codigoTarefa: 'TAR001',
    descricao: 'Implementar tela de login',
    dataTarefa: '15/01/2024',
    horaInicio: '09:00',
    horaFim: '12:00',
    prioridade: 'alta',
    status: 'pendente',
    colaborador: 'João Silva'
  },
  {
    id: 2,
    codigoTarefa: 'TAR002',
    descricao: 'Revisar documentação do projeto',
    dataTarefa: '16/01/2024',
    horaInicio: '14:00',
    horaFim: '16:00',
    prioridade: 'media',
    status: 'em_andamento',
    colaborador: 'Maria Santos'
  },
  {
    id: 3,
    codigoTarefa: 'TAR003',
    descricao: 'Testes de integração',
    dataTarefa: '17/01/2024',
    horaInicio: '10:00',
    horaFim: '17:00',
    prioridade: 'alta',
    status: 'concluida',
    colaborador: 'Pedro Costa'
  },
  {
    id: 4,
    codigoTarefa: 'TAR004',
    descricao: 'Atualizar base de dados',
    dataTarefa: '18/01/2024',
    horaInicio: '08:00',
    horaFim: '10:00',
    prioridade: 'baixa',
    status: 'pendente',
    colaborador: 'Ana Oliveira'
  }
];

export default function ListaTarefasScreen({ navigation }) {
  const [tarefas, setTarefas] = useState(mockTarefas);
  const [filteredTarefas, setFilteredTarefas] = useState(mockTarefas);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [menuVisible, setMenuVisible] = useState({});

  useEffect(() => {
    filterTarefas();
  }, [searchQuery, filterStatus, tarefas]);

  const filterTarefas = () => {
    let filtered = tarefas;

    // Filtro por texto
    if (searchQuery) {
      filtered = filtered.filter(tarefa =>
        tarefa.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tarefa.codigoTarefa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tarefa.colaborador.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por status
    if (filterStatus !== 'todos') {
      filtered = filtered.filter(tarefa => tarefa.status === filterStatus);
    }

    setFilteredTarefas(filtered);
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baixa': return '#4caf50';
      default: return '#666';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return '#ff9800';
      case 'em_andamento': return '#2196f3';
      case 'concluida': return '#4caf50';
      case 'cancelada': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'em_andamento': return 'Em Andamento';
      case 'concluida': return 'Concluída';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const handleEdit = (tarefa) => {
    // TODO: Implementar edição
    Alert.alert('Editar', `Editar tarefa ${tarefa.codigoTarefa}`);
  };

  const handleExecute = (tarefa) => {
    navigation.navigate('ExecutarTarefa', { tarefa });
  };

  const handleDelete = (tarefa) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a tarefa ${tarefa.codigoTarefa}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setTarefas(prev => prev.filter(t => t.id !== tarefa.id));
            Alert.alert('Sucesso', 'Tarefa excluída com sucesso!');
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

  const getStatusActions = (tarefa) => {
    const actions = [];

    if (tarefa.status === 'pendente') {
      actions.push(
        <Menu.Item
          key="execute"
          onPress={() => {
            toggleMenu(tarefa.id);
            handleExecute(tarefa);
          }}
          title="Executar"
          leadingIcon="play"
        />
      );
    }

    if (tarefa.status === 'em_andamento') {
      actions.push(
        <Menu.Item
          key="complete"
          onPress={() => {
            toggleMenu(tarefa.id);
            // TODO: Marcar como concluída
            Alert.alert('Sucesso', 'Tarefa marcada como concluída!');
          }}
          title="Concluir"
          leadingIcon="check"
        />
      );
    }

    actions.push(
      <Menu.Item
        key="edit"
        onPress={() => {
          toggleMenu(tarefa.id);
          handleEdit(tarefa);
        }}
        title="Editar"
        leadingIcon="pencil"
      />
    );

    actions.push(
      <Divider key="divider" />
    );

    actions.push(
      <Menu.Item
        key="delete"
        onPress={() => {
          toggleMenu(tarefa.id);
          handleDelete(tarefa);
        }}
        title="Excluir"
        leadingIcon="delete"
        titleStyle={{ color: '#f44336' }}
      />
    );

    return actions;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Tarefas</Title>
        <Paragraph>Gerencie as tarefas da equipe</Paragraph>
      </View>

      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Buscar tarefas..."
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
            Todas
          </Chip>
          <Chip
            selected={filterStatus === 'pendente'}
            onPress={() => setFilterStatus('pendente')}
            style={styles.chip}
          >
            Pendentes
          </Chip>
          <Chip
            selected={filterStatus === 'em_andamento'}
            onPress={() => setFilterStatus('em_andamento')}
            style={styles.chip}
          >
            Em Andamento
          </Chip>
          <Chip
            selected={filterStatus === 'concluida'}
            onPress={() => setFilterStatus('concluida')}
            style={styles.chip}
          >
            Concluídas
          </Chip>
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {filteredTarefas.map((tarefa) => (
          <Card key={tarefa.id} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.tarefaInfo}>
                  <Title style={styles.codigo}>{tarefa.codigoTarefa}</Title>
                  <Paragraph style={styles.descricao}>{tarefa.descricao}</Paragraph>
                  <Paragraph style={styles.colaborador}>Responsável: {tarefa.colaborador}</Paragraph>
                  <Paragraph style={styles.data}>
                    {tarefa.dataTarefa} - {tarefa.horaInicio} às {tarefa.horaFim}
                  </Paragraph>
                </View>

                <View style={styles.cardActions}>
                  <Chip
                    style={[styles.prioridadeChip, { backgroundColor: getPrioridadeColor(tarefa.prioridade) }]}
                    textStyle={styles.prioridadeChipText}
                  >
                    {tarefa.prioridade.toUpperCase()}
                  </Chip>
                  
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(tarefa.status) }]}
                    textStyle={styles.statusChipText}
                  >
                    {getStatusLabel(tarefa.status)}
                  </Chip>

                  <Menu
                    visible={menuVisible[tarefa.id]}
                    onDismiss={() => toggleMenu(tarefa.id)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        onPress={() => toggleMenu(tarefa.id)}
                      />
                    }
                  >
                    {getStatusActions(tarefa)}
                  </Menu>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}

        {filteredTarefas.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Title style={styles.emptyTitle}>Nenhuma tarefa encontrada</Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery || filterStatus !== 'todos'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Crie a primeira tarefa clicando no botão +'}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CriarTarefa')}
        label="Nova Tarefa"
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
  tarefaInfo: {
    flex: 1,
  },
  codigo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1976d2',
  },
  descricao: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  colaborador: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  data: {
    fontSize: 12,
    color: '#666',
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  prioridadeChip: {
    marginBottom: 4,
  },
  prioridadeChipText: {
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
