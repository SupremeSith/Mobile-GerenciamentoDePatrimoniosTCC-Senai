import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Alert, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import IconButton from '@/components/IconButton';

interface EditarPerfilScreenProps {
  onNavigate: (screen: string) => void;
}

const EditarPerfilScreen: React.FC<EditarPerfilScreenProps> = ({ onNavigate }) => {
  const colorScheme = useColorScheme();
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (username: string) => {
    try {
      const response = await axios.get('https://patrimoniosemordem.nestguard.com.br/api/user_dados', {
        headers: {
          Authorization: username,
        },
      });
      setUserData(response.data);
    } catch (error) {
      console.error("Erro ao buscar os dados do usuário", error);
      Alert.alert("Erro", "Falha ao buscar os dados do usuário.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          await fetchUserData(storedUser); 
        } else {
          console.error("Usuário não encontrado no armazenamento");
        }
      } catch (error) {
        console.error('Erro ao carregar o username:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleSave = async () => {
    try {
      const username = await AsyncStorage.getItem('user');
      await axios.put(
        'https://patrimoniosemordem.nestguard.com.br/api/update_user_data',
        {
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email
        },
        {
          headers: { Authorization: username },
        }
      );
      Alert.alert('Sucesso', 'Dados atualizados com sucesso');
    } catch (error) {
      console.error('Erro ao salvar os dados do usuário', error);
      Alert.alert('Erro', 'Falha ao salvar os dados do usuário');
    }
  };

  // Seleciona os estilos com base no tema
  const themeStyles = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, themeStyles.container]}>
      <StatusBar 
        backgroundColor={themeStyles.container.backgroundColor} 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
      />
      <View style={styles.header}>
        <IconButton iconName="arrow-back" onPress={() => onNavigate('ServiceHome')} />
        <Text style={[styles.title, themeStyles.title]}>Editar Perfil</Text>
        <IconButton iconName="menu" onPress={() => onNavigate('Menu')} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, themeStyles.label]}>Primeiro Nome:</Text>
        <TextInput
          style={[styles.input, themeStyles.input]}
          value={userData.first_name}
          onChangeText={(text) => setUserData((prev) => ({ ...prev, first_name: text }))}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, themeStyles.label]}>Ultimo Nome:</Text>
        <TextInput
          style={[styles.input, themeStyles.input]}
          value={userData.last_name}
          onChangeText={(text) => setUserData((prev) => ({ ...prev, last_name: text }))}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, themeStyles.label]}>Username:</Text>
        <TextInput
          style={[styles.user_input, themeStyles.user_input]}
          value={userData.username}
          editable={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, themeStyles.label]}>Email</Text>
        <TextInput
          style={[styles.input, themeStyles.input]}
          value={userData.email}
          onChangeText={(text) => setUserData((prev) => ({ ...prev, email: text }))}
          keyboardType="email-address"
        />
      </View>

      <TouchableOpacity style={[styles.button, themeStyles.button]} onPress={handleSave}>
        <Text style={[styles.buttonText, themeStyles.buttonText]}>Salvar Alterações</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  user_input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Estilos de tema claro
const lightTheme = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  title: {
    color: '#333',
  },
  label: {
    color: '#333',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderColor: '#ccc',
  },
  user_input: {
    backgroundColor: '#f8f8f8',
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#8B0000',
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
  title: {
    color: '#fff',
  },
  label: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  },
  user_input: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#4F4F4F',
  },
  button: {
    backgroundColor: '#8B0000',
  },
  buttonText: {
    color: '#fff',
  },
});

export default EditarPerfilScreen;
