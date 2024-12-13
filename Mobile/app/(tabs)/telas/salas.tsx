import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, TextInput, Modal, Button, Alert, ScrollView, useColorScheme, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Footer from '@/components/footer';
import axios from 'axios';
import IconButton from '@/components/IconButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Room {
  id: number;
  sala: string;
  descricao: string;
  localizacao: string;
  link_imagem: string;
  responsavel: string;
  quantidade_itens: number;
  email_responsavel: string;
}

interface SalasScreenProps {
  onNavigate: (screen: string, params?: { [key: string]: any }) => void;
  userType: 'Coordenador' | 'Professor';
}

const SalasScreen: React.FC<SalasScreenProps> = ({ onNavigate }) => {
  const [salas, setSalas] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const [sala, setSala] = useState('');
  const [descricao, setDescricao] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [linkImagem, setLinkImagem] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [quantidadeItens, setQuantidadeItens] = useState(0);
  const [emailResponsavel, setEmailResponsavel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSalas, setFilteredSalas] = useState<Room[]>(salas);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [userType, setUserType] = useState<'Coordenador' | 'Professor' | null>(null);

  const colorScheme = useColorScheme(); // Detecta o tema (claro ou escuro)
  const themeStyles = colorScheme === 'dark' ? darkTheme : lightTheme;


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


  const getSalas = async () => {
    try {
      const userType = await AsyncStorage.getItem('userType');

      if (userType === 'Coordenador') {
        const response = await axios.get('https://patrimoniosemordem.nestguard.com.br/api/salas');
        setSalas(response.data);
      } else if (userType === 'Professor') {
        const storedUser = await AsyncStorage.getItem('user');

        if (storedUser) {
          const response = await axios.post('https://patrimoniosemordem.nestguard.com.br/api/get_user_room/', {
            username: storedUser
          });

          if (response.data.sala) {
            setSalas([response.data]);
          } else {
            console.log('Nenhuma sala encontrada para este usuário.');
          }
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Erro ao buscar as salas:',
          error.response ? error.response.data : error.message
        );
      } else {
        console.error('Erro desconhecido ao buscar as salas:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSalas();
  }, []);

  const handleAddRoom = async () => {
    const newRoom = {
      sala,
      descricao,
      localizacao,
      link_imagem: linkImagem,
      responsavel,
      quantidade_itens: quantidadeItens,
      email_responsavel: emailResponsavel
    };

    try {
      const response = await axios.post('https://patrimoniosemordem.nestguard.com.br/api/add_sala/', newRoom);
      const createdRoom = response.data;

      setSalas([...salas, createdRoom]);
      Alert.alert("Sucesso", "Sala adicionada com sucesso!");

      // Reset campos após adição
      setSala('');
      setDescricao('');
      setLocalizacao('');
      setLinkImagem('');
      setResponsavel('');
      setQuantidadeItens(0);
      setEmailResponsavel('');
      setModalVisible(false);

      // Chama a função para recarregar as salas 
      await getSalas();
    } catch (error) {
      const axiosError = error as { response?: { data: { message: string; fields: string[] }; status: number } };

      if (axiosError.response && axiosError.response.status === 400) {
        const errorMessage = axiosError.response.data.message;
        const duplicatedFields = axiosError.response.data.fields;

        if (duplicatedFields && duplicatedFields.length > 0) {
          Alert.alert("Erro", `Valores já existentes nos campos: ${duplicatedFields.join(', ')}.`);
        } else {
          Alert.alert("Erro", errorMessage || "Falha ao adicionar a sala. Por favor, tente novamente.");
        }
      } else {
        Alert.alert("Erro", "Falha ao adicionar a sala. Por favor, tente novamente.");
      }
    }
  };

  const renderItem = ({ item }: { item: Room }) => (
    <TouchableOpacity onPress={() => {
      onNavigate('PatrimoniosPorSala', {
        salaNome: item.sala,
        descricao: item.descricao,
        localizacao: item.localizacao,
        link_imagem: item.link_imagem,
        responsavel: item.responsavel,
        quantidade_itens: item.quantidade_itens,
        email_responsavel: item.email_responsavel,
      });
    }}>

      <View style={[styles.card, themeStyles.card]}>
        <Image source={{ uri: item.link_imagem }} style={styles.image} />
        <View style={styles.info}>
          <Text style={[styles.roomName, themeStyles.roomName]}>{item.sala}</Text>
          <Text style={[styles.responsavel, themeStyles.responsavel]}>Responsável: {item.responsavel}</Text>
          <Text style={[styles.descricao, themeStyles.descricao]}>{item.descricao}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    const filtered = salas.filter(room =>
      (room.sala || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.descricao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.localizacao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.responsavel || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSalas(filtered);
  }, [searchTerm, salas]);

  const sortedSalas = [...salas].sort((a, b) => {
    const salaA = a.sala ?? '';
    const salaB = b.sala ?? '';

    if (order === 'asc') {
      return salaA.localeCompare(salaB);
    } else {
      return salaB.localeCompare(salaA);
    }
  });

  if (loading) {
    return (
      <View style={[styles.container, themeStyles.container]}>
        <Text style={styles.loading}>Carregando...</Text>
      </View>
    );
  }


  const renderRoomDetails = () => {
    if (!selectedRoom) return null;

    return (
      <View style={styles.detailsFullScreen}>
        <Text style={styles.detailsTitle}>{selectedRoom.sala}</Text>
        <Text style={styles.detailsDescription}>{selectedRoom.descricao}</Text>
        <Text style={styles.detailsLocation}>Localização: {selectedRoom.localizacao}</Text>
        <Text style={styles.detailsResponsible}>Responsável: {selectedRoom.responsavel}</Text>
        <Text style={styles.detailsQuantity}>Itens: {selectedRoom.quantidade_itens}</Text>
        <Button title="Voltar" onPress={() => setSelectedRoom(null)} />
      </View>
    );
  };

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
      <Text style={[styles.title, themeStyles.title]}>Salas</Text>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Pesquisar..."
          style={[styles.searchInput, themeStyles.searchInput]}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setFilterModalVisible(true)}>
            <MaterialIcons name="filter-list" size={24} color="white" />
          </TouchableOpacity>

          {userType === 'Coordenador' && (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={() => setModalVisible(true)}>
                <MaterialIcons name="add" size={24} color="white" />
              </TouchableOpacity>
            </>
          )}

        </View>
      </View>

      <View style={styles.listContainer}>
        {sortedSalas.length === 0 ? (
          <Text>Não há salas disponíveis.</Text>
        ) : (
          <FlatList
            data={searchTerm ? filteredSalas : sortedSalas}
            keyExtractor={item => (item.id ? item.id.toString() : '0')}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}
      </View>

      {renderRoomDetails()}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, themeStyles.modalContainer]}>
          <View style={[styles.modalContent, themeStyles.modalContent]}>
            <Text style={[styles.modalTitle, themeStyles.text]}>Adicionar Sala</Text>

            <Text style={[styles.label, themeStyles.text]}>Nome da sala:</Text>
            <TextInput
              placeholder="Nome da Sala"
              placeholderTextColor={themeStyles.placeholder.color}
              value={sala}
              onChangeText={setSala}
              style={[styles.input, themeStyles.input]}
            />

            <Text style={[styles.label, themeStyles.text]}>Descrição:</Text>
            <TextInput
              placeholder="Descrição"
              placeholderTextColor={themeStyles.placeholder.color}
              value={descricao}
              onChangeText={setDescricao}
              style={[styles.input, themeStyles.input]}
              multiline
            />

            <Text style={[styles.label, themeStyles.text]}>Localização: </Text>
            <TextInput
              placeholder="Localização"
              placeholderTextColor={themeStyles.placeholder.color}
              value={localizacao}
              onChangeText={setLocalizacao}
              style={[styles.input, themeStyles.input]}
            />

            <Text style={[styles.label, themeStyles.text]}>Link da imagem:</Text>
            <TextInput
              placeholder="Link da Imagem"
              placeholderTextColor={themeStyles.placeholder.color}
              value={linkImagem}
              onChangeText={setLinkImagem}
              style={[styles.input, themeStyles.input]}
            />

            <Text style={[styles.label, themeStyles.text]}>Responsável: </Text>
            <TextInput
              placeholder="Responsável"
              placeholderTextColor={themeStyles.placeholder.color}
              value={responsavel}
              onChangeText={setResponsavel}
              style={[styles.input, themeStyles.input]}
            />

            <Text style={[styles.label, themeStyles.text]} >Email do Responsável:</Text>
            <TextInput
              placeholder="Email do Responsável"
              placeholderTextColor={themeStyles.placeholder.color}
              value={emailResponsavel.toString()}
              onChangeText={setEmailResponsavel}
              style={[styles.input, themeStyles.input]}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, themeStyles.modalButton]} onPress={handleAddRoom}>
                <Text style={[styles.modalButtonText, themeStyles.text]}>Adicionar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, themeStyles.modalButton]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalButtonText, themeStyles.text]}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de filtragem */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={[styles.modalContainer, themeStyles.modalContainer]}>
          <View style={[styles.modalContent, themeStyles.modalContent]}>
            <Text style={[styles.modalTitle, themeStyles.text]}>Filtrar Patrimônios</Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, themeStyles.modalButton]}
                onPress={() => { setOrder('asc'); setFilterModalVisible(false); }}
              >
                <Text style={[styles.modalButtonText, themeStyles.text]}>A - Z</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, themeStyles.modalButton]}
                onPress={() => { setOrder('desc'); setFilterModalVisible(false); }}
              >
                <Text style={[styles.modalButtonText, themeStyles.text]}>Z - A</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, themeStyles.modalButton]}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, themeStyles.text]}>Fechar</Text>
            </TouchableOpacity>
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
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 170,
    height: 70,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 10,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: '#B30000',
    padding: 10,
    borderRadius: 50,
    marginLeft: 10,
  },
  listContainer: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    elevation: 1,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  roomName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  responsavel: {
    fontSize: 14,
    color: '#555',
  },
  descricao: {
    fontSize: 12,
    color: '#777',
  },
  quantidade: {
    fontSize: 12,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  detailsFullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsDescription: {
    fontSize: 16,
    marginBottom: 5,
  },
  detailsLocation: {
    fontSize: 14,
    marginBottom: 5,
  },
  detailsResponsible: {
    fontSize: 14,
    marginBottom: 5,
  },
  detailsQuantity: {
    fontSize: 14,
  },
  filterOption: {
    fontSize: 18,
    marginVertical: 5,
  },
  modalButton: {
    backgroundColor: '#8B0000',
    borderRadius: 5,
    padding: 10,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
  },
  closeButton: {
    backgroundColor: '#8B0000', // Cor de fundo do botão de fechar
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 15, // Espaço acima do botão de fechar
    paddingHorizontal: 110,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  loading: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});

