import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  useColorScheme,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

interface CadastroProps {
  onNavigate: (screen: string) => void;
}

const Cadastro: React.FC<CadastroProps> = ({ onNavigate }) => {
  const colorScheme = useColorScheme();
  const themeStyles = colorScheme === 'dark' ? darkTheme : lightTheme;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    user: '',
    email: '',
    password: '',
    group: '',
    sala: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const onSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Erro', 'O e-mail deve ser um endereço Gmail válido (ex: usuario@gmail.com).');
      return;
    }

    try {
      const response = await axios.post('https://patrimoniosemordem.nestguard.com.br/api/cadastro/', formData);
      if (response.status === 200) {
        Alert.alert('Cadastro', 'Cadastro realizado com sucesso!');
        onNavigate('Login');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status } = error.response;
        if (status === 400) {
          Alert.alert('Erro', error.response.data.detail || 'Dados inválidos. Verifique as informações.');
        } else if (status === 409) {
          Alert.alert('Erro', 'Usuário ou e-mail já cadastrado.');
        } else {
          Alert.alert('Erro', 'Não foi possível realizar o cadastro. Tente novamente.');
        }
      } else {
        Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, themeStyles.container]} behavior="padding">
      <StatusBar
        backgroundColor={themeStyles.container.backgroundColor}
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('ServiceHome')}>
          <Icon name="arrow-left" size={20} color={themeStyles.icon.color} />
        </TouchableOpacity>

        <Text style={[styles.title, themeStyles.tittleText]}>Cadastro de Usuário</Text>

        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder="Nome"
          placeholderTextColor={themeStyles.placeholder.color}
          value={formData.first_name}
          onChangeText={(text) => handleInputChange('first_name', text)}
        />
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder="Sobrenome"
          placeholderTextColor={themeStyles.placeholder.color}
          value={formData.last_name}
          onChangeText={(text) => handleInputChange('last_name', text)}
        />
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder="Usuário"
          placeholderTextColor={themeStyles.placeholder.color}
          value={formData.user}
          onChangeText={(text) => handleInputChange('user', text)}
        />
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder="Email"
          keyboardType="email-address"
          placeholderTextColor={themeStyles.placeholder.color}
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
        />
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder="Sala"
          placeholderTextColor={themeStyles.placeholder.color}
          value={formData.sala}
          onChangeText={(text) => handleInputChange('sala', text)}
        />

        <View style={styles.groupContainer}>
          <TouchableOpacity
            style={[
              styles.groupButton,
              formData.group === 'Coordenador' ? themeStyles.groupButtonSelected : themeStyles.groupButton,
            ]}
            onPress={() => handleInputChange('group', 'Coordenador')}
          >
            <Text style={[styles.groupText, themeStyles.text]}>Coordenador</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.groupButton,
              formData.group === 'Professor' ? themeStyles.groupButtonSelected : themeStyles.groupButton,
            ]}
            onPress={() => handleInputChange('group', 'Professor')}
          >
            <Text style={[styles.groupText, themeStyles.text]}>Professor</Text>
          </TouchableOpacity>
        </View>

        <View style={[
          styles.passwordContainer,
          themeStyles.input, // Aplica o estilo de input ao container
          { borderWidth: 1, borderColor: themeStyles.input.borderColor }, // Adiciona borda ao container
        ]}
        >
          <TextInput
            style={styles.passwordInput}
            placeholder="Senha"
            secureTextEntry={!showPassword}
            placeholderTextColor={themeStyles.placeholder.color}
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eye' : 'eye-slash'} size={40} color={themeStyles.icon.color} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onSubmit} style={[styles.button, themeStyles.button]}>
          <Text style={[styles.buttonText, themeStyles.buttonText]}>Cadastrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Estilos gerais
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { height: 45, borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, borderRadius: 5 },
  groupContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  groupButton: { flex: 1, paddingVertical: 10, borderRadius: 5, alignItems: 'center', marginHorizontal: 5 },
  groupText: { fontSize: 14, fontWeight: 'bold' }, // Adicionamos este estilo
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 5, paddingHorizontal: 10, marginBottom: 20 },
  passwordInput: { flex: 1 },
  button: { paddingVertical: 12, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  buttonText: { fontWeight: 'bold' },
  backButton: { position: 'absolute', top: 40, left: 20 },
});

// Tema claro
const lightTheme = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  tittleText: { color: '#000' },
  text: { color: '#fff' },
  input: { backgroundColor: '#fff', borderColor: '#ccc' },
  placeholder: { color: '#888' },
  button: { backgroundColor: '#b22222' },
  buttonText: { color: '#fff' },
  groupButton: { backgroundColor: '#5c5c5c', borderColor: '#ccc' },
  groupButtonSelected: { backgroundColor: '#b22222', borderColor: '#b22222' },
  icon: { color: '#333' },
});

// Tema escuro
const darkTheme = StyleSheet.create({
  container: { backgroundColor: '#000' },
  tittleText: { color: '#fff' },
  text: { color: '#fff' },
  input: { backgroundColor: '#333', borderColor: '#555' },
  placeholder: { color: '#aaa' },
  button: { backgroundColor: '#8B0000' },
  buttonText: { color: '#eee' },
  groupButton: { backgroundColor: '#333', borderColor: '#555' },
  groupButtonSelected: { backgroundColor: '#8B0000', borderColor: '#b22222' },
  icon: { color: '#eee' },
});

export default Cadastro;
