import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define a interface para as props do Footer
interface FooterProps {
  onNavigate: (screen: string) => void;
}

// Componente Footer utilizando React.FC e a interface FooterProps
const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [userType, setUserType] = useState<'Coordenador' | 'Professor' | null>(null);
  const colorScheme = useColorScheme(); // Detecta o tema (claro ou escuro)

  const themeStyles = colorScheme === 'dark' ? darkTheme : lightTheme; // Aplica o tema

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
  
  return (
    <View style={[styles.footer, themeStyles.footer]}>
      {/* Quando o usuário clicar no ícone "home", navega para Inventario */}
      <TouchableOpacity onPress={() => onNavigate('ServiceHome')}>
        <Ionicons name="home-outline" size={30} color={themeStyles.icon.color} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onNavigate('Salas')}>
        <FontAwesome6 name="door-open" size={29} color={themeStyles.icon.color} />
      </TouchableOpacity>

      {userType === 'Coordenador' && (
        <TouchableOpacity onPress={() => onNavigate('Patrimonio')}>
          <Ionicons name="search-outline" size={30} color={themeStyles.icon.color} />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => onNavigate('Leitor')}>
        <Ionicons name="qr-code-outline" size={30} color={themeStyles.icon.color} />
      </TouchableOpacity>
    </View>
  );
};

// Estilos fixos que não dependem de tema
const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 2,
  },
});

// Estilos de tema claro
const lightTheme = StyleSheet.create({
  footer: {
    backgroundColor: '#fff',
    borderTopColor: '#8B0000',
  },
  icon: {
    color: '#8B0000',
  },
});

// Estilos de tema escuro
const darkTheme = StyleSheet.create({
  footer: {
    backgroundColor: '#8B0000',
    borderTopColor: '#8B0000',
  },
  icon: {
    color: '#fff',
  },
});

export default Footer;