// Estilos de tema claro
const lightTheme = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 10,
    backgroundColor: '#fff'
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
  },
  roomName: {
    color: '#333',
  },
  responsavel: {
    color: '#666',
  },
  descricao: {
    color: '#777',
  },
  quantidade: {
    color: '#444',
  },
  title: {
    color: '#333',
  },
  modalContainer: {
    backgroundColor: 'fff',
  },
  modalContent: {
    backgroundColor: '#fff',
  },
  text: {
    color: '#000000'
  },
  input: {
    backgroundColor: '#f0f0f0',
    color: '#000000',
    borderColor: '#cccccc'
  },
  button: {
    backgroundColor: '#8B0000'
  },
  textSecondary: {
    color: '#666666'
  },
  modalButton: {
    backgroundColor: '#f0f0f0',
    borderColor: '#cccccc'
  },
  placeholder: {
    color: '#666666'
  },
});

// Estilos de tema escuro
const darkTheme = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 10,
    backgroundColor: '#fff'
  },
  card: {
    backgroundColor: '#333',
    borderColor: '#444',
  },
  roomName: {
    color: '#fff',
  },
  responsavel: {
    color: '#ccc',
  },
  descricao: {
    color: '#bbb',
  },
  quantidade: {
    color: '#ddd',
  },
  title: {
    color: '#fff',
  },
  modalContainer: {
    backgroundColor: '000',
  },
  modalContent: {
    backgroundColor: '#131312',
  },
  text: {
    color: '#ffffff'
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    borderColor: '#555555'
  },
  button: {
    backgroundColor: '#8B0000'
  },
  textSecondary: {
    color: '#aaaaaa'
  },
  modalButton: {
    backgroundColor: '#8B0000',
    borderColor: '#444444'
  },
  placeholder: {
    color: '#aaaaaa'
  },
});

export default SalasScreen;
