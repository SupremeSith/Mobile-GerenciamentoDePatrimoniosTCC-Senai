import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Modal, Alert, useColorScheme, StatusBar } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';
import IconButton from '@/components/IconButton';

interface LoginScreenProps {
  onNavigate: (screen: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme(); // Detecta o tema atual (claro ou escuro)

  const themeStyles = colorScheme === 'dark' ? darkTheme : lightTheme; // Aplica o tema

  // Função para salvar os dados no AsyncStorage
  // Função para salvar os dados no AsyncStorage
  // Função para salvar os dados no AsyncStorage
  const saveUserData = async (user: string, userType: string, firstName: string, roomData: any) => {
    try {
      const dataToSave: [string, string][] = [
        ['user', user],
        ['userType', userType],
        ['firstName', firstName],
      ];
  
      // Adicione os dados da sala somente se estiverem disponíveis
      if (roomData.sala) dataToSave.push(['responsavel_sala', roomData.sala]);
      if (roomData.descricao) dataToSave.push(['descricao_sala', roomData.descricao]);
      if (roomData.localizacao) dataToSave.push(['localizacao_sala', roomData.localizacao]);
      if (roomData.link_imagem) dataToSave.push(['link_imagem_sala', roomData.link_imagem]);
      if (roomData.email_responsavel) dataToSave.push(['responsavel_sala_email', roomData.email_responsavel]);
  
      await AsyncStorage.multiSet(dataToSave);
      console.log('Dados salvos com sucesso no AsyncStorage:', dataToSave);
  
      // Loga os dados para verificar
      await logAsyncStorageData();
    } catch (error) {
      console.error('Erro ao salvar os dados:', error);
    }
  };
  

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Faz o login do usuário
      const response = await fetch('https://patrimoniosemordem.nestguard.com.br/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: usuario.trim(),
          password: password.trim(),
        }),
      });
  
      const data = await response.json();
      console.log('Resposta da API:', data); // Log da resposta para depuração
      setLoading(false);
  
      if (response.ok && data.user && data.user_type && data.first_name) {
        if (data.user_type === "Coordenador") {
          // Coordenador não precisa buscar sala
          await saveUserData(data.user, data.user_type, data.first_name, {}); // Passa um objeto vazio para roomData
          Alert.alert('Sucesso', 'Login bem-sucedido!');
          setModalVisible(false);
          // Redireciona para a tela do Coordenador
          onNavigate('ServiceHome');
        } else {
          // Se for um professor, busca a sala
          const roomResponse = await fetch('https://patrimoniosemordem.nestguard.com.br/api/get_user_room/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: data.user, // Envia o username para pegar a sala associada
            }),
          });
  
          const roomData = await roomResponse.json();
          console.log('Resposta da API (Sala):', roomData); // Log da resposta da sala
  
          if (roomResponse.ok && roomData.sala) {
            // Agora que temos a sala, podemos salvar tudo no AsyncStorage
            await saveUserData(data.user, data.user_type, data.first_name, roomData);
            Alert.alert('Sucesso', 'Login bem-sucedido!');
            setModalVisible(false);
            // Redireciona para a tela do Professor
            onNavigate('ServiceHome');
          } else {
            Alert.alert('Erro', roomData.message || 'Erro ao obter a sala, tente novamente.');
          }
        }
      } else {
        Alert.alert('Erro', data.message || 'Erro ao fazer login, tente novamente.');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor, tente mais tarde.');
      console.error('Erro ao realizar login:', error);
    }
  };
  


  // Função para recuperar todos os dados salvos no AsyncStorage
  // Função para logar todos os dados do AsyncStorage
  const logAsyncStorageData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const values = await AsyncStorage.multiGet(keys);
      console.log('Dados do AsyncStorage:', values);
    } catch (error) {
      console.error('Erro ao ler os dados do AsyncStorage:', error);
    }
  };



  return (
    <View style={[styles.container, themeStyles.container]}>
      <StatusBar
        backgroundColor={themeStyles.container.backgroundColor}
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={styles.header}>
        <IconButton iconName="arrow-back" onPress={() => onNavigate('Home')} />
        <IconButton iconName="menu" onPress={() => {/***/ }} />
      </View>

      <View style={styles.logoContainer}>
        <Image source={require('@/assets/images/Logo.png')} />
        <Text style={[styles.subtitle, themeStyles.subtitle]}>Patrimônios em ordem</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <CustomButton
          title="Entrar"
          onPress={() => setModalVisible(true)}
          loading={false}
        />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, themeStyles.modalContent]}>
            <Text style={[styles.modalTitle, themeStyles.modalTitle]}>Login</Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={20} color="#B01818" style={styles.icon} />
                <TextInput
                  placeholder="Insira o usuário"
                  placeholderTextColor={colorScheme === 'dark' ? 'white' : '#888'} // Alteração aqui para o texto do placeholder
                  style={[styles.input, themeStyles.input]}
                  value={usuario}
                  onChangeText={setUsuario}
                />
              </View>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color="#B01818" style={styles.icon} />
                <TextInput
                  placeholder="Insira sua senha"
                  secureTextEntry
                  placeholderTextColor={colorScheme === 'dark' ? 'white' : '#888'} // Alteração aqui para o texto do placeholder
                  style={[styles.input, themeStyles.input]}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

            </View>

            <TouchableOpacity style={[styles.modalButton, themeStyles.modalButton]} onPress={handleLogin} disabled={loading}>
              <Text style={styles.modalButtonText}>{loading ? 'Entrando...' : 'Confirmar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 40,
    padding: 30,
  },
  subtitle: {
    fontSize: 18,
    color: 'black',
    padding: 16,
  },
  button: {
    backgroundColor: '#8B0000',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    padding: 5,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  modalButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#B01818',
  },
});

// Estilos de tema claro
const lightTheme = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  subtitle: {
    color: 'black',
  },
  modalContent: {
    backgroundColor: 'white',
  },
  modalTitle: {
    color: 'black',
  },
  input: {
    color: 'black',
    backgroundColor: '#fff',
  },
  modalButton: {
    backgroundColor: '#8B0000',
  },
  modalButtonText: {
    color: 'white',
  },
});

// Estilos de tema escuro
const darkTheme = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  subtitle: {
    color: 'white',
  },
  modalContent: {
    backgroundColor: '#181717',
  },
  modalTitle: {
    color: 'white',
  },
  input: {
    color: 'white', // Corrigido aqui
    backgroundColor: '#181717',
  },
  modalButton: {
    backgroundColor: '#8B0000',
  },
  modalButtonText: {
    color: 'white',
  },
});
export default LoginScreen;