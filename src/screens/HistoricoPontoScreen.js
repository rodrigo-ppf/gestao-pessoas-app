import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Chip,
    DataTable,
    Paragraph,
    Searchbar,
    Title
} from 'react-native-paper';

// Dados mockados para demonstração
const mockHistoricoPonto = [
  {
    id: 1,
    data: '2024-01-15',
    entrada: '08:00',
    saidaAlmoco: '12:00',
    entradaAlmoco: '13:00',
    saida: '17:00',
    totalHoras: '08:00',
    status: 'aprovado'
  },
  {
    id: 2,
    data: '2024-01-14',
    entrada: '08:15',
    saidaAlmoco: '12:00',
    entradaAlmoco: '13:00',
    saida: '17:15',
    totalHoras: '08:00',
    status: 'aprovado'
  },
  {
    id: 3,
    data: '2024-01-13',
    entrada: '08:00',
    saidaAlmoco: '12:00',
    entradaAlmoco: '13:00',
    saida: '16:30',
    totalHoras: '07:30',
    status: 'pendente'
  },
  {
    id: 4,
    data: '2024-01-12',
    entrada: '08:30',
    saidaAlmoco: '12:00',
    entradaAlmoco: '13:00',
    saida: '17:30',
    totalHoras: '08:00',
    status: 'rejeitado'
  }
];

export default function HistoricoPontoScreen({ navigation }) {
  const [historico, setHistorico] = useState(mockHistoricoPonto);
  const [filteredHistorico, setFilteredHistorico] = useState(mockHistoricoPonto);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedPeriod, setSelectedPeriod] = useState('mes');

  useEffect(() => {
    filterHistorico();
  }, [searchQuery, filterStatus, selectedPeriod, historico]);

  const filterHistorico = () => {
    let filtered = historico;

    // Filtro por texto (busca por data)
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.data.includes(searchQuery)
      );
    }

    // Filtro por status
    if (filterStatus !== 'todos') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Filtro por período
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (selectedPeriod === 'mes') {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.data);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      });
    } else if (selectedPeriod === 'semana') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item => new Date(item.data) >= weekAgo);
    }

    setFilteredHistorico(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado': return '#4caf50';
      case 'pendente': return '#f39c12';
      case 'rejeitado': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'aprovado': return 'Aprovado';
      case 'pendente': return 'Pendente';
      case 'rejeitado': return 'Rejeitado';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateTotalHours = () => {
    const totalMinutes = filteredHistorico.reduce((total, item) => {
      const [hours, minutes] = item.totalHoras.split(':').map(Number);
      return total + (hours * 60 + minutes);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleJustify = (item) => {
    Alert.alert(
      'Justificar Ponto',
      `Deseja justificar o ponto do dia ${formatDate(item.data)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Justificar',
          onPress: () => {
            // TODO: Navegar para tela de justificativa
            Alert.alert('Justificativa', 'Redirecionando para tela de justificativa...');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Histórico de Ponto</Title>
        <Paragraph>Visualize seu histórico de batidas de ponto</Paragraph>
      </View>

      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Buscar por data..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          <Chip
            selected={selectedPeriod === 'semana'}
            onPress={() => setSelectedPeriod('semana')}
            style={styles.chip}
          >
            Última Semana
          </Chip>
          <Chip
            selected={selectedPeriod === 'mes'}
            onPress={() => setSelectedPeriod('mes')}
            style={styles.chip}
          >
            Este Mês
          </Chip>
          <Chip
            selected={selectedPeriod === 'todos'}
            onPress={() => setSelectedPeriod('todos')}
            style={styles.chip}
          >
            Todos
          </Chip>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          <Chip
            selected={filterStatus === 'todos'}
            onPress={() => setFilterStatus('todos')}
            style={styles.chip}
          >
            Todos
          </Chip>
          <Chip
            selected={filterStatus === 'aprovado'}
            onPress={() => setFilterStatus('aprovado')}
            style={styles.chip}
          >
            Aprovados
          </Chip>
          <Chip
            selected={filterStatus === 'pendente'}
            onPress={() => setFilterStatus('pendente')}
            style={styles.chip}
          >
            Pendentes
          </Chip>
          <Chip
            selected={filterStatus === 'rejeitado'}
            onPress={() => setFilterStatus('rejeitado')}
            style={styles.chip}
          >
            Rejeitados
          </Chip>
        </ScrollView>
      </View>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title style={styles.summaryTitle}>Resumo do Período</Title>
          <View style={styles.summaryRow}>
            <Paragraph style={styles.summaryLabel}>Total de Horas:</Paragraph>
            <Paragraph style={styles.summaryValue}>{calculateTotalHours()}</Paragraph>
          </View>
          <View style={styles.summaryRow}>
            <Paragraph style={styles.summaryLabel}>Dias Trabalhados:</Paragraph>
            <Paragraph style={styles.summaryValue}>{filteredHistorico.length}</Paragraph>
          </View>
        </Card.Content>
      </Card>

      <ScrollView style={styles.content}>
        {filteredHistorico.length > 0 ? (
          <DataTable style={styles.dataTable}>
            <DataTable.Header>
              <DataTable.Title>Data</DataTable.Title>
              <DataTable.Title>Entrada</DataTable.Title>
              <DataTable.Title>Almoço</DataTable.Title>
              <DataTable.Title>Saída</DataTable.Title>
              <DataTable.Title>Total</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
            </DataTable.Header>

            {filteredHistorico.map((item) => (
              <DataTable.Row key={item.id}>
                <DataTable.Cell>{formatDate(item.data)}</DataTable.Cell>
                <DataTable.Cell>{item.entrada}</DataTable.Cell>
                <DataTable.Cell>
                  {item.saidaAlmoco} - {item.entradaAlmoco}
                </DataTable.Cell>
                <DataTable.Cell>{item.saida}</DataTable.Cell>
                <DataTable.Cell>{item.totalHoras}</DataTable.Cell>
                <DataTable.Cell>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                    textStyle={styles.statusChipText}
                  >
                    {getStatusLabel(item.status)}
                  </Chip>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Title style={styles.emptyTitle}>Nenhum registro encontrado</Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery || filterStatus !== 'todos' || selectedPeriod !== 'todos'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Nenhum ponto registrado no período selecionado'}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('RegistrarPonto')}
          style={styles.actionButton}
          icon="clock"
        >
          Registrar Ponto
        </Button>
      </View>
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
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
  },
  summaryCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  summaryTitle: {
    marginBottom: 12,
    color: '#1976d2',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontWeight: 'bold',
    color: '#666',
  },
  summaryValue: {
    color: '#333',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dataTable: {
    backgroundColor: '#fff',
    elevation: 2,
    borderRadius: 8,
  },
  statusChip: {
    marginVertical: 2,
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
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    paddingVertical: 8,
  },
});
