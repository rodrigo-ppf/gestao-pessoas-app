import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Paragraph, TextInput, Title } from 'react-native-paper';

export default function CadastroEmpresaScreen() {
  // Dados da Empresa
  const [empresaData, setEmpresaData] = useState({
    nome: '',
    codigo: '',
    cnpj: '',
    endereco: '',
    telefone: ''
  });

  // Dados do Responsável
  const [responsavelData, setResponsavelData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    departamento: 'Diretoria',
    cargo: 'Responsável'
  });

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t } = useTranslation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar dados da empresa
    if (!empresaData.nome?.trim()) newErrors.empresaNome = 'Nome da empresa é obrigatório';
    if (!empresaData.codigo?.trim()) newErrors.empresaCodigo = 'Código da empresa é obrigatório';
    if (!empresaData.cnpj?.trim()) newErrors.empresaCnpj = 'CNPJ é obrigatório';
    if (!empresaData.endereco?.trim()) newErrors.empresaEndereco = 'Endereço é obrigatório';
    if (!empresaData.telefone?.trim()) newErrors.empresaTelefone = 'Telefone é obrigatório';

    // Validar dados do responsável
    if (!responsavelData.nome?.trim()) newErrors.responsavelNome = 'Nome do responsável é obrigatório';
    if (!responsavelData.email?.trim()) newErrors.responsavelEmail = 'Email do responsável é obrigatório';
    if (responsavelData.email && !/\S+@\S+\.\S+/.test(responsavelData.email)) {
      newErrors.responsavelEmail = 'Email do responsável inválido';
    }
    if (!responsavelData.senha?.trim()) newErrors.responsavelSenha = 'Senha é obrigatória';
    if (responsavelData.senha && responsavelData.senha.length < 6) newErrors.responsavelSenha = 'Senha deve ter pelo menos 6 caracteres';
    if (responsavelData.senha && responsavelData.senha !== responsavelData.confirmarSenha) {
      newErrors.responsavelConfirmarSenha = 'Senhas não coincidem';
    }
    if (!responsavelData.telefone?.trim()) newErrors.responsavelTelefone = 'Telefone do responsável é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCadastro = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setLoadingStep('Validando dados...');
    
    try {
      // Simular delay para mostrar feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingStep('Criando empresa...');
      
      // 1. Criar a empresa
      const novaEmpresa = await MockDataService.createEmpresa({
        nome: empresaData.nome,
        codigo: empresaData.codigo,
        cnpj: empresaData.cnpj,
        endereco: empresaData.endereco,
        telefone: empresaData.telefone,
        email: '', // Empresa não tem email próprio
        responsavel: responsavelData.email, // Email do responsável
        ativa: true
      });

      console.log('Empresa cadastrada:', novaEmpresa);
      
      setLoadingStep('Criando responsável...');
      
      // Simular delay para mostrar feedback
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2. Criar o responsável da empresa
      const novoResponsavel = await MockDataService.createUsuario({
        nome: responsavelData.nome,
        email: responsavelData.email,
        senha: responsavelData.senha,
        perfil: 'dono_empresa',
        empresaId: novaEmpresa.id,
        departamento: responsavelData.departamento,
        cargo: responsavelData.cargo,
        ativo: true
      });

      console.log('Responsável criado:', novoResponsavel);
      
      setLoadingStep('Enviando código de verificação...');
      
      // Simular delay para mostrar feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simular envio de código de verificação por email
      const codigoVerificacao = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Salvar código temporariamente (em produção seria enviado por email)
      if (typeof window !== 'undefined') {
        localStorage.setItem('codigoVerificacao', codigoVerificacao);
        localStorage.setItem('emailVerificacao', responsavelData.email);
      }
      
      setLoadingStep('Finalizando cadastro...');
      
      // Simular delay final
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('Cadastro concluído, redirecionando...');
      
      // Redirecionar automaticamente para verificação
      router.replace('/verificar-email');
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setLoading(false);
      setLoadingStep('');
      Alert.alert('Erro', 'Não foi possível criar a empresa e responsável. Tente novamente.');
    }
  };

  const updateEmpresaField = (field: keyof typeof empresaData, value: string) => {
    setEmpresaData(prev => ({ ...prev, [field]: value }));
    const errorKey = `empresa${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const updateResponsavelField = (field: keyof typeof responsavelData, value: string) => {
    setResponsavelData(prev => ({ ...prev, [field]: value }));
    const errorKey = `responsavel${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleCancelar = () => {
    Alert.alert(
      t('common.warning'),
      'Tem certeza que deseja cancelar o cadastro?',
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
          <Title>Criar Conta</Title>
          <Paragraph>Crie sua empresa e configure o responsável principal</Paragraph>
        </View>

        {/* Dados da Empresa */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>🏢 Dados da Empresa</Title>
            
            <TextInput
              label="Nome da Empresa *"
              value={empresaData.nome}
              onChangeText={(value) => updateEmpresaField('nome', value)}
              style={styles.input}
              mode="outlined"
              error={!!errors.empresaNome}
            />
            
            <TextInput
              label="Código da Empresa *"
              value={empresaData.codigo}
              onChangeText={(value) => updateEmpresaField('codigo', value)}
              style={styles.input}
              mode="outlined"
              placeholder="Ex: EMP001"
              error={!!errors.empresaCodigo}
            />
            
            <TextInput
              label="CNPJ *"
              value={empresaData.cnpj}
              onChangeText={(value) => updateEmpresaField('cnpj', value)}
              style={styles.input}
              mode="outlined"
              placeholder="00.000.000/0001-00"
              error={!!errors.empresaCnpj}
            />
            
            <TextInput
              label="Endereço *"
              value={empresaData.endereco}
              onChangeText={(value) => updateEmpresaField('endereco', value)}
              style={styles.input}
              mode="outlined"
              multiline
              error={!!errors.empresaEndereco}
            />
            
            <TextInput
              label="Telefone *"
              value={empresaData.telefone}
              onChangeText={(value) => updateEmpresaField('telefone', value)}
              style={styles.input}
              mode="outlined"
              placeholder="(11) 99999-9999"
              error={!!errors.empresaTelefone}
            />
          </Card.Content>
        </Card>

        {/* Dados do Responsável */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>👤 Dados do Responsável</Title>
            <Paragraph style={styles.sectionDescription}>
              O responsável terá acesso total à empresa e poderá gerenciar todos os recursos.
            </Paragraph>
            
            <TextInput
              label="Nome Completo *"
              value={responsavelData.nome}
              onChangeText={(value) => updateResponsavelField('nome', value)}
              style={styles.input}
              mode="outlined"
              error={!!errors.responsavelNome}
            />
            
            <TextInput
              label="Email *"
              value={responsavelData.email}
              onChangeText={(value) => updateResponsavelField('email', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.responsavelEmail}
            />
            
            <TextInput
              label="Senha *"
              value={responsavelData.senha}
              onChangeText={(value) => updateResponsavelField('senha', value)}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              error={!!errors.responsavelSenha}
            />
            
            <TextInput
              label="Confirmar Senha *"
              value={responsavelData.confirmarSenha}
              onChangeText={(value) => updateResponsavelField('confirmarSenha', value)}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              error={!!errors.responsavelConfirmarSenha}
            />
            
            <TextInput
              label="Telefone *"
              value={responsavelData.telefone}
              onChangeText={(value) => updateResponsavelField('telefone', value)}
              style={styles.input}
              mode="outlined"
              placeholder="(11) 99999-9999"
              error={!!errors.responsavelTelefone}
            />
            
            <TextInput
              label="Departamento"
              value={responsavelData.departamento}
              onChangeText={(value) => updateResponsavelField('departamento', value)}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Cargo"
              value={responsavelData.cargo}
              onChangeText={(value) => updateResponsavelField('cargo', value)}
              style={styles.input}
              mode="outlined"
            />
          </Card.Content>
        </Card>
        
        {/* Indicador de Progresso */}
        {loading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Paragraph style={styles.progressText}>{loadingStep}</Paragraph>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleCancelar}
            style={styles.cancelButton}
            icon="arrow-left"
            disabled={loading}
          >
            Voltar
          </Button>
          
          <Button
            mode="contained"
            onPress={handleCadastro}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            icon={loading ? undefined : "check"}
          >
            {loading ? loadingStep : 'Criar Conta'}
          </Button>
        </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976d2',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
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
