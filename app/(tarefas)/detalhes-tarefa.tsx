import MainLayout from '@/components/MainLayout';
import TaskHistory from '@/components/TaskHistory';
import UniversalIcon from '@/components/UniversalIcon';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService, { ObservacaoTarefa, Tarefa } from '@/src/services/MockDataService';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, Paragraph, TextInput, Title } from 'react-native-paper';

export default function DetalhesTarefaScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { tarefaId } = useLocalSearchParams();
  
  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [observacoes, setObservacoes] = useState<ObservacaoTarefa[]>([]);
  const [novaObservacao, setNovaObservacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [canAddObservation, setCanAddObservation] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [tarefaId]);

  const carregarDados = async () => {
    if (tarefaId && user?.empresaId) {
      const tarefaEncontrada = MockDataService.getTarefaById(tarefaId as string);
      if (tarefaEncontrada) {
        setTarefa(tarefaEncontrada);
        
        // Carregar observações
        const observacoesTarefa = MockDataService.getObservacoesTarefa(tarefaId as string);
        setObservacoes(observacoesTarefa);
        
        // Verificar se o usuário pode adicionar observações
        // Colaboradores podem adicionar observações em suas tarefas
        const isColaborador = user.perfil === 'colaborador';
        const isResponsavel = tarefaEncontrada.responsavelId === user.id;
        const isGestor = user.perfil === 'gestor' || user.perfil === 'dono_empresa' || user.perfil === 'admin_sistema';
        
        setCanAddObservation(isColaborador || isGestor || isResponsavel);
      }
    }
  };

  const handleAdicionarObservacao = async () => {
    if (!novaObservacao.trim() || !tarefaId || !user) return;

    setLoading(true);
    try {
      const observacao = await MockDataService.adicionarObservacaoTarefa(
        tarefaId as string,
        user.id,
        novaObservacao.trim()
      );

      if (observacao) {
        setObservacoes(prev => [...prev, observacao]);
        setNovaObservacao('');
        Alert.alert('✅ Sucesso', 'Observação adicionada com sucesso!');
      } else {
        Alert.alert('❌ Erro', 'Não foi possível adicionar a observação.');
      }
    } catch (error) {
      console.error('Erro ao adicionar observação:', error);
      Alert.alert('❌ Erro', 'Erro ao adicionar observação.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída':
        return '#4caf50';
      case 'Em Andamento':
        return '#3498db';
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
        return '#f39c12';
      case 'Baixa':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const getResponsavelNome = (responsavelId?: string) => {
    if (!responsavelId) return 'Não atribuído';
    const responsavel = MockDataService.getUsuarioById(responsavelId);
    return responsavel ? responsavel.nome : 'Usuário não encontrado';
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!tarefa) {
    return (
      <MainLayout title="Detalhes da Tarefa" showBackButton={true}>
        <View style={styles.loadingContainer}>
          <Title>Carregando...</Title>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Detalhes da Tarefa" showBackButton={true}>
      <ScrollView style={styles.content}>
        {/* Informações da Tarefa */}
        <Card style={styles.card}>
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

            <View style={styles.infoContainer}>
              <Paragraph style={styles.info}>
                <Paragraph style={styles.label}>Responsável:</Paragraph> {getResponsavelNome(tarefa.responsavelId)}
              </Paragraph>
              <Paragraph style={styles.info}>
                <Paragraph style={styles.label}>Criada em:</Paragraph> {formatarData(tarefa.dataCriacao)}
              </Paragraph>
              {tarefa.dataPrazo && (
                <Paragraph style={styles.info}>
                  <Paragraph style={styles.label}>Prazo:</Paragraph> {formatarData(tarefa.dataPrazo)}
                </Paragraph>
              )}
              {tarefa.dataConclusao && (
                <Paragraph style={styles.info}>
                  <Paragraph style={styles.label}>Concluída em:</Paragraph> {formatarData(tarefa.dataConclusao)}
                </Paragraph>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Histórico de Alterações */}
        <Card style={styles.card}>
          <Card.Content>
            <TaskHistory tarefaId={tarefaId as string} />
          </Card.Content>
        </Card>

        {/* Seção de Observações */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>
                <UniversalIcon name="comment-text" size={20} color="#1976d2" /> Observações
              </Title>
              <Paragraph style={styles.observationCount}>
                {observacoes.length} observação(ões)
              </Paragraph>
            </View>

            {/* Lista de Observações */}
            {observacoes.length === 0 ? (
              <View style={styles.emptyObservations}>
                <Paragraph style={styles.emptyText}>
                  Nenhuma observação ainda. Seja o primeiro a comentar!
                </Paragraph>
              </View>
            ) : (
              <View style={styles.observationsList}>
                {observacoes.map((obs, index) => (
                  <View key={obs.id}>
                    <View style={styles.observationItem}>
                      <View style={styles.observationHeader}>
                        <Paragraph style={styles.observationAuthor}>
                          {obs.usuarioNome}
                        </Paragraph>
                        <Paragraph style={styles.observationDate}>
                          {formatarData(obs.dataCriacao)}
                        </Paragraph>
                      </View>
                      <Paragraph style={styles.observationText}>
                        {obs.observacao}
                      </Paragraph>
                    </View>
                    {index < observacoes.length - 1 && <Divider style={styles.observationDivider} />}
                  </View>
                ))}
              </View>
            )}

            {/* Formulário para Nova Observação */}
            {canAddObservation && (
              <View style={styles.newObservationContainer}>
                <Divider style={styles.divider} />
                <Title style={styles.newObservationTitle}>
                  <UniversalIcon name="plus-circle" size={20} color="#1976d2" /> Adicionar Observação
                </Title>
                
                <TextInput
                  label="Sua observação"
                  value={novaObservacao}
                  onChangeText={setNovaObservacao}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  style={styles.observationInput}
                  placeholder="Descreva o que foi feito, dificuldades encontradas, progresso..."
                />
                
                <Button
                  mode="contained"
                  onPress={handleAdicionarObservacao}
                  loading={loading}
                  disabled={loading || !novaObservacao.trim()}
                  style={styles.addButton}
                  icon="send"
                >
                  Adicionar Observação
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    marginBottom: 16,
    color: '#666',
    lineHeight: 22,
  },
  chips: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  chip: {
    height: 32,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  info: {
    marginBottom: 4,
    fontSize: 14,
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    flexDirection: 'row',
    alignItems: 'center',
  },
  observationCount: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyObservations: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  observationsList: {
    marginBottom: 16,
  },
  observationItem: {
    paddingVertical: 12,
  },
  observationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  observationAuthor: {
    fontWeight: 'bold',
    color: '#1976d2',
    fontSize: 14,
  },
  observationDate: {
    fontSize: 12,
    color: '#666',
  },
  observationText: {
    color: '#333',
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  observationDivider: {
    marginVertical: 8,
  },
  newObservationContainer: {
    marginTop: 16,
  },
  divider: {
    marginBottom: 16,
  },
  newObservationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  observationInput: {
    marginBottom: 16,
  },
  addButton: {
    marginTop: 8,
  },
});
