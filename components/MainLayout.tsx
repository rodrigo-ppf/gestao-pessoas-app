import { useAuth } from '@/src/contexts/AuthContext';
import { router } from 'expo-router';
import { ReactNode, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text, useTheme } from 'react-native-paper';
import FixedMenu from './FixedMenu';
import UniversalIcon from './UniversalIcon';

const { width } = Dimensions.get('window');
const isSmallScreen = width <= 425;

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  showMenu?: boolean;
}

export default function MainLayout({ 
  children, 
  title, 
  showBackButton = false, 
  showMenu = true 
}: MainLayoutProps) {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={2}>
        <View style={styles.headerLeft}>
          {showBackButton && (
            <IconButton
              icon={() => <UniversalIcon name="arrow-left" size={24} color="white" />}
              onPress={handleBack}
              style={styles.backButton}
            />
          )}
          {showMenu && (
            <IconButton
              icon={() => <UniversalIcon name="menu" size={24} color="white" />}
              onPress={() => setMenuVisible(!menuVisible)}
              style={styles.menuButton}
            />
          )}
        </View>
        
        <View style={styles.headerCenter}>
          <Text variant="titleLarge" style={styles.headerTitle}>
            {title || 'Gestão de Pessoas'}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <IconButton
            icon={() => <UniversalIcon name="logout" size={20} color="white" />}
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
      </Surface>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {/* Side Menu */}
        {showMenu && menuVisible && (
          <View style={styles.menuContainer}>
            <FixedMenu onClose={() => setMenuVisible(false)} />
          </View>
        )}
        
        {/* Main Content - ocultar quando menu estiver aberto */}
        {!menuVisible && (
          <View style={styles.mainContent}>
            {children}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 56,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: isSmallScreen ? 16 : 18,
  },
  backButton: {
    margin: 0,
  },
  menuButton: {
    margin: 0,
  },
  logoutButton: {
    margin: 0,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  menuContainer: {
    width: isSmallScreen ? 280 : 300,
    backgroundColor: '#f5f5f5',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  fullWidth: {
    width: '100%',
  },
});
