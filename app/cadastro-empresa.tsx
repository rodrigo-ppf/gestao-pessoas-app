import FloatingMenu from '@/components/FloatingMenu';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Paragraph, TextInput, Title } from 'react-native-paper';

export default function CadastroEmpresaScreen() {
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleCadastro = async () => {
    if (!nome || !codigo || !cnpj || !endereco || !telefone || !email) {
      Alert.alert(t('common.error'), t('company.fillAllFields'));
      return;
    }

    setLoading(true);
    
    try {
      const novaEmpresa = await MockDataService.createEmpresa({
        nome,
        codigo,
        cnpj,
        endereco,
        telefone,
        email,
        ativa: true
      });

      console.log('Empresa cadastrada:', novaEmpresa);
      console.log('Redirecionando para verificação de email...');
      
      // Redirecionar automaticamente após cadastro
      setTimeout(() => {
        console.log('Navegando para verificar-email...');
        try {
          router.replace('/verificar-email');
          console.log('Navegação executada com sucesso!');
        } catch (error) {
          console.error('Erro na navegação:', error);
        }
      }, 1000);
      
      Alert.alert(
        t('common.success'), 
        `Empresa ${novaEmpresa.nome} cadastrada! Redirecionando para verificação...`
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('company.companyRegistrationError'));
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
          onPress: () => router.push('/login')
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title>{t('company.registerCompany')}</Title>
          <Paragraph>Preencha os dados da nova empresa</Paragraph>
        </View>

        <Card style={styles.formCard}>
          <Card.Content>
            <TextInput
              label={t('company.companyName')}
              value={nome}
              onChangeText={setNome}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label={t('company.companyCode')}
              value={codigo}
              onChangeText={setCodigo}
              style={styles.input}
              mode="outlined"
              placeholder="Ex: EMP001"
            />
            
            <TextInput
              label={t('company.cnpj')}
              value={cnpj}
              onChangeText={setCnpj}
              style={styles.input}
              mode="outlined"
              placeholder="00.000.000/0001-00"
            />
            
            <TextInput
              label={t('company.address')}
              value={endereco}
              onChangeText={setEndereco}
              style={styles.input}
              mode="outlined"
              multiline
            />
            
            <TextInput
              label={t('company.phone')}
              value={telefone}
              onChangeText={setTelefone}
              style={styles.input}
              mode="outlined"
              placeholder="(11) 99999-9999"
            />
            
            <TextInput
              label={t('company.email')}
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
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
                {t('company.registerCompany')}
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
