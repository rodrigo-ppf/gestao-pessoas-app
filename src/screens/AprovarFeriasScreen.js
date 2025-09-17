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
const mockFeriasParaAprovacao = [
  {
    id: 1,
    colaborador: 'João Silva',
    codigoUsuario: 'USR001',
    dataInicio: '2024-02-01',
    dataFim: '2024-02-15',
    quantidadeDias: 15,
    tipoFerias: 'ferias',
    status: 'pendente',
    dataSolicitacao: '2024-01-10',
    observacoes: ''
  },
  {
    id: 2,
    colaborador: 'Maria Santos',
    codigoUsuario: 'USR002',
    dataInicio: '2024-03-01',
    dataFim: '2024-03-10',
    quantidadeDias: 10,
    tipoFerias: 'ferias_antecipadas',
    status: 'pendente',
    dataSolicitacao: '2024-01-12',
    observacoes: 'Férias antecipadas para viagem familiar'
  },
  {
    id: 3,
    colaborador: 'Pedro Costa',
    codigoUsuario: 'USR003',
    dataInicio: '2024-04-01',
    dataFim: '2024-04-30',
    quantidadeDias: 30,
    tipoFerias: 'ferias',
    status: 'pendente',
    dataSolicitacao: '2024-01-15',
    observacoes: ''
  },
  {
    id: 4,
    colaborador: 'Ana Oliveira',
    codigoUsuario: 'USR004',
    dataInicio: '2024-05-01',
    dataFim: '2024-05-05',
    quantidadeDias: 5,
    tipoFerias: 'abono_pecuniario',
    status: 'pendente',
    dataSolicitacao: '2024-01-18',
    observacoes: 'Abono pecuniário para complementar férias'
  }
];

export default function AprovarFeriasScreen({ navigation }) {
  const [feriasParaAprovacao, setFeriasParaAprovacao] = useState(mockFeriasParaAprovacao);
  const [filteredFerias, setFilteredFerias] = useState(mockFeriasParaAprovacao);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState({});

  useEffect(() => {
    filterFerias();
  }, [searchQuery, feriasParaAprovacao]);

  const filterFerias = () => {
    let filtered = feriasParaAprovacao;

    // Filtro por texto
    if (searchQuery) {
      filtered = filtered.filter(ferias =>
        ferias.colaborador.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ferias.codigoUsuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ferias.dataInicio.includes(searchQuery) ||
        ferias.dataFim.includes(searchQuery)
      );
    }

    setFilteredFerias(filtered);
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

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'ferias': return 'Férias Normais';
      case 'ferias_antecipadas': return 'Férias Antecipadas';
      case 'abono_pecuniario': return 'Abono Pecuniário';
      default: return tipo;
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

  const handleApprove = (ferias) => {
    Alert.alert(
      'Aprovar Férias',
      `Deseja aprovar as férias de ${ferias.colaborador} de ${formatDate(ferias.dataInicio)} a ${formatDate(ferias.dataFim)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprovar',
          onPress: () => {
            setFeriasParaAprovacao(prev => 
              prev.map(f => 
                f.id === ferias.id ? { ...f, status: 'aprovado' } : f
              )
            );
            Alert.alert('Sucesso', 'Férias aprovadas com sucesso!');
          }
        }
      ]
    );
  };

  const handleReject = (ferias) => {
    Alert.alert(
      'Rejeitar Férias',
      `Deseja rejeitar as férias de ${ferias.colaborador}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: () => {
            setFeriasParaAprovacao(prev => 
              prev.map(f => 
                f.id === ferias.id ? { ...f, status: 'rejeitado' } : f
              )
            );
            Alert.alert('Sucesso', 'Férias rejeitadas!');
          }
        }
      ]
    );
  };

  const handleViewDetails = (ferias) => {
    Alert.alert(
      'Detalhes das Férias',
      `Colaborador: ${ferias.colaborador}\n` +
      `Período: ${formatDate(ferias.dataInicio)} a ${formatDate(ferias.dataFim)}\n` +
      `Dias: ${ferias.quantidadeDias}\n` +
      `Tipo: ${getTipoLabel(ferias.tipoFerias)}\n` +
      `Solicitado em: ${formatDate(ferias.dataSolicitacao)}\n` +
      `Observações: ${ferias.observacoes || 'Nenhuma'}`
    );
  };

  const toggleMenu = (id) => {
    setMenuVisible(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getPendingCount = () => {
    return feriasParaAprovacao.filter(f => f.status === 'pendente').length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Aprovar Férias</Title>
        <Paragraph>Gerencie as aprovações de férias dos colaboradores</Paragraph>
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
            <Title style={styles.statNumber}>{filteredFerias.length}</Title>
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
        {filteredFerias.length > 0 ? (
          <DataTable style={styles.dataTable}>
            <DataTable.Header>
              <DataTable.Title>Colaborador</DataTable.Title>
              <DataTable.Title>Período</DataTable.Title>
              <DataTable.Title>Dias</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title>Ações</DataTable.Title>
            </DataTable.Header>

            {filteredFerias.map((ferias) => (
              <DataTable.Row key={ferias.id}>
                <DataTable.Cell>
                  <View>
                    <Paragraph style={styles.colaboradorName}>{ferias.colaborador}</Paragraph>
                    <Paragraph style={styles.colaboradorCode}>{ferias.codigoUsuario}</Paragraph>
                    <Paragraph style={styles.tipoFerias}>{getTipoLabel(ferias.tipoFerias)}</Paragraph>
                  </View>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Paragraph style={styles.periodo}>
                    {formatDate(ferias.dataInicio)} - {formatDate(ferias.dataFim)}
                  </Paragraph>
                </DataTable.Cell>
                <DataTable.Cell>{ferias.quantidadeDias}</DataTable.Cell>
                <DataTable.Cell>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(ferias.status) }]}
                    textStyle={styles.statusChipText}
                  >
                    {getStatusLabel(ferias.status)}
                  </Chip>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Menu
                    visible={menuVisible[ferias.id]}
                    onDismiss={() => toggleMenu(ferias.id)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        onPress={() => toggleMenu(ferias.id)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        toggleMenu(ferias.id);
                        handleViewDetails(ferias);
                      }}
                      title="Ver Detalhes"
                      leadingIcon="eye"
                    />
                    {ferias.status === 'pendente' && (
                      <>
                        <Menu.Item
                          onPress={() => {
                            toggleMenu(ferias.id);
                            handleApprove(ferias);
                          }}
                          title="Aprovar"
                          leadingIcon="check"
                        />
                        <Menu.Item
                          onPress={() => {
                            toggleMenu(ferias.id);
                            handleReject(ferias);
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
              <Title style={styles.emptyTitle}>Nenhuma solicitação encontrada</Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery
                  ? 'Tente ajustar os filtros de busca'
                  : 'Não há solicitações de férias para aprovação no momento'}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('HistoricoFerias')}
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
  tipoFerias: {
    fontSize: 10,
    color: '#1976d2',
    fontStyle: 'italic',
  },
  periodo: {
    fontSize: 11,
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
