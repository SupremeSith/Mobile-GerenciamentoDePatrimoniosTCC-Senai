import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, useColorScheme, StatusBar } from 'react-native';
import Footer from '@/components/footer';
import IconButton from '@/components/IconButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ServiceHomeScreenProps {
  onNavigate: (screen: string) => void;
  userType: 'Coordenador' | 'Professor';
}

const ServiceHomeScreen: React.FC<ServiceHomeScreenProps> = ({ onNavigate }) => {
  const colorScheme = useColorScheme();
  const [userType, setUserType] = useState<'Coordenador' | 'Professor' | null>(null);

  const getUserType = async () => {
    try {
      const storedUserType = await AsyncStorage.getItem('userType');
      if (storedUserType) {
        setUserType(storedUserType as 'Coordenador' | 'Professor');
      }
    } catch (error) {
      console.error('Erro ao recuperar userType:', error);
    }
  };

  useEffect(() => {
    getUserType();
  }, []);

  // Seleciona estilos de cores com base no tema
  const themeStyles = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, themeStyles.container]}>
      {/* Define o estilo da barra de status */}
      <StatusBar 
        backgroundColor={themeStyles.container.backgroundColor} 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
      />

      <View style={styles.header}>
        <IconButton iconName="arrow-back" onPress={() => {/**/}} />
        <IconButton iconName="menu" onPress={() => onNavigate('Menu')} />
      </View>

      <Image source={require('@/assets/images/Logo.png')} style={styles.logo} />
      <Text style={[styles.subtitle, themeStyles.subtitle]}>Patrimônios em ordem</Text>

      <Text style={[styles.title, themeStyles.title]}>Serviços</Text>
      <Text style={[styles.description, themeStyles.description]}>
        Sua solução definitiva para gerenciar patrimônios de maneira eficiente e organizada.
      </Text>

      <View style={styles.servicesContainer}>
        {userType === 'Coordenador' && (
          <>
            <TouchableOpacity style={[styles.serviceButton, themeStyles.serviceButton]} onPress={() => onNavigate('Patrimonio')}>
              <Text style={[styles.buttonText, themeStyles.buttonText]}>Editar & Mover um patrimônio</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.serviceButton, themeStyles.serviceButton]} onPress={() => onNavigate('Patrimonio')}>
              <Text style={[styles.buttonText, themeStyles.buttonText]}>Adicionar & Excluir um patrimônio</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={[styles.serviceButton, themeStyles.serviceButton]} onPress={() => onNavigate('Salas')}>
          <Text style={[styles.buttonText, themeStyles.buttonText]}>Visualizar salas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.serviceButton, themeStyles.serviceButton]} onPress={() => onNavigate('Leitor')}>
          <Text style={[styles.buttonText, themeStyles.buttonText]}>Escanear patrimônio</Text>
        </TouchableOpacity>
      </View>

      <Image source={require('@/assets/images/Ellipse 9.png')} style={styles.ellipse} />
      <Footer onNavigate={onNavigate} />
    </View>
  );
};

// Estilos fixos que não dependem de tema
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    width: 170,
    height: 70,
    marginTop: 10,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  serviceButton: {
    borderRadius: 10,
    padding: 20,
    margin: 10,
    width: '40%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  ellipse: {
    position: 'absolute',
    bottom: 100,
    left: -110,
    width: 400,
    height: 400,
    resizeMode: 'contain',
    zIndex: -1,
  },
});

// Estilos de tema claro
const lightTheme = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  subtitle: {
    color: '#000',
  },
  title: {
    color: '#333',
  },
  description: {
    color: '#666',
  },
  serviceButton: {
    backgroundColor: '#fff',
    shadowColor: '#000',
  },
  buttonText: {
    color: '#333',
  },
});

// Estilos de tema escuro
const darkTheme = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  subtitle: {
    color: '#fff',
  },
  title: {
    color: '#ddd',
  },
  description: {
    color: '#ccc',
  },
  serviceButton: {
    backgroundColor: '#333',
    shadowColor: '#888',
  },
  buttonText: {
    color: '#eee',
  },
});

export default ServiceHomeScreen;
