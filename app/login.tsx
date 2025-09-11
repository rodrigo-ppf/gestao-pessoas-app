import AuthRedirect from '@/components/AuthRedirect';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import {
    Button,
    Card,
    Chip,
    Divider,
    Paragraph,
    TextInput,
    Title
} from 'react-native-paper';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMockUsers, setShowMockUsers] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    setLoading(true);
    
    try {
      console.log('Tentando fazer login com:', email);
      const success = await login(email, senha);
      console.log('Resultado do login:', success);
      if (success) {
        console.log('Login bem-sucedido, navegando para home');
        // Usar setTimeout para garantir que o estado seja atualizado antes da navegação
        setTimeout(() => {
          router.push('/home');
        }, 100);
      } else {
        Alert.alert(t('common.error'), t('auth.invalidCredentials'));
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert(t('common.error'), t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMockUserLogin = async (userEmail: string, userSenha: string) => {
    setEmail(userEmail);
    setSenha(userSenha);
    setShowMockUsers(false);
    
    // Executar login automaticamente
    setLoading(true);
    try {
      const success = await login(userEmail, userSenha);
      if (success) {
        setTimeout(() => {
          router.push('/home');
        }, 100);
      } else {
        Alert.alert('Erro', 'Falha no login automático');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha no login automático');
    } finally {
      setLoading(false);
    }
  };

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'admin_sistema':
        return '#f44336';
      case 'admin_empresa':
        return '#ff9800';
      case 'colaborador':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const getPerfilLabel = (perfil: string) => {
    switch (perfil) {
      case 'admin_sistema':
        return t('profiles.systemAdmin');
      case 'admin_empresa':
        return t('profiles.companyAdmin');
      case 'colaborador':
        return t('profiles.collaborator');
      default:
        return perfil;
    }
  };

  return (
    <>
      <AuthRedirect />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>{t('auth.loginTitle')}</Title>
              <Paragraph style={styles.subtitle}>
                {t('auth.loginSubtitle')}
              </Paragraph>
              
              <TextInput
                label={t('auth.email')}
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                label={t('auth.password')}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                style={styles.input}
                mode="outlined"
              />
              
              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                style={styles.button}
              >
                {t('auth.login')}
              </Button>

              <Divider style={styles.divider} />

              <Button
                mode="outlined"
                onPress={() => setShowMockUsers(!showMockUsers)}
                style={styles.mockButton}
              >
                {showMockUsers ? t('test.hideTestUsers') : t('test.showTestUsers')}
              </Button>

              <Button
                mode="outlined"
                onPress={() => handleMockUserLogin('admin@sistema.com', 'admin123')}
                style={styles.testButton}
              >
                {t('test.testLoginAdmin')}
              </Button>

                       <Button
                         mode="outlined"
                         onPress={() => {
                           console.log('Teste direto de navegação');
                           router.push('/home');
                         }}
                         style={styles.testButton}
                       >
                         {t('test.testDirectNavigation')}
                       </Button>

                       <Button
                         mode="outlined"
                         onPress={() => {
                           console.log('Teste navegação para verificar-email');
                           router.push('/verificar-email');
                         }}
                         style={styles.testButton}
                       >
                         Teste Verificar Email
                       </Button>

                       <Button
                         mode="contained"
                         onPress={() => router.push('/cadastro-empresa')}
                         style={styles.cadastroEmpresaButton}
                         icon="domain-plus"
                       >
                         {t('company.registerNewCompany')}
                       </Button>

                       <Button
                         mode="outlined"
                         onPress={() => setShowLanguageSelector(true)}
                         style={styles.languageButton}
                         icon="translate"
                       >
                         {t('settings.language')}
                       </Button>

              {showMockUsers && (
                <View style={styles.mockUsersContainer}>
                  <Title style={styles.mockTitle}>{t('test.showTestUsers')}</Title>
                  <Paragraph style={styles.mockSubtitle}>
                    {t('test.testUsersSubtitle')}
                  </Paragraph>
                  
                  {MockDataService.getUsuarios().map((user) => (
                    <Card key={user.id} style={styles.userCard}>
                      <Card.Content>
                        <View style={styles.userInfo}>
                          <View style={styles.userDetails}>
                            <Title style={styles.userName}>
                              {user.avatar} {user.nome}
                            </Title>
                            <Paragraph style={styles.userEmail}>
                              {user.email}
                            </Paragraph>
                            <Paragraph style={styles.userCompany}>
                              {user.cargo} - {user.departamento}
                            </Paragraph>
                          </View>
                          <Chip 
                            style={[styles.perfilChip, { backgroundColor: getPerfilColor(user.perfil) }]}
                            textStyle={styles.chipText}
                          >
                            {getPerfilLabel(user.perfil)}
                          </Chip>
                        </View>
                          <Button
                            mode="contained"
                            onPress={() => handleMockUserLogin(user.email, user.senha)}
                            style={styles.loginButton}
                            compact
                          >
                            {t('auth.login')}
                          </Button>
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <LanguageSelector 
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#1976d2',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
  divider: {
    marginVertical: 20,
  },
  mockButton: {
    marginBottom: 10,
  },
  testButton: {
    marginBottom: 20,
  },
  cadastroEmpresaButton: {
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#4caf50',
  },
  languageButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  mockUsersContainer: {
    marginTop: 10,
  },
  mockTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: '#1976d2',
  },
  mockSubtitle: {
    marginBottom: 16,
    color: '#666',
    fontSize: 14,
  },
  userCard: {
    marginBottom: 12,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userCompany: {
    fontSize: 12,
    color: '#999',
  },
  perfilChip: {
    height: 28,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
  },
  loginButton: {
    alignSelf: 'flex-end',
  },
});
