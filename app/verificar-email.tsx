import FloatingMenu from '@/components/FloatingMenu';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Paragraph, TextInput, Title } from 'react-native-paper';

export default function VerificarEmailScreen() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [empresa, setEmpresa] = useState<any>(null);
  const { t } = useTranslation();
  const { login } = useAuth();
  const { empresaId, email } = useLocalSearchParams<{ empresaId: string; email: string }>();

  useEffect(() => {
    console.log('VerificarEmailScreen - Carregando tela de verificação');
    // Buscar a empresa mais recente (não verificada)
    const empresas = MockDataService.getEmpresas();
    console.log('Todas as empresas:', empresas);
    
    // Buscar a empresa mais recente (última criada)
    const empresaMaisRecente = empresas
      .filter(e => !e.emailVerificado)
      .sort((a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime())[0];
    
    console.log('Empresa mais recente não verificada:', empresaMaisRecente);
    if (empresaMaisRecente) {
      setEmpresa(empresaMaisRecente);
    }
  }, []);

  const handleVerificarCodigo = async () => {
    console.log('handleVerificarCodigo - Iniciando verificação...');
    console.log('Código inserido:', codigo);
    console.log('Empresa:', empresa);
    
    if (!codigo) {
      console.log('Erro: Código não preenchido');
      Alert.alert(t('common.error'), 'Digite o código de verificação');
      return;
    }

    setLoading(true);
    console.log('Loading iniciado...');
    
    try {
      // Simular verificação (para protótipo, qualquer código funciona)
      console.log('Simulando verificação...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ativar empresa automaticamente (protótipo)
      if (empresa) {
        console.log('Ativando empresa:', empresa.id);
        await MockDataService.verificarEmailEmpresa(empresa.id, '123456');
        console.log('Empresa ativada com sucesso!');
        
        // Criar usuário dono da empresa automaticamente
        console.log('Criando usuário dono da empresa...');
        const donoEmpresa = await MockDataService.createUsuario({
          nome: empresa.nome || 'Dono da Empresa',
          email: empresa.email || 'dono@empresa.com',
          senha: '123456', // Senha padrão
          perfil: 'dono_empresa',
          empresaId: empresa.id,
          departamento: 'Diretoria',
          cargo: 'Dono da Empresa',
          avatar: '👔',
          ativo: true
        });
        console.log('Usuário dono da empresa criado:', donoEmpresa);
        
        // Fazer login automático do dono da empresa
        console.log('Fazendo login automático...');
        const loginSuccess = await login(donoEmpresa.email, '123456');
        console.log('Login automático:', loginSuccess ? 'Sucesso' : 'Falhou');
      }
      
      console.log('Redirecionando automaticamente para /home...');
      
      // Redirecionar automaticamente após verificação
      setTimeout(() => {
        console.log('Navegando para /home...');
        try {
          router.push('/home');
          console.log('Navegação para /home executada!');
        } catch (navError) {
          console.error('Erro na navegação:', navError);
        }
      }, 1500);
      
      Alert.alert(
        t('common.success'),
        'Email verificado com sucesso!\n\nUm usuário dono da empresa foi criado automaticamente.\n\nEmail: ' + (empresa?.email || 'dono@empresa.com') + '\nSenha: 123456\n\nRedirecionando para home...'
      );
    } catch (error) {
      console.error('Erro na verificação:', error);
      Alert.alert(t('common.error'), 'Erro ao verificar código');
    } finally {
      console.log('Loading finalizado...');
      setLoading(false);
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
                {empresa?.email || 'email@empresa.com'}
              </Paragraph>
              {empresa && (
                <Paragraph style={styles.empresaInfo}>
                  Empresa: {empresa.nome}
                </Paragraph>
              )}
            </View>

            <TextInput
              label="Código de Verificação"
              value={codigo}
              onChangeText={setCodigo}
              style={styles.input}
              mode="outlined"
              placeholder="Digite o código de 6 dígitos"
              keyboardType="numeric"
              maxLength={6}
            />

            <View style={styles.helpText}>
              <Paragraph style={styles.helpTitle}>💡 Protótipo:</Paragraph>
              <Paragraph style={styles.helpContent}>
                Digite qualquer código de 6 dígitos e clique em "Verificar" para continuar.
                <Title style={styles.codeHint}>Exemplo: 123456</Title>
              </Paragraph>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleVoltar}
                style={styles.cancelButton}
                icon="arrow-left"
              >
                {t('common.cancel')}
              </Button>
              
              <Button
                mode="contained"
                onPress={handleVerificarCodigo}
                loading={loading}
                style={styles.verifyButton}
                icon="check"
              >
                Verificar
              </Button>
            </View>

            <Button
              mode="text"
              onPress={handleReenviarCodigo}
              style={styles.resendButton}
            >
              Não recebeu o código? Reenviar
            </Button>

            <Button
              mode="outlined"
              onPress={() => {
                console.log('Teste direto de navegação para /home');
                router.push('/home');
              }}
              style={styles.testButton}
            >
              Teste Navegação Home
            </Button>
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
  input: {
    marginBottom: 16,
  },
  helpText: {
    backgroundColor: '#fff3e0',
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
  testButton: {
    marginTop: 8,
    backgroundColor: '#ff9800',
  },
});
