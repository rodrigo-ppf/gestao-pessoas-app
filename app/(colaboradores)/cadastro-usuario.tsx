import FloatingMenu from '@/components/FloatingMenu';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Paragraph, SegmentedButtons, TextInput, Title } from 'react-native-paper';

export default function CadastroUsuarioScreen() {
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [cargo, setCargo] = useState('');
  const [perfil, setPerfil] = useState('colaborador');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const empresas = MockDataService.getEmpresas();
  const [empresaSelecionada, setEmpresaSelecionada] = useState(
    user?.perfil === 'admin_sistema' ? '' : user?.empresaId || ''
  );

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha || !departamento || !cargo) {
      Alert.alert(t('common.error'), t('user.fillRequiredFields'));
      return;
    }

    if (user?.perfil === 'admin_sistema' && !empresaSelecionada) {
      Alert.alert(t('common.error'), t('company.selectCompany'));
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert(t('common.error'), t('user.passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    
    try {
      const novoUsuario = await MockDataService.createUsuario({
        nome,
        email,
        senha,
        perfil: perfil as 'admin_sistema' | 'admin_empresa' | 'colaborador',
        departamento,
        cargo,
        empresaId: empresaSelecionada || user?.empresaId || '',
      });

      Alert.alert(
        t('common.success'),
        t('user.userCreatedSuccessfully'),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              // Limpar formulário
              setNome('');
              setEmail('');
              setSenha('');
              setConfirmarSenha('');
              setDepartamento('');
              setCargo('');
              setPerfil('colaborador');
              setEmpresaSelecionada(user?.perfil === 'admin_sistema' ? '' : user?.empresaId || '');
              
              // Redirecionar
              if (user?.perfil === 'admin_sistema') {
                router.push('/colaboradores');
              } else {
                router.push('/colaboradores');
              }
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('user.errorCreatingUser'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FloatingMenu />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>{t('user.registerUser')}</Title>
            <Paragraph style={styles.subtitle}>
              {t('user.fillFormToRegister')}
            </Paragraph>

            {user?.perfil === 'admin_sistema' && (
              <View style={styles.section}>
                <TextInput
                  label={t('company.company')}
                  value={empresaSelecionada}
                  onChangeText={setEmpresaSelecionada}
                  mode="outlined"
                  style={styles.input}
                  placeholder={t('company.selectCompany')}
                />
              </View>
            )}

            <View style={styles.section}>
              <TextInput
                label={t('user.name')}
                value={nome}
                onChangeText={setNome}
                mode="outlined"
                style={styles.input}
                placeholder={t('user.enterName')}
              />
            </View>

            <View style={styles.section}>
              <TextInput
                label={t('user.email')}
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                placeholder={t('user.enterEmail')}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.section}>
              <TextInput
                label={t('user.password')}
                value={senha}
                onChangeText={setSenha}
                mode="outlined"
                style={styles.input}
                placeholder={t('user.enterPassword')}
                secureTextEntry
              />
            </View>

            <View style={styles.section}>
              <TextInput
                label={t('user.confirmPassword')}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                mode="outlined"
                style={styles.input}
                placeholder={t('user.confirmPassword')}
                secureTextEntry
              />
            </View>

            <View style={styles.section}>
              <TextInput
                label={t('user.department')}
                value={departamento}
                onChangeText={setDepartamento}
                mode="outlined"
                style={styles.input}
                placeholder={t('user.enterDepartment')}
              />
            </View>

            <View style={styles.section}>
              <TextInput
                label={t('user.position')}
                value={cargo}
                onChangeText={setCargo}
                mode="outlined"
                style={styles.input}
                placeholder={t('user.enterPosition')}
              />
            </View>

            <View style={styles.section}>
              <Paragraph style={styles.label}>{t('user.profile')}</Paragraph>
              <SegmentedButtons
                value={perfil}
                onValueChange={setPerfil}
                buttons={[
                  {
                    value: 'colaborador',
                    label: t('user.collaborator'),
                  },
                  {
                    value: 'admin_empresa',
                    label: t('user.companyAdmin'),
                  },
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleCadastro}
                loading={loading}
                disabled={loading}
                style={styles.button}
                icon="account-plus"
              >
                {t('user.register')}
              </Button>
            </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    elevation: 4,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976d2',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  segmentedButtons: {
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    paddingVertical: 8,
  },
});


