// import AuthRedirect from '@/components/AuthRedirect';
import LanguageSelector from '@/components/LanguageSelector';
import UniversalIcon from '@/components/UniversalIcon';
import { DesignSystem } from '@/constants/design-system';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  HelperText,
  Paragraph,
  Surface,
  Text,
  TextInput,
  Title
} from 'react-native-paper';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMockUsers, setShowMockUsers] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeveloperMenu, setShowDeveloperMenu] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [errors, setErrors] = useState({ email: '', senha: '' });
  const { login } = useAuth();
  const { t } = useTranslation();
  
  // Responsividade
  const { width } = Dimensions.get('window');
  const isSmallScreen = width <= 425;

  // Validação de email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação de campos
  const validateForm = () => {
    const newErrors = { email: '', senha: '' };
    setGeneralError('');
    
    if (!email.trim()) {
      newErrors.email = t('auth.emailRequired');
    } else if (!validateEmail(email)) {
      newErrors.email = t('auth.emailInvalid');
    }
    
    if (!senha.trim()) {
      newErrors.senha = t('auth.passwordRequired');
    }
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.senha;
  };

  // Limpar erros quando o usuário digita
  const clearError = (field: 'email' | 'senha') => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setGeneralError('');
    
    try {
      console.log('Tentando fazer login com:', email);
      const success = await login(email, senha);
      console.log('Resultado do login:', success);
      if (success) {
        console.log('Login bem-sucedido');
        setGeneralError('');
        
        // Verificar se o email tem acesso a múltiplas empresas como responsável
        const hasMultiple = MockDataService.hasMultipleEmpresas(email);
        if (hasMultiple) {
          console.log('Email tem acesso a múltiplas empresas, redirecionando para seleção');
          setTimeout(() => {
            router.push('/selecionar-empresa');
          }, 100);
        } else {
          console.log('Email tem acesso a uma empresa, navegando para home');
          setTimeout(() => {
            router.push('/home');
          }, 100);
        }
      } else {
        setGeneralError('Email ou senha inválidos. Verifique suas credenciais.');
        if (Platform.OS !== 'web') {
          Alert.alert(t('common.error'), t('auth.invalidCredentials'));
        }
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setGeneralError('Não foi possível realizar o login. Tente novamente.');
      if (Platform.OS !== 'web') {
        Alert.alert(t('common.error'), t('auth.loginError'));
      }
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
        // Verificar se o email tem acesso a múltiplas empresas como responsável
        const hasMultiple = MockDataService.hasMultipleEmpresas(userEmail);
        if (hasMultiple) {
          setTimeout(() => {
            router.push('/selecionar-empresa');
          }, 100);
        } else {
          setTimeout(() => {
            router.push('/home');
          }, 100);
        }
      } else {
        Alert.alert('Erro', 'Falha no login automático');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha no login automático');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Limpar Todos os Dados',
      'Esta ação irá apagar TODOS os dados do sistema (empresas, usuários, tarefas, pontos, férias, etc.) SEM restaurar dados padrão.\n\nO sistema ficará completamente vazio para você começar testes e2e do zero.\n\nEsta ação não pode ser desfeita.\n\nDeseja continuar?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('=== INICIANDO LIMPEZA COMPLETA DE DADOS ===');
              
              // Limpar localStorage e sessionStorage completamente
              if (typeof window !== 'undefined') {
                console.log('1. Limpando localStorage e sessionStorage...');
                localStorage.clear();
                sessionStorage.clear();
                console.log('✅ LocalStorage e sessionStorage limpos');
              }
              
              // Limpar TODOS os dados do MockDataService (sem criar dados padrão)
              console.log('2. Limpando dados do MockDataService...');
              await MockDataService.clearAllData();
              console.log('✅ MockDataService limpo completamente');
              
              // Verificar que tudo foi limpo
              const empresas = MockDataService.getEmpresas();
              const usuarios = MockDataService.getUsuarios();
              const tarefas = MockDataService.getTarefas();
              const colaboradores = MockDataService.getColaboradores();
              const gestores = MockDataService.getGestores();
              
              console.log('=== VERIFICAÇÃO PÓS-LIMPEZA ===');
              console.log('Empresas:', empresas.length);
              console.log('Usuários:', usuarios.length);
              console.log('Tarefas:', tarefas.length);
              console.log('Colaboradores:', colaboradores.length);
              console.log('Gestores:', gestores.length);
              
              if (empresas.length === 0 && usuarios.length === 0 && tarefas.length === 0) {
                Alert.alert(
                  '✅ Limpeza Completa!', 
                  'Todos os dados foram removidos com sucesso!\n\n• Empresas: 0\n• Usuários: 0\n• Tarefas: 0\n• Colaboradores: 0\n• Gestores: 0\n• Pontos: 0\n• Férias: 0\n\nO sistema está pronto para testes e2e do zero.',
                  [{ 
                    text: 'OK',
                    onPress: () => {
                      // Recarregar a página para garantir que tudo está limpo
                      if (typeof window !== 'undefined') {
                        window.location.reload();
                      }
                    }
                  }]
                );
              } else {
                Alert.alert(
                  '⚠️ Atenção', 
                  `Alguns dados ainda podem estar presentes:\n\n• Empresas: ${empresas.length}\n• Usuários: ${usuarios.length}\n• Tarefas: ${tarefas.length}\n\nVerifique o console para mais detalhes.`,
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('❌ Erro ao limpar dados:', error);
              Alert.alert('Erro', 'Não foi possível limpar todos os dados do sistema. Verifique o console para mais detalhes.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'admin_sistema':
        return '#f44336';
      case 'admin_empresa':
        return '#f39c12';
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
      {/* AuthRedirect removido para evitar redirecionamento automático */}
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <UniversalIcon name="domain" size={48} color={DesignSystem.colors.primary} />
              </View>
              <Title style={[styles.title, { fontSize: isSmallScreen ? DesignSystem.typography.fontSize['2xl'] : DesignSystem.typography.fontSize['3xl'] }]}>Gestão de Pessoas</Title>
              <Paragraph style={styles.subtitle}>
                Faça login para acessar o sistema
              </Paragraph>
            </View>

            {/* Formulário de Login */}
            <Surface style={[styles.loginCard, { marginHorizontal: isSmallScreen ? DesignSystem.spacing.sm : 0 }]} elevation={2}>
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      clearError('email');
                    }}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={!!errors.email}
                    placeholder="Digite seu email"
                    left={<TextInput.Icon icon={() => <UniversalIcon name="email" size={20} color="#666" />} />}
                  />
                  <HelperText type="error" visible={!!errors.email}>
                    {errors.email}
                  </HelperText>
                </View>
                
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Senha"
                    value={senha}
                    onChangeText={(text) => {
                      setSenha(text);
                      clearError('senha');
                    }}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    mode="outlined"
                    autoComplete="password"
                    error={!!errors.senha}
                    placeholder="Digite sua senha"
                    left={<TextInput.Icon icon={() => <UniversalIcon name="lock" size={20} color="#666" />} />}
                    right={
                      <TextInput.Icon
                        icon={() => (
                          <UniversalIcon 
                            name={showPassword ? "eye-off" : "eye"} 
                            size={20} 
                            color="#666" 
                          />
                        )}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />
                  <HelperText type="error" visible={!!errors.senha}>
                    {errors.senha}
                  </HelperText>
                </View>

                {/* Link Esqueci Senha */}
                <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
                </TouchableOpacity>
                
                {/* Botão de Login */}
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  disabled={loading}
                  style={[styles.loginButton, loading && styles.buttonDisabled]}
                  contentStyle={styles.buttonContent}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="white" />
                      <Text style={styles.loadingText}>Entrando...</Text>
                    </View>
                  ) : (
                    'Entrar no Sistema'
                  )}
                </Button>
              {generalError ? (
                <Paragraph
                  data-testid="login-error"
                  style={styles.generalError}
                  accessibilityRole={Platform.OS === 'web' ? 'alert' : undefined}
                >
                  {generalError}
                </Paragraph>
              ) : null}
              </View>
            </Surface>

            {/* Botão Criar Conta */}
            <View style={[styles.companySection, { marginHorizontal: isSmallScreen ? DesignSystem.spacing.sm : 0 }]}>
              <Button
                mode="outlined"
                onPress={() => router.push('/cadastro-empresa')}
                style={styles.companyButton}
                icon={() => <UniversalIcon name="account-plus" size={20} color={DesignSystem.colors.primary} />}
              >
                Criar Conta
              </Button>
            </View>

            {/* Menu de Desenvolvedor */}
            <View style={[styles.developerSection, { marginHorizontal: isSmallScreen ? DesignSystem.spacing.sm : 0 }]}>
              <TouchableOpacity 
                style={styles.developerToggle}
                onPress={() => setShowDeveloperMenu(!showDeveloperMenu)}
              >
                <Text style={styles.developerToggleText}>
                  {showDeveloperMenu ? 'Ocultar' : 'Mostrar'} Acesso de Desenvolvedor
                </Text>
                <UniversalIcon 
                  name={showDeveloperMenu ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={DesignSystem.colors.text.secondary} 
                />
              </TouchableOpacity>

              {showDeveloperMenu && (
                <Surface style={styles.developerCard} elevation={1}>
                  <Text style={styles.developerTitle}>🔧 Acesso de Desenvolvedor</Text>
                  
                  <Button
                    mode="outlined"
                    onPress={() => setShowMockUsers(!showMockUsers)}
                    style={styles.developerButton}
                    compact
                  >
                    {showMockUsers ? 'Ocultar' : 'Mostrar'} Usuários de Teste
                  </Button>

                  <Button
                    mode="outlined"
                    onPress={() => handleMockUserLogin('admin@sistema.com', 'admin123')}
                    style={styles.developerButton}
                    compact
                  >
                    Login Admin Rápido
                  </Button>


                  <Button
                    mode="outlined"
                    onPress={() => setShowLanguageSelector(true)}
                    style={styles.developerButton}
                    compact
                    icon={() => <UniversalIcon name="translate" size={16} color={DesignSystem.colors.primary} />}
                  >
                    Idioma
                  </Button>

                  <Button
                    mode="outlined"
                    onPress={handleClearData}
                    style={[styles.developerButton, { borderColor: '#f44336' }]}
                    compact
                    icon={() => <UniversalIcon name="delete-sweep" size={16} color="#f44336" />}
                  >
                    Limpar Dados
                  </Button>
                </Surface>
              )}

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
            </View>
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
    backgroundColor: DesignSystem.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: DesignSystem.spacing.lg,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing['2xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: DesignSystem.borderRadius.full,
    backgroundColor: DesignSystem.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
  },
  subtitle: {
    textAlign: 'center',
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.fontSize.base,
  },
  
  // Login Card
  loginCard: {
    backgroundColor: DesignSystem.colors.surface,
    borderRadius: DesignSystem.borderRadius.xl,
    padding: DesignSystem.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formContainer: {
    gap: DesignSystem.spacing.lg,
  },
  inputContainer: {
    gap: DesignSystem.spacing.xs,
  },
  input: {
    minHeight: 56,
    backgroundColor: DesignSystem.colors.surface,
  },
  
  // Forgot Password
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: DesignSystem.spacing.sm,
  },
  forgotPasswordText: {
    color: DesignSystem.colors.primary,
    fontSize: DesignSystem.typography.fontSize.sm,
    textDecorationLine: 'underline',
  },
  
  // Login Button
  loginButton: {
    marginTop: DesignSystem.spacing.lg,
    minHeight: 56,
    borderRadius: DesignSystem.borderRadius.lg,
    backgroundColor: DesignSystem.colors.primary,
  },
  generalError: {
    marginTop: DesignSystem.spacing.sm,
    color: DesignSystem.colors.error,
    textAlign: 'center',
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  buttonContent: {
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing.sm,
  },
  loadingText: {
    color: 'white',
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  
  // Company Section
  companySection: {
    marginTop: DesignSystem.spacing.lg,
    alignItems: 'center',
  },
  companyButton: {
    minHeight: 48,
    borderColor: DesignSystem.colors.primary,
    borderWidth: 2,
  },
  
  // Developer Section
  developerSection: {
    marginTop: DesignSystem.spacing.lg,
  },
  developerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing.sm,
    padding: DesignSystem.spacing.md,
  },
  developerToggleText: {
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.fontSize.sm,
  },
  developerCard: {
    backgroundColor: DesignSystem.colors.surfaceVariant,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.lg,
    marginTop: DesignSystem.spacing.sm,
    gap: DesignSystem.spacing.sm,
  },
  developerTitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  developerButton: {
    minHeight: 40,
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
