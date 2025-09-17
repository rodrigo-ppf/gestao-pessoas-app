import MockDataService, { HistoricoTarefa } from '@/src/services/MockDataService';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Chip, Paragraph, Title } from 'react-native-paper';

interface TaskHistoryProps {
  tarefaId: string;
}

export default function TaskHistory({ tarefaId }: TaskHistoryProps) {
  const historico = MockDataService.getHistoricoTarefa(tarefaId);

  const getAcaoTexto = (acao: HistoricoTarefa['acao']) => {
    switch (acao) {
      case 'criada':
        return 'Tarefa criada';
      case 'atualizada':
        return 'Tarefa atualizada';
      case 'status_alterado':
        return 'Status alterado';
      case 'responsavel_alterado':
        return 'Responsável alterado';
      case 'prioridade_alterada':
        return 'Prioridade alterada';
      case 'prazo_alterado':
        return 'Prazo alterado';
      case 'concluida':
        return 'Tarefa concluída';
      case 'cancelada':
        return 'Tarefa cancelada';
      default:
        return 'Alteração realizada';
    }
  };

  const getAcaoColor = (acao: HistoricoTarefa['acao']) => {
    switch (acao) {
      case 'criada':
        return '#4caf50';
      case 'status_alterado':
        return '#f39c12';
      case 'responsavel_alterado':
        return '#2196f3';
      case 'prioridade_alterada':
        return '#9c27b0';
      case 'prazo_alterado':
        return '#e74c3c';
      case 'concluida':
        return '#4caf50';
      case 'cancelada':
        return '#f44336';
      default:
        return '#607d8b';
    }
  };

  const formatarData = (data: string) => {
    const date = new Date(data);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarAlteracao = (item: HistoricoTarefa) => {
    if (item.campo && item.valorAnterior && item.valorNovo) {
      return `${item.campo}: "${item.valorAnterior}" → "${item.valorNovo}"`;
    }
    return item.observacoes || '';
  };

  if (historico.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Card.Content>
          <Paragraph style={styles.emptyText}>
            Nenhum histórico de alterações encontrado.
          </Paragraph>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Histórico de Alterações</Title>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {historico.map((item, index) => (
          <Card key={item.id} style={styles.historyCard}>
            <Card.Content>
              <View style={styles.header}>
                <Chip
                  style={[styles.actionChip, { backgroundColor: getAcaoColor(item.acao) }]}
                  textStyle={styles.chipText}
                >
                  {getAcaoTexto(item.acao)}
                </Chip>
                <Paragraph style={styles.date}>
                  {formatarData(item.dataAlteracao)}
                </Paragraph>
              </View>
              
              <Paragraph style={styles.user}>
                Por: <Paragraph style={styles.userName}>{item.usuarioNome}</Paragraph>
              </Paragraph>
              
              {formatarAlteracao(item) && (
                <Paragraph style={styles.change}>
                  {formatarAlteracao(item)}
                </Paragraph>
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  scrollView: {
    maxHeight: 300,
  },
  historyCard: {
    marginBottom: 8,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionChip: {
    height: 28,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  user: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  userName: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  change: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  emptyCard: {
    marginTop: 16,
    elevation: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});
