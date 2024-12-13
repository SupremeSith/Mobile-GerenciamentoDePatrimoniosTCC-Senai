import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, StatusBar, Alert, Switch } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface MenuProps {
  onNavigate: (screen: string) => void;
  userType: 'Coordenador' | 'Professor';
}

const Menu: React.FC<MenuProps> = ({ onNavigate }) => {
  const colorScheme = useColorScheme();
  const [userName, setUserName] = useState<string>('Carregando...');
  const [userType, setUserType] = useState<'Coordenador' | 'Professor' | null>(null);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userType');
      await AsyncStorage.removeItem('firstName');
      Alert.alert('Logout', 'Você foi desconectado com sucesso!');
      onNavigate('Home');
    } catch (error) {
      console.error('Erro ao realizar logout:', error);
      Alert.alert('Erro', 'Não foi possível realizar logout.');
    }
  };

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

  const getUserName = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      setUserName(storedUser || 'Usuário Desconhecido');
    } catch (error) {
      console.error('Erro ao carregar o nome do usuário:', error);
      setUserName('Erro ao carregar');
    }
  };

  useEffect(() => {
    getUserName();
  }, []);

  // Seleciona os estilos com base no tema
  const themeStyles = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, themeStyles.container]}>
      {/* Barra de Status */}
      <StatusBar
        backgroundColor={themeStyles.container.backgroundColor}
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />

      <View style={styles.header}>
        <FontAwesome name="user-circle-o" size={48} color="#8B0000" style={styles.user_icon} />
        <View>
          <Text style={[styles.userName, themeStyles.userName]}>{userName}</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigate('ServiceHome')}>
          <AntDesign name="closecircle" size={48} color="#8B0000" style={styles.close_icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.menuOptions}>

        <TouchableOpacity style={styles.option} onPress={() => onNavigate('Perfil')}>
          <Ionicons name="person-outline" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
          <Text style={[styles.optionText, themeStyles.optionText]}>Perfil</Text>
          <AntDesign name="right" size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>

        {userType === 'Coordenador' && (
          <TouchableOpacity style={styles.option} onPress={() => onNavigate('Cadastro')}>
            <Ionicons name="person-add-outline" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
            <Text style={[styles.optionText, themeStyles.optionText]}>Cadastrar</Text>
            <AntDesign name="right" size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.option} >
          <Ionicons name="help-circle-outline" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
          <Text style={[styles.optionText, themeStyles.optionText]}>Ajuda</Text>
          <AntDesign name="right" size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>

      </View>

      <TouchableOpacity style={styles.logout_button} onPress={handleLogout}>
        <Ionicons name="exit-outline" size={24} color="white" />
        <Text style={styles.logout_text}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos fixos que não dependem de tema
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  user_icon: {
    height: 53,
    width: 53,
    borderRadius: 26.5,
    marginLeft: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  close_icon: {
    marginRight: 20,
  },
  menuOptions: {
    marginVertical: 20,
    marginHorizontal: 40,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomColor: '#E0E0E0',
  },
  optionText: {
    flex: 1,
    fontSize: 20,
    marginLeft: 10,
    fontWeight: "bold",
  },
  logout_button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingVertical: 10,
    backgroundColor: '#8B0000',
    borderRadius: 5,
    marginHorizontal: 40,
  },
  logout_text: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
});

// Estilos de tema claro
const lightTheme = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  optionText: {
    color: '#000',
  },
  logout_button: {
    backgroundColor: '#8B0000',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',  // Cor preta no tema claro
  },
});

// Estilos de tema escuro
const darkTheme = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  optionText: {
    color: '#fff',
  },
  logout_button: {
    backgroundColor: '#8B0000',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',  // Cor branca no tema escuro
  },
});

export default Menu;
