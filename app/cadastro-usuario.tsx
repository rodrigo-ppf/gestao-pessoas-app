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
        empresaId: empresaSelecionada || user?.empresaId || '',
        departamento,
        cargo,
        avatar: '👤',
        ativo: true
      });

      Alert.alert(
        t('common.success'), 
        `${t('user.userRegistered')}: ${novoUsuario.nome}`,
        [
          {
            text: t('common.ok'),
            onPress: () => router.push('/colaboradores')
          }
        ]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('user.userRegistrationError'));
    } finally {
      setLoading(false);
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
          onPress: () => router.push('/colaboradores')
        }
      ]
    );
  };

  const getPerfilOptions = () => {
    if (user?.perfil === 'admin_sistema') {
      return [
        { value: 'admin_empresa', label: 'Admin Empresa' },
        { value: 'colaborador', label: 'Colaborador' }
      ];
    } else if (user?.perfil === 'admin_empresa') {
      return [
        { value: 'colaborador', label: 'Colaborador' }
      ];
    }
    return [];
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title>Cadastro de Usuário</Title>
          <Paragraph>Preencha os dados do novo usuário</Paragraph>
        </View>

        <Card style={styles.formCard}>
          <Card.Content>
            <TextInput
              label="Nome Completo"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              label="Senha"
              value={senha}
              onChangeText={setSenha}
              style={styles.input}
              mode="outlined"
              secureTextEntry
            />
            
            <TextInput
              label="Confirmar Senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              style={styles.input}
              mode="outlined"
              secureTextEntry
            />
            
            <TextInput
              label="Departamento"
              value={departamento}
              onChangeText={setDepartamento}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Cargo"
              value={cargo}
              onChangeText={setCargo}
              style={styles.input}
              mode="outlined"
            />

            {user?.perfil === 'admin_sistema' && (
              <View style={styles.empresaSection}>
                <Paragraph style={styles.sectionTitle}>Empresa</Paragraph>
                {empresas.map((empresa) => (
                  <Button
                    key={empresa.id}
                    mode={empresaSelecionada === empresa.id ? 'contained' : 'outlined'}
                    onPress={() => setEmpresaSelecionada(empresa.id)}
                    style={styles.empresaButton}
                  >
                    {empresa.nome}
                  </Button>
                ))}
              </View>
            )}

            <View style={styles.perfilSection}>
              <Paragraph style={styles.sectionTitle}>Perfil</Paragraph>
              <SegmentedButtons
                value={perfil}
                onValueChange={setPerfil}
                buttons={getPerfilOptions()}
                style={styles.segmentedButtons}
              />
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
                onPress={handleCadastro}
                loading={loading}
                style={styles.saveButton}
                icon="check"
              >
                {t('user.registerUser')}
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
  empresaSection: {
    marginBottom: 16,
  },
  empresaButton: {
    marginBottom: 8,
  },
  perfilSection: {
    marginBottom: 16,
  },
  segmentedButtons: {
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
