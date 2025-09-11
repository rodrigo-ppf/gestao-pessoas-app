import FloatingMenu from '@/components/FloatingMenu';
import { useAuth } from '@/src/contexts/AuthContext';
import MockDataService, { Tarefa } from '@/src/services/MockDataService';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Paragraph, Title } from 'react-native-paper';

export default function TarefasScreen() {
  const { user } = useAuth();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);

  useEffect(() => {
    loadTarefas();
  }, []);

  const loadTarefas = () => {
    if (user?.perfil === 'admin_sistema') {
      setTarefas(MockDataService.getTarefas());
    } else {
      setTarefas(MockDataService.getTarefasByEmpresa(user?.empresaId || ''));
    }
  };

  const handleExecutarTarefa = async (tarefaId: string) => {
    try {
      await MockDataService.updateTarefaStatus(tarefaId, 'Em Andamento', user?.id);
      loadTarefas();
    } catch (error) {
      console.error('Erro ao executar tarefa:', error);
    }
  };

  const handleConcluirTarefa = async (tarefaId: string) => {
    try {
      await MockDataService.updateTarefaStatus(tarefaId, 'Concluída', user?.id);
      loadTarefas();
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
    }
  };

  const getResponsavelNome = (responsavelId?: string) => {
    if (!responsavelId) return 'Não atribuído';
    const responsavel = MockDataService.getUsuarioById(responsavelId);
    return responsavel ? responsavel.nome : 'Usuário não encontrado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída':
        return '#4caf50';
      case 'Em Andamento':
        return '#ff9800';
      case 'Pendente':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta':
        return '#f44336';
      case 'Média':
        return '#ff9800';
      case 'Baixa':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title>Tarefas</Title>
          <Paragraph>Gerencie as tarefas da equipe</Paragraph>
        </View>

        <View style={styles.list}>
          {tarefas.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Title style={styles.emptyTitle}>Nenhuma tarefa encontrada</Title>
                <Paragraph style={styles.emptyText}>
                  {user?.perfil === 'colaborador' 
                    ? 'Você não possui tarefas atribuídas ainda.'
                    : 'Crie uma nova tarefa para começar.'
                  }
                </Paragraph>
              </Card.Content>
            </Card>
          ) : (
            tarefas.map((tarefa) => (
              <Card key={tarefa.id} style={styles.card}>
                <Card.Content>
                  <Title style={styles.cardTitle}>{tarefa.titulo}</Title>
                  <Paragraph style={styles.description}>{tarefa.descricao}</Paragraph>
                  
                  <View style={styles.chips}>
                    <Chip 
                      style={[styles.chip, { backgroundColor: getStatusColor(tarefa.status) }]}
                      textStyle={styles.chipText}
                    >
                      {tarefa.status}
                    </Chip>
                    <Chip 
                      style={[styles.chip, { backgroundColor: getPrioridadeColor(tarefa.prioridade) }]}
                      textStyle={styles.chipText}
                    >
                      {tarefa.prioridade}
                    </Chip>
                  </View>

                  <Paragraph style={styles.info}>
                    <Paragraph style={styles.label}>Responsável:</Paragraph> {getResponsavelNome(tarefa.responsavelId)}
                  </Paragraph>
                  {tarefa.dataPrazo && (
                    <Paragraph style={styles.info}>
                      <Paragraph style={styles.label}>Prazo:</Paragraph> {tarefa.dataPrazo}
                    </Paragraph>
                  )}
                  {tarefa.dataConclusao && (
                    <Paragraph style={styles.info}>
                      <Paragraph style={styles.label}>Concluída em:</Paragraph> {tarefa.dataConclusao}
                    </Paragraph>
                  )}
                </Card.Content>
                <Card.Actions>
                  {tarefa.status === 'Pendente' && (
                    <Button 
                      mode="contained" 
                      compact
                      onPress={() => handleExecutarTarefa(tarefa.id)}
                    >
                      Executar
                    </Button>
                  )}
                  {tarefa.status === 'Em Andamento' && tarefa.responsavelId === user?.id && (
                    <Button 
                      mode="contained" 
                      compact
                      onPress={() => handleConcluirTarefa(tarefa.id)}
                    >
                      Concluir
                    </Button>
                  )}
                </Card.Actions>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <FloatingMenu />
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
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  emptyCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#f9f9f9',
  },
  emptyTitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
    color: '#666',
  },
  chips: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  chip: {
    height: 28,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
  },
  info: {
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
  },
});
