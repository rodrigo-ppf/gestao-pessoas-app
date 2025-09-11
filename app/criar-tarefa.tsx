import FloatingMenu from '@/components/FloatingMenu';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Paragraph, SegmentedButtons, TextInput, Title } from 'react-native-paper';

export default function CriarTarefaScreen() {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('Média');
  const [dataPrazo, setDataPrazo] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const usuarios = MockDataService.getUsuariosByEmpresa(user?.empresaId || '');
  const [responsavelSelecionado, setResponsavelSelecionado] = useState('');

  const handleCriarTarefa = async () => {
    if (!titulo || !descricao) {
      Alert.alert(t('common.error'), t('task.fillTitleAndDescription'));
      return;
    }

    setLoading(true);
    
    try {
      const novaTarefa = await MockDataService.createTarefa({
        titulo,
        descricao,
        prioridade: prioridade as 'Baixa' | 'Média' | 'Alta',
        status: 'Pendente',
        empresaId: user?.empresaId || '',
        responsavelId: responsavelSelecionado || undefined,
        criadorId: user?.id || '',
        dataPrazo: dataPrazo || undefined
      });

      Alert.alert(
        t('common.success'), 
        `${t('task.taskCreated')}: "${novaTarefa.titulo}"`,
        [
          {
            text: t('common.ok'),
            onPress: () => router.push('/tarefas')
          }
        ]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('task.taskCreationError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    Alert.alert(
      t('common.warning'),
      'Tem certeza que deseja cancelar a criação da tarefa?',
      [
        {
          text: t('common.no'),
          style: 'cancel'
        },
        {
          text: t('common.yes'),
          onPress: () => router.push('/tarefas')
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title>Criar Tarefa</Title>
          <Paragraph>Preencha os dados da nova tarefa</Paragraph>
        </View>

        <Card style={styles.formCard}>
          <Card.Content>
            <TextInput
              label="Título da Tarefa"
              value={titulo}
              onChangeText={setTitulo}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Descrição"
              value={descricao}
              onChangeText={setDescricao}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
            />

            <View style={styles.prioridadeSection}>
              <Paragraph style={styles.sectionTitle}>Prioridade</Paragraph>
              <SegmentedButtons
                value={prioridade}
                onValueChange={setPrioridade}
                buttons={[
                  { value: 'Baixa', label: 'Baixa' },
                  { value: 'Média', label: 'Média' },
                  { value: 'Alta', label: 'Alta' }
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            <TextInput
              label="Data de Prazo (opcional)"
              value={dataPrazo}
              onChangeText={setDataPrazo}
              style={styles.input}
              mode="outlined"
              placeholder="DD/MM/AAAA"
            />

            <View style={styles.responsavelSection}>
              <Paragraph style={styles.sectionTitle}>Responsável (opcional)</Paragraph>
              {usuarios.map((usuario) => (
                <Button
                  key={usuario.id}
                  mode={responsavelSelecionado === usuario.id ? 'contained' : 'outlined'}
                  onPress={() => setResponsavelSelecionado(
                    responsavelSelecionado === usuario.id ? '' : usuario.id
                  )}
                  style={styles.responsavelButton}
                >
                  {usuario.nome} - {usuario.cargo}
                </Button>
              ))}
            </View>
            
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleCancelar}
                style={styles.cancelButton}
                icon="arrow-left"
              >
                {t('common.cancel')}
              </Button>
              
              <Button
                mode="contained"
                onPress={handleCriarTarefa}
                loading={loading}
                style={styles.saveButton}
                icon="check"
              >
                {t('task.createTask')}
              </Button>
            </View>
          </Card.Content>
        </Card>
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
  formCard: {
    margin: 16,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  prioridadeSection: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  responsavelSection: {
    marginBottom: 16,
  },
  responsavelButton: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 5,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 5,
  },
});
