import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Chip,
    DataTable,
    IconButton,
    Menu,
    Paragraph,
    Searchbar,
    Title
} from 'react-native-paper';

// Dados mockados para demonstração
const mockPontoParaAprovacao = [
  {
    id: 1,
    colaborador: 'João Silva',
    codigoUsuario: 'USR001',
    data: '2024-01-15',
    entrada: '08:00',
    saidaAlmoco: '12:00',
    entradaAlmoco: '13:00',
    saida: '17:00',
    totalHoras: '08:00',
    status: 'pendente',
    observacoes: ''
  },
  {
    id: 2,
    colaborador: 'Maria Santos',
    codigoUsuario: 'USR002',
    data: '2024-01-15',
    entrada: '08:15',
    saidaAlmoco: '12:00',
    entradaAlmoco: '13:00',
    saida: '17:15',
    totalHoras: '08:00',
    status: 'pendente',
    observacoes: ''
  },
  {
    id: 3,
    colaborador: 'Pedro Costa',
    codigoUsuario: 'USR003',
    data: '2024-01-15',
    entrada: '08:30',
    saidaAlmoco: '12:00',
    entradaAlmoco: '13:00',
    saida: '16:30',
    totalHoras: '07:30',
    status: 'pendente',
    observacoes: 'Saída antecipada por motivo médico'
  },
  {
    id: 4,
    colaborador: 'Ana Oliveira',
    codigoUsuario: 'USR004',
    data: '2024-01-14',
    entrada: '08:00',
    saidaAlmoco: '12:00',
    entradaAlmoco: '13:00',
    saida: '17:00',
    totalHoras: '08:00',
    status: 'pendente',
    observacoes: ''
  }
];

export default function AprovarPontoScreen({ navigation }) {
  const [pontosParaAprovacao, setPontosParaAprovacao] = useState(mockPontoParaAprovacao);
  const [filteredPontos, setFilteredPontos] = useState(mockPontoParaAprovacao);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState({});

  useEffect(() => {
    filterPontos();
  }, [searchQuery, pontosParaAprovacao]);

  const filterPontos = () => {
    let filtered = pontosParaAprovacao;

    // Filtro por texto
    if (searchQuery) {
      filtered = filtered.filter(ponto =>
        ponto.colaborador.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ponto.codigoUsuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ponto.data.includes(searchQuery)
      );
    }

    setFilteredPontos(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado': return '#4caf50';
      case 'pendente': return '#ff9800';
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleApprove = (ponto) => {
    Alert.alert(
      'Aprovar Ponto',
      `Deseja aprovar o ponto de ${ponto.colaborador} do dia ${formatDate(ponto.data)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprovar',
          onPress: () => {
            setPontosParaAprovacao(prev => 
              prev.map(p => 
                p.id === ponto.id ? { ...p, status: 'aprovado' } : p
              )
            );
            Alert.alert('Sucesso', 'Ponto aprovado com sucesso!');
          }
        }
      ]
    );
  };

  const handleReject = (ponto) => {
    Alert.alert(
      'Rejeitar Ponto',
      `Deseja rejeitar o ponto de ${ponto.colaborador} do dia ${formatDate(ponto.data)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: () => {
            setPontosParaAprovacao(prev => 
              prev.map(p => 
                p.id === ponto.id ? { ...p, status: 'rejeitado' } : p
              )
            );
            Alert.alert('Sucesso', 'Ponto rejeitado!');
          }
        }
      ]
    );
  };

  const handleViewDetails = (ponto) => {
    Alert.alert(
      'Detalhes do Ponto',
      `Colaborador: ${ponto.colaborador}\n` +
      `Data: ${formatDate(ponto.data)}\n` +
      `Entrada: ${ponto.entrada}\n` +
      `Almoço: ${ponto.saidaAlmoco} - ${ponto.entradaAlmoco}\n` +
      `Saída: ${ponto.saida}\n` +
      `Total: ${ponto.totalHoras}\n` +
      `Observações: ${ponto.observacoes || 'Nenhuma'}`
    );
  };

  const toggleMenu = (id) => {
    setMenuVisible(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getPendingCount = () => {
    return pontosParaAprovacao.filter(p => p.status === 'pendente').length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Aprovar Ponto</Title>
        <Paragraph>Gerencie as aprovações de ponto dos colaboradores</Paragraph>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Title style={styles.statNumber}>{getPendingCount()}</Title>
            <Paragraph style={styles.statLabel}>Pendentes</Paragraph>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Title style={styles.statNumber}>{filteredPontos.length}</Title>
            <Paragraph style={styles.statLabel}>Total</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Buscar colaboradores..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <ScrollView style={styles.content}>
        {filteredPontos.length > 0 ? (
          <DataTable style={styles.dataTable}>
            <DataTable.Header>
              <DataTable.Title>Colaborador</DataTable.Title>
              <DataTable.Title>Data</DataTable.Title>
              <DataTable.Title>Total</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title>Ações</DataTable.Title>
            </DataTable.Header>

            {filteredPontos.map((ponto) => (
              <DataTable.Row key={ponto.id}>
                <DataTable.Cell>
                  <View>
                    <Paragraph style={styles.colaboradorName}>{ponto.colaborador}</Paragraph>
                    <Paragraph style={styles.colaboradorCode}>{ponto.codigoUsuario}</Paragraph>
                  </View>
                </DataTable.Cell>
                <DataTable.Cell>{formatDate(ponto.data)}</DataTable.Cell>
                <DataTable.Cell>{ponto.totalHoras}</DataTable.Cell>
                <DataTable.Cell>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(ponto.status) }]}
                    textStyle={styles.statusChipText}
                  >
                    {getStatusLabel(ponto.status)}
                  </Chip>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Menu
                    visible={menuVisible[ponto.id]}
                    onDismiss={() => toggleMenu(ponto.id)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        onPress={() => toggleMenu(ponto.id)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        toggleMenu(ponto.id);
                        handleViewDetails(ponto);
                      }}
                      title="Ver Detalhes"
                      leadingIcon="eye"
                    />
                    {ponto.status === 'pendente' && (
                      <>
                        <Menu.Item
                          onPress={() => {
                            toggleMenu(ponto.id);
                            handleApprove(ponto);
                          }}
                          title="Aprovar"
                          leadingIcon="check"
                        />
                        <Menu.Item
                          onPress={() => {
                            toggleMenu(ponto.id);
                            handleReject(ponto);
                          }}
                          title="Rejeitar"
                          leadingIcon="close"
                          titleStyle={{ color: '#f44336' }}
                        />
                      </>
                    )}
                  </Menu>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Title style={styles.emptyTitle}>Nenhum ponto encontrado</Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery
                  ? 'Tente ajustar os filtros de busca'
                  : 'Não há pontos para aprovação no momento'}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('HistoricoPonto')}
          style={styles.actionButton}
          icon="history"
        >
          Ver Histórico
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  filtersContainer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchbar: {
    marginBottom: 0,
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
  colaboradorName: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  colaboradorCode: {
    fontSize: 10,
    color: '#666',
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
