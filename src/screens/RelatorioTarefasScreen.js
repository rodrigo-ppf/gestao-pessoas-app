import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Chip,
    DataTable,
    Paragraph,
    Title
} from 'react-native-paper';

export default function RelatorioTarefasScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');

  // Dados mockados para demonstração
  const mockRelatorioTarefas = [
    {
      colaborador: 'João Silva',
      tarefasConcluidas: 15,
      tarefasPendentes: 3,
      tarefasEmAndamento: 2,
      produtividade: '85%'
    },
    {
      colaborador: 'Maria Santos',
      tarefasConcluidas: 12,
      tarefasPendentes: 5,
      tarefasEmAndamento: 1,
      produtividade: '75%'
    },
    {
      colaborador: 'Pedro Costa',
      tarefasConcluidas: 18,
      tarefasPendentes: 2,
      tarefasEmAndamento: 3,
      produtividade: '92%'
    }
  ];

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'semana': return 'Última Semana';
      case 'mes': return 'Este Mês';
      case 'ano': return 'Este Ano';
      default: return period;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Relatório de Tarefas</Title>
        <Paragraph>Relatório de produtividade e execução de tarefas</Paragraph>
      </View>

      <View style={styles.filtersContainer}>
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
            selected={selectedPeriod === 'ano'}
            onPress={() => setSelectedPeriod('ano')}
            style={styles.chip}
          >
            Este Ano
          </Chip>
        </ScrollView>
      </View>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title style={styles.summaryTitle}>Resumo do Período</Title>
          <View style={styles.summaryRow}>
            <Paragraph style={styles.summaryLabel}>Período:</Paragraph>
            <Paragraph style={styles.summaryValue}>{getPeriodLabel(selectedPeriod)}</Paragraph>
          </View>
          <View style={styles.summaryRow}>
            <Paragraph style={styles.summaryLabel}>Total de Tarefas:</Paragraph>
            <Paragraph style={styles.summaryValue}>45</Paragraph>
          </View>
          <View style={styles.summaryRow}>
            <Paragraph style={styles.summaryLabel}>Taxa de Conclusão:</Paragraph>
            <Paragraph style={styles.summaryValue}>84%</Paragraph>
          </View>
        </Card.Content>
      </Card>

      <ScrollView style={styles.content}>
        <DataTable style={styles.dataTable}>
          <DataTable.Header>
            <DataTable.Title>Colaborador</DataTable.Title>
            <DataTable.Title>Concluídas</DataTable.Title>
            <DataTable.Title>Pendentes</DataTable.Title>
            <DataTable.Title>Em Andamento</DataTable.Title>
            <DataTable.Title>Produtividade</DataTable.Title>
          </DataTable.Header>

          {mockRelatorioTarefas.map((item, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell>{item.colaborador}</DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  style={[styles.statusChip, { backgroundColor: '#4caf50' }]}
                  textStyle={styles.statusChipText}
                >
                  {item.tarefasConcluidas}
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  style={[styles.statusChip, { backgroundColor: '#ff9800' }]}
                  textStyle={styles.statusChipText}
                >
                  {item.tarefasPendentes}
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  style={[styles.statusChip, { backgroundColor: '#2196f3' }]}
                  textStyle={styles.statusChipText}
                >
                  {item.tarefasEmAndamento}
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  style={[styles.statusChip, { backgroundColor: '#9c27b0' }]}
                  textStyle={styles.statusChipText}
                >
                  {item.produtividade}
                </Chip>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </ScrollView>

      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          onPress={() => Alert.alert('Exportar', 'Funcionalidade de exportação será implementada')}
          style={styles.actionButton}
          icon="download"
        >
          Exportar Relatório
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
  chipsContainer: {
    flexDirection: 'row',
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
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    paddingVertical: 8,
  },
});
