import axios from 'axios';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, View, Modal, Alert, Image, TouchableOpacity, ScrollView, useColorScheme, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Footer from '@/components/footer';
import IconButton from '@/components/IconButton';
import * as Clipboard from 'expo-clipboard'; // Importando Clipboard
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Patrimonio {
  id: number;
  num_inventario: string;
  denominacao: string;
  localizacao: string;
  sala: string;
  link_imagem: string;
  validado?: boolean; // Propriedade opcional
}


interface ScannerScreenProps {
  onNavigate: (screen: string) => void;
  userType: 'Coordenador' | 'Professor';
}

const ScannerScreen: React.FC<ScannerScreenProps> = ({ onNavigate }) => {
  const colorScheme = useColorScheme();  // Detecta o tema atual (claro ou escuro)
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [selectedPatrimonio, setSelectedPatrimonio] = useState<Patrimonio | null>(null);
  const [userType, setUserType] = useState<'Coordenador' | 'Professor' | null>(null);
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  useEffect(() => {
    const loadUserType = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem('userType');
        if (storedUserType === 'Coordenador' || storedUserType === 'Professor') {
          setUserType(storedUserType); // atualiza o estado
          console.log("UserType recuperado:", storedUserType);
        } else {
          console.error('Tipo de usuário inválido encontrado:', storedUserType);
        }
      } catch (error) {
        console.error('Erro ao carregar o userType:', error);
      }
    };
  
    loadUserType();
  }, []);
  

  const qrCodeLock = useRef(false);

  const getSalaQRCode = async () => {
    try {
      // Recuperar o nome da sala diretamente do AsyncStorage
      const nomeSala = await AsyncStorage.getItem('responsavel_sala');
      
      if (nomeSala) {
        const salaQRCode = nomeSala.trim().toLowerCase();
        console.log(salaQRCode);
      } else {
        console.log('Sala não encontrada no AsyncStorage');
      }
    } catch (error) {
      console.error('Erro ao recuperar dados do AsyncStorage', error);
    }
  };
  
  // Chama a função para pegar o nome da sala e gerar o QRCode
  useEffect(() => {
    getSalaQRCode();
  }, []);
  

  useEffect(() => {
    async function fetchPatrimonios() {
      try {
        const response = await axios.get<Patrimonio[]>('https://patrimoniosemordem.nestguard.com.br/api/inventarios/');
        const updatedPatrimonios = response.data.map(p => ({
          ...p,
          validado: false, // Adiciona a propriedade validado
        }));
        setPatrimonios(updatedPatrimonios); // Atualiza o estado com os patrimônios modificados
      } catch (error) {
        console.error("Erro ao carregar patrimônios:", error);
      }
    }
    fetchPatrimonios();
  }, []);
  

  async function handleOpenCamera() {
    const { granted } = await requestPermission();
    if (!granted) {
      Alert.alert("Camera", "Você precisa habilitar o uso da câmera");
      return;
    }
    setModalIsVisible(true);
    qrCodeLock.current = false;
  }

  async function atualizarStatusLocalizacao(num_inventario: string) {
    try {
      const response = await axios.post('https://patrimoniosemordem.nestguard.com.br/api/atualizar-status/', {
        num_inventario: num_inventario,
      });
  
      if (response.status === 200) {
        Alert.alert("Sucesso", "Patrimônio Validado!");
      } else {
        Alert.alert("Erro", "Não foi possível validar o patrimônio");
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      Alert.alert("Erro", "Ocorreu um erro ao tentar atualizar o status.");
    }
  }
  

  async function handleQRCodeRead(data: string) {
    setModalIsVisible(false);
    const match = data.match(/\b\d{6,7}\b/);
  
    if (match) {
      const inventoryNumber = match[0];
      const patrimonio = patrimonios.find(p => p.num_inventario === inventoryNumber);
  
      if (patrimonio) {
        // Adiciona a verificação no frontend se já foi validado
        if (patrimonio.validado) {
          Alert.alert("Informação", "Este patrimônio já foi validado.");
          return;
        }
  
        const salaPatrimonio = patrimonio.sala.trim().toLowerCase();
        const responsavelSala = await AsyncStorage.getItem('responsavel_sala');
  
        console.log("UserType atual:", userType); // Log para depuração
  
        if (userType === 'Coordenador') {
          // Coordenadores podem validar qualquer patrimônio
          patrimonio.validado = true; // Marca como validado no frontend
          atualizarStatusLocalizacao(inventoryNumber);
          setSelectedPatrimonio(patrimonio);
          setInfoModalVisible(true);
        } else if (userType === 'Professor') {
          // Professores só validam patrimônios da mesma sala
          if (responsavelSala) {
            const salaQRCode = responsavelSala.trim().toLowerCase();
  
            if (salaPatrimonio === salaQRCode) {
              patrimonio.validado = true; // Marca como validado no frontend
              atualizarStatusLocalizacao(inventoryNumber);
              setSelectedPatrimonio(patrimonio);
              setInfoModalVisible(true);
            } else {
              Alert.alert("Erro", "O patrimônio não pertence à sua sala.");
            }
          } else {
            Alert.alert("Erro", "Não foi possível recuperar a sala do responsável.");
          }
        } else {
          Alert.alert("Erro", "Tipo de usuário inválido ou não identificado.");
        }
      } else {
        Alert.alert("Patrimônio não encontrado", `Nenhum patrimônio corresponde ao inventário: ${inventoryNumber}`);
      }
    } else {
      Alert.alert("Formato inválido", "O QR Code não contém um número de inventário válido.");
    }
  }
  
  
  

  
  

  // Função para copiar o número de inventário para a área de transferência
  const handleCopyToClipboard = (num_inventario: string) => {
    Clipboard.setString(num_inventario);  // Copia o valor para a área de transferência
    Alert.alert("Copiado", "O número de inventário foi copiado para a área de transferência!");
  };

  // Seleciona estilos de cores com base no tema
  const themeStyles = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, themeStyles.container]}>
      <StatusBar 
        backgroundColor={themeStyles.container.backgroundColor} 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
      />
      <View style={styles.header}>
        <IconButton iconName="arrow-back" onPress={() => onNavigate('ServiceHome')} />
        <IconButton iconName="menu" onPress={() => onNavigate('Menu')} />
      </View>

      <Image source={require('@/assets/images/Logo.png')} style={styles.logo} />
      <Text style={[styles.subtitle, themeStyles.subtitle]}>Acesse o QR Code aqui</Text>

      <TouchableOpacity style={[styles.qrButton, themeStyles.qrButton]} onPress={handleOpenCamera}>
        <View style={styles.qrButtonContent}>
          <Text style={[styles.qrButtonText, themeStyles.qrButtonText]}>Validar Patrimônio</Text>
          <Ionicons name="qr-code" size={20} color="#fff" style={styles.qrIcon} />
        </View>
      </TouchableOpacity>

      <Image source={require('@/assets/images/Ellipse 9.png')} style={styles.ellipse} />

      {/* Modal de leitura do QR Code */}
      <Modal visible={modalIsVisible} animationType="slide">
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setModalIsVisible(false)}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Leitura de QR Code</Text>
        </View>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={({ data }) => {
            if (data && !qrCodeLock.current) {
              qrCodeLock.current = true;
              setTimeout(() => handleQRCodeRead(data), 500);
            }
          }}
        />
      </Modal>



      <Modal visible={infoModalVisible} animationType="fade" transparent>
    <View style={[styles.infoModalContainer, isDarkMode && styles.darkMode]}>
      <View style={[styles.infoModalContent, isDarkMode && styles.darkModeContent]}>
        {/* Cabeçalho da Modal */}
        <View style={[styles.infoModalHeader, isDarkMode && styles.darkModeHeader]}>
          <Text style={[styles.modalHeaderTitle, isDarkMode && styles.darkModeText]}>
            Detalhes do Patrimônio
          </Text>
          <TouchableOpacity
            onPress={() => setInfoModalVisible(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={isDarkMode ? "#333" : "#333"} />
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        {selectedPatrimonio && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.infoText, isDarkMode && styles.darkModeText]}>
              Número de Inventário:{" "}
              <Text style={[styles.infoTextValue, isDarkMode && styles.darkModeTextValue]}>
                {selectedPatrimonio.num_inventario}
              </Text>
            </Text>
            <Text style={[styles.infoText, isDarkMode && styles.darkModeText]}>
              Denominação:{" "}
              <Text style={[styles.infoTextValue, isDarkMode && styles.darkModeTextValue]}>
                {selectedPatrimonio.denominacao}
              </Text>
            </Text>
            <Text style={[styles.infoText, isDarkMode && styles.darkModeText]}>
              Localização:{" "}
              <Text style={[styles.infoTextValue, isDarkMode && styles.darkModeTextValue]}>
                {selectedPatrimonio.localizacao}
              </Text>
            </Text>
            <Text style={[styles.infoText, isDarkMode && styles.darkModeText]}>
              Sala:{" "}
              <Text style={[styles.infoTextValue, isDarkMode && styles.darkModeTextValue]}>
                {selectedPatrimonio.sala}
              </Text>
            </Text>
            {selectedPatrimonio.link_imagem && (
              <Image
                source={{ uri: selectedPatrimonio.link_imagem }}
                style={styles.image}
              />
            )}

            {/* Botão de Copiar */}
            <TouchableOpacity
              style={[styles.copyButton, isDarkMode && styles.darkModeButton]}
              onPress={() =>
                handleCopyToClipboard(selectedPatrimonio.num_inventario)
              }
            >
              <Text style={[styles.copyButtonText, isDarkMode && styles.darkModeText]}>
                Copiar Número de Inventário
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </View>
  </Modal>


      <Footer onNavigate={onNavigate} />
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
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 70,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  qrButton: {
    backgroundColor: '#8B0000',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  qrButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 6,
  },
  qrIcon: {
    marginLeft: 8,
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B0000',
    padding: 10,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo escuro translúcido
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'center', // Centraliza horizontalmente
  },
  infoModalContent: {
    width: '90%',
    maxHeight: '80%', // Limita a altura máxima
    backgroundColor: '#fff', // Fundo branco
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Sombra no Android
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  infoTextValue: {
    fontWeight: 'bold',
    color: '#555',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  copyButton: {
    backgroundColor: '#8B0000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  darkMode: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Fundo mais escuro no dark mode
  },
  darkModeContent: {
    backgroundColor: '#333', // Escuro
  },
  darkModeHeader: {
    backgroundColor: '#333', // Fundo mais escuro no cabeçalho
  },
  darkModeText: {
    color: '#fff', // Texto branco no dark mode
  },
  darkModeTextValue: {
    fontWeight: 'bold',
    color: '#ffcc00', // Cor de destaque no dark mode
  },
  darkModeButton: {
    backgroundColor: '#8B0000', // Cor de fundo do botão no dark mode
  },

});

// Estilos para temas claro e escuro
const lightTheme = {
  container: {
    backgroundColor: '#fff',
  },
  subtitle: {
    color: '#333',
  },
  qrButton: {
    backgroundColor: '#8B0000',
  },
  qrButtonText: {
    color: '#fff',
  },
  infoText: {
    color: '#333',
  },
  infoTextValue: {
    color: '#8B0000',
  },
  copyButton: {
    backgroundColor: '#8B0000',
  },
  copyButtonText: {
    color: '#fff',
  },
};

const darkTheme = {
  container: {
    backgroundColor: '#000',
  },
  subtitle: {
    color: '#fff',
  },
  qrButton: {
    backgroundColor: '#8B0000',
  },
  qrButtonText: {
    color: '#fff',
  },
  infoText: {
    color: '#fff',
  },
  infoTextValue: {
    color: '#8B0000',
  },
  copyButton: {
    backgroundColor: '#8B0000',
  },
  copyButtonText: {
    color: '#fff',
  },
};

export default ScannerScreen;
