import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, useColorScheme, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

interface HomeProps {
  onNavigate: (screen: string) => void; 
}

export default function Home({ onNavigate }: HomeProps) {
  const colorScheme = useColorScheme(); 
  const isLargeScreen = width > 767;

  const themeStyles = colorScheme === 'dark' ? darkTheme : lightTheme; // Aplica o tema

  return (
    <View style={[styles.container, themeStyles.container]}>
      <StatusBar 
        backgroundColor={themeStyles.container.backgroundColor} 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
      />

      <Image
        source={require('@/assets/images/Vector 1.png')}
        style={[
          styles.vector1,
          {
            width: isLargeScreen ? width * 0.6 : width * 0.4,
            height: isLargeScreen ? height * 0.9 : height * 0.7,
            left: isLargeScreen ? -160 : -37
          },
        ]}
      />

      <Image
        source={require('@/assets/images/Vector 2.png')}
        style={[
          styles.vector2,
          {
            width: isLargeScreen ? width * 0.6 : width * 0.4, 
            height: isLargeScreen ? height * 0.9 : height * 0.7, 
            right: isLargeScreen ? -160 : -37
          },
        ]}
      />

      <View style={styles.background}>
        <View style={styles.content}>
          <Text style={[styles.subtitle, themeStyles.subtitle, { fontSize: isLargeScreen ? 40 : 20 }]}>Patrimônios em ordem</Text>

          <Image 
            source={require('@/assets/images/Logo.png')} 
            style={[styles.logo, { width: isLargeScreen ? 300 : 160, height: isLargeScreen ? 120 : 55 }]} 
          />

          <Text style={[styles.title, themeStyles.title, { fontSize: isLargeScreen ? 46 : 26 }]}>Bem vindo!</Text>

          {/* Botão "Entrar" que navega para a tela de Login */}
          <TouchableOpacity 
            style={[styles.button, themeStyles.button, {
              paddingVertical: isLargeScreen ? 20 : 10,
              paddingHorizontal: isLargeScreen ? 65 : 40,
            }]}
            onPress={() => onNavigate('Login')} 
          >
            <Text style={[styles.buttonText, themeStyles.buttonText, { fontSize: isLargeScreen ? 30 : 16 }]}>
              Entrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    marginBottom: 10,
  },
  logo: {
    resizeMode: 'contain',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#A90E13',
    marginTop: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  vector1: {
    position: 'absolute',
    bottom: 0,
    resizeMode: 'contain',
    zIndex: 1,
  },
  vector2: {
    position: 'absolute',
    top: 0,
    resizeMode: 'contain',
    zIndex: 1,
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
    color: '#000',
  },
  button: {
    backgroundColor: '#A90E13',
  },
  buttonText: {
    color: '#fff',
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
    color: '#fff',
  },
  button: {
    backgroundColor: '#B01818', // Cor do botão no tema escuro
  },
  buttonText: {
    color: '#fff',
  },
});

