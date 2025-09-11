import { useTranslation } from '@/src/hooks/useTranslation';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Paragraph, Title } from 'react-native-paper';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageSelector({ visible, onClose }: LanguageSelectorProps) {
  const { t, changeLanguage, getCurrentLanguage, getAvailableLanguages } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(getCurrentLanguage());

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    changeLanguage(languageCode);
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{t('settings.language')}</Title>
          <Paragraph style={styles.subtitle}>
            Selecione seu idioma preferido
          </Paragraph>
          
          {getAvailableLanguages().map((language) => (
            <Button
              key={language.code}
              mode={selectedLanguage === language.code ? 'contained' : 'outlined'}
              onPress={() => handleLanguageChange(language.code)}
              style={styles.languageButton}
              icon={() => <>{language.flag}</>}
            >
              {language.name}
            </Button>
          ))}
          
          <Button
            mode="outlined"
            onPress={onClose}
            style={styles.closeButton}
          >
            {t('common.close')}
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    margin: 20,
    maxWidth: 400,
    width: '90%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#1976d2',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  languageButton: {
    marginBottom: 12,
    justifyContent: 'flex-start',
  },
  closeButton: {
    marginTop: 8,
  },
});
