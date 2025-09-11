import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Calendar,
    Card,
    Chip,
    Paragraph,
    Title
} from 'react-native-paper';

// Dados mockados para demonstração
const mockTarefasAgenda = [
  {
    id: 1,
    codigoTarefa: 'TAR001',
    descricao: 'Implementar tela de login',
    dataTarefa: '2024-01-15',
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
    dataTarefa: '2024-01-15',
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
    dataTarefa: '2024-01-16',
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
    dataTarefa: '2024-01-17',
    horaInicio: '08:00',
    horaFim: '10:00',
    prioridade: 'baixa',
    status: 'pendente',
    colaborador: 'Ana Oliveira'
  }
];

export default function AgendaTarefasScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tarefasAgenda, setTarefasAgenda] = useState(mockTarefasAgenda);
  const [filteredTarefas, setFilteredTarefas] = useState([]);

  useEffect(() => {
    filterTarefasByDate();
  }, [selectedDate, tarefasAgenda]);

  const filterTarefasByDate = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const filtered = tarefasAgenda.filter(tarefa => tarefa.dataTarefa === dateString);
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

  const handleTarefaPress = (tarefa) => {
    if (tarefa.status === 'pendente') {
      navigation.navigate('ExecutarTarefa', { tarefa });
    } else {
      Alert.alert('Tarefa', `Status: ${getStatusLabel(tarefa.status)}`);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMarkedDates = () => {
    const marked = {};
    tarefasAgenda.forEach(tarefa => {
      if (!marked[tarefa.dataTarefa]) {
        marked[tarefa.dataTarefa] = {
          marked: true,
          dots: []
        };
      }
      
      const color = getPrioridadeColor(tarefa.prioridade);
      marked[tarefa.dataTarefa].dots.push({
        color: color,
        selectedDotColor: color
      });
    });
    return marked;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Agenda de Tarefas</Title>
        <Paragraph>Visualize e gerencie suas tarefas por data</Paragraph>
      </View>

      <Card style={styles.calendarCard}>
        <Card.Content>
          <Calendar
            onDayPress={(day) => setSelectedDate(new Date(day.dateString))}
            markedDates={{
              ...getMarkedDates(),
              [selectedDate.toISOString().split('T')[0]]: {
                selected: true,
                selectedColor: '#1976d2'
              }
            }}
            theme={{
              selectedDayBackgroundColor: '#1976d2',
              selectedDayTextColor: '#fff',
              todayTextColor: '#1976d2',
              dayTextColor: '#333',
              textDisabledColor: '#ccc',
              dotColor: '#1976d2',
              selectedDotColor: '#fff',
              arrowColor: '#1976d2',
              monthTextColor: '#333',
              indicatorColor: '#1976d2',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500'
            }}
          />
        </Card.Content>
      </Card>

      <View style={styles.selectedDateContainer}>
        <Title style={styles.selectedDateTitle}>
          {formatDate(selectedDate)}
        </Title>
        <Paragraph style={styles.tarefasCount}>
          {filteredTarefas.length} tarefa(s) agendada(s)
        </Paragraph>
      </View>

      <ScrollView style={styles.content}>
        {filteredTarefas.length > 0 ? (
          filteredTarefas.map((tarefa) => (
            <Card 
              key={tarefa.id} 
              style={styles.card}
              onPress={() => handleTarefaPress(tarefa)}
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.tarefaInfo}>
                    <Title style={styles.codigo}>{tarefa.codigoTarefa}</Title>
                    <Paragraph style={styles.descricao}>{tarefa.descricao}</Paragraph>
                    <Paragraph style={styles.colaborador}>
                      Responsável: {tarefa.colaborador}
                    </Paragraph>
                    <Paragraph style={styles.horario}>
                      {tarefa.horaInicio} - {tarefa.horaFim}
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
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Title style={styles.emptyTitle}>Nenhuma tarefa agendada</Title>
              <Paragraph style={styles.emptyText}>
                Não há tarefas agendadas para esta data.
              </Paragraph>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('CriarTarefa')}
                style={styles.createButton}
                icon="plus"
              >
                Criar Nova Tarefa
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
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
  calendarCard: {
    margin: 16,
    elevation: 2,
  },
  selectedDateContainer: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  selectedDateTitle: {
    fontSize: 18,
    marginBottom: 4,
    color: '#333',
  },
  tarefasCount: {
    color: '#666',
    fontSize: 14,
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
  horario: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
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
    marginBottom: 0,
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
    marginBottom: 16,
  },
  createButton: {
    marginTop: 8,
  },
});
