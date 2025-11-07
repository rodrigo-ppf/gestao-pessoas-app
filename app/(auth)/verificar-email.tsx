import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Paragraph, TextInput, Title } from 'react-native-paper';

export default function VerificarEmailScreen() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [emailVerificacao, setEmailVerificacao] = useState('');
  const [codigoCorreto, setCodigoCorreto] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();
  const { login } = useAuth();

  useEffect(() => {
    console.log('VerificarEmailScreen - Carregando tela de verificação');
    
    // Buscar dados do localStorage
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('emailVerificacao');
      const codigo = localStorage.getItem('codigoVerificacao');
      
      if (email) {
        setEmailVerificacao(email);
      }
      if (codigo) {
        setCodigoCorreto(codigo);
      }
    }
  }, []);

  const handleVerificarCodigo = async () => {
    console.log('handleVerificarCodigo - Iniciando verificação...');
    console.log('Código inserido:', codigo);
    console.log('Código correto:', codigoCorreto);
    
    // Limpar estados anteriores
    setError('');
    setSuccess(false);
    
    if (!codigo) {
      console.log('Erro: Código não preenchido');
      setError('Digite o código de verificação');
      return;
    }

    if (codigo !== codigoCorreto) {
      console.log('Erro: Código incorreto');
      setError('Código de verificação incorreto. Tente novamente.');
      // Limpar o campo de código
      setCodigo('');
      return;
    }

    setLoading(true);
    setLoadingStep('Verificando código...');
    console.log('Loading iniciado...');
    
    try {
      // Simular verificação
      console.log('Verificando código...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLoadingStep('Email verificado com sucesso!');
      setSuccess(true);
      
      // Simular delay para mostrar sucesso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Limpar dados temporários
      if (typeof window !== 'undefined') {
        localStorage.removeItem('codigoVerificacao');
        localStorage.removeItem('emailVerificacao');
      }
      
      console.log('Redirecionando para home...');
      
      // Redirecionar automaticamente para home
      router.replace('/home');
      
    } catch (error) {
      console.error('Erro na verificação:', error);
      setError('Erro ao verificar código. Tente novamente.');
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleReenviarCodigo = () => {
    Alert.alert(
      'Código Reenviado',
      'Um novo código foi enviado para seu email.',
      [{ text: t('common.ok') }]
    );
  };

  const handleVoltar = () => {
    Alert.alert(
      t('common.warning'),
      'Tem certeza que deseja voltar? O cadastro da empresa será cancelado.',
      [
        {
          text: t('common.no'),
          style: 'cancel'
        },
        {
          text: t('common.yes'),
          onPress: () => router.push('/login')
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title>Verificar Email</Title>
          <Paragraph>Digite o código enviado para seu email</Paragraph>
        </View>

        <Card style={styles.formCard}>
          <Card.Content>
            <View style={styles.emailInfo}>
              <Title style={styles.emailTitle}>📧 Email de Verificação</Title>
              <Paragraph style={styles.emailText}>
                Enviamos um código de verificação para:
              </Paragraph>
              <Paragraph style={styles.emailAddress}>
                {emailVerificacao || 'email@empresa.com'}
              </Paragraph>
              {codigoCorreto && (
                <Paragraph style={styles.codeInfo}>
                  Código enviado: {codigoCorreto}
                </Paragraph>
              )}
            </View>

            <TextInput
              label="Código de Verificação"
              value={codigo}
              onChangeText={(value) => {
                setCodigo(value);
                // Limpar erro quando usuário digitar
                if (error) setError('');
              }}
              style={styles.input}
              mode="outlined"
              placeholder="Digite o código de 6 dígitos"
              keyboardType="numeric"
              maxLength={6}
              error={!!error}
              disabled={loading || success}
            />
            
            {/* Feedback de Erro */}
            {error && (
              <View style={styles.errorContainer}>
                <Paragraph style={styles.errorText}>❌ {error}</Paragraph>
              </View>
            )}
            
            {/* Feedback de Sucesso */}
            {success && (
              <View style={styles.successContainer}>
                <Paragraph style={styles.successText}>✅ Email verificado com sucesso!</Paragraph>
                <Paragraph style={styles.successSubtext}>Redirecionando para o sistema...</Paragraph>
              </View>
            )}
            
            {/* Indicador de Progresso */}
            {loading && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
                </View>
                <Paragraph style={styles.progressText}>{loadingStep}</Paragraph>
              </View>
            )}

            <View style={styles.helpText}>
              <Paragraph style={styles.helpTitle}>💡 Instruções:</Paragraph>
              <Paragraph style={styles.helpContent}>
                Digite o código de 6 dígitos que foi enviado para seu email.
                {codigoCorreto && (
                  <Title style={styles.codeHint}>Código: {codigoCorreto}</Title>
                )}
              </Paragraph>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleVoltar}
                style={styles.cancelButton}
                icon="arrow-left"
                disabled={loading || success}
              >
                {t('common.cancel')}
              </Button>
              
              <Button
                mode="contained"
                onPress={handleVerificarCodigo}
                loading={loading}
                disabled={loading || success || !codigo}
                style={styles.verifyButton}
                icon={loading ? undefined : "check"}
              >
                {loading ? loadingStep : success ? 'Verificado!' : 'Verificar'}
              </Button>
            </View>

            <Button
              mode="text"
              onPress={handleReenviarCodigo}
              style={styles.resendButton}
            >
              Não recebeu o código? Reenviar
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
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
  emailInfo: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  emailTitle: {
    fontSize: 18,
    color: '#1976d2',
    marginBottom: 8,
  },
  emailText: {
    color: '#666',
    marginBottom: 4,
  },
  emailAddress: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  empresaInfo: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  codeInfo: {
    color: '#1976d2',
    fontSize: 14,
    marginTop: 4,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  helpText: {
    backgroundColor: '#fef9e7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  helpTitle: {
    fontWeight: 'bold',
    color: '#f57c00',
    marginBottom: 4,
  },
  helpContent: {
    color: '#666',
  },
  codeHint: {
    color: '#f57c00',
    fontSize: 16,
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
  verifyButton: {
    flex: 1,
    paddingVertical: 5,
  },
  resendButton: {
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    marginTop: 8,
  },
  errorText: {
    color: '#f44336',
    fontWeight: '500',
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    marginTop: 8,
  },
  successText: {
    color: '#4caf50',
    fontWeight: '600',
    fontSize: 14,
  },
  successSubtext: {
    color: '#4caf50',
    fontSize: 12,
    marginTop: 4,
  },
  progressContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1976d2',
    borderRadius: 2,
    width: '100%',
  },
  progressText: {
    textAlign: 'center',
    color: '#1976d2',
    fontWeight: '500',
    fontSize: 14,
  },
});
