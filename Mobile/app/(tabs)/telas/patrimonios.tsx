import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, TextInput, Alert, Modal, useColorScheme, StatusBar } from 'react-native';
import axios from 'axios';
import Footer from '@/components/footer';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import IconButton from '@/components/IconButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Room {
  id: string;
  num_inventario: string;
  denominacao: string;
  localizacao: string;
  sala: string;
  link_imagem: string;
}

interface PatrimonioScreenProps {
  onNavigate: (screen: string) => void;
  userType: 'Coordenador' | 'Professor';
}

const PatrimonioScreen: React.FC<PatrimonioScreenProps> = ({ onNavigate }) => {
  const [inventarios, setInventarios] = useState<Room[]>([]);
  const [newItem, setNewItem] = useState({
    num_inventario: '',
    denominacao: '',
    localizacao: '',
    sala: '',
    link_imagem: '',
  });
  const [modalVisible, setModalVisible] = useState(false); // Estado da modal de adicionar
  const [selectedPatrimonio, setSelectedPatrimonio] = useState<Room | null>(null); // Patrimônio selecionado
  const [detailsModalVisible, setDetailsModalVisible] = useState(false); // Estado da segunda modal de detalhes
  const [isEditing, setIsEditing] = useState(false);
  const [originalNumInventario, setOriginalNumInventario] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Estado para pesquisa
  const [filterModalVisible, setFilterModalVisible] = useState(false); // Estado da modal de filtragem
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [userType, setUserType] = useState<'Coordenador' | 'Professor' | null>(null);


  const colorScheme = useColorScheme();
  const themeStyles = colorScheme === 'dark' ? darkTheme : lightTheme;

  // Função para resgatar o userType do AsyncStorage
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

  // Usar useEffect para chamar a função quando o componente montar
  useEffect(() => {
    getUserType();
  }, []);


  const fetchInventarios = async () => {
    try {
      const response = await axios.get('https://patrimoniosemordem.nestguard.com.br/api/inventarios/');
      setInventarios(response.data); // Atualiza o estado com os dados recebidos
    } catch (error) {
      console.error("Erro ao buscar os inventários", error);
      Alert.alert("Erro", "Falha ao buscar os inventários.");
    }
  };

  useEffect(() => {
    fetchInventarios(); // Chama a função ao montar o componente
  }, []);

  const handleDeleteItem = async (numInventario: string) => {
    // Alerta de confirmação antes de excluir
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza que deseja excluir este patrimônio?",
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Exclusão cancelada"),
          style: "cancel"
        },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              const response = await axios.delete('https://patrimoniosemordem.nestguard.com.br/api/delete_inventario/', {
                data: { num_inventario: numInventario } // Usando num_inventario no corpo da requisição
              });

              if (response.status === 204) {
                console.log('Item excluído com sucesso!');
                await fetchInventarios(); // Atualiza a lista de inventários após a exclusão
                setDetailsModalVisible(false); // Fecha a modal após exclusão
              }
            } catch (error) {
              console.error('Erro ao excluir o item:', error);
              Alert.alert("Erro", "Falha ao excluir o inventário.");
            }
          }
        }
      ]
    );
  };


  const handleAddItem = async () => {
    console.log("Adicionando patrimônio:", newItem); // Log dos dados que estão sendo enviados

    // Verifica se o num_inventario já existe na lista de inventários
    const exists = inventarios.some(item => item.num_inventario === newItem.num_inventario);
    if (exists) {
      Alert.alert("Erro", "Já existe um patrimônio com este número de inventário."); // Mensagem de erro
      return; // Interrompe a função
    }

    // Verifica se num_inventario contém exatamente 6 dígitos
    if (!/^\d{6,7}$/.test(newItem.num_inventario)) {
      Alert.alert("Erro", "O número de inventário deve conter exatamente 6 dígitos."); // Mensagem de erro
      return; // Interrompe a função
    }

    try {
      const response = await axios.post('https://patrimoniosemordem.nestguard.com.br/api/add_inventario/', newItem);
      console.log("Resposta do servidor:", response.data); // Log da resposta do servidor

      Alert.alert("Sucesso", "Patrimônio adicionado com sucesso!"); // Mensagem de sucesso
      setInventarios([...inventarios, { ...newItem, id: response.data.id }]); // Adiciona o novo item à lista
      setModalVisible(false); // Fecha a modal após adicionar
      setNewItem({ num_inventario: '', denominacao: '', localizacao: '', sala: '', link_imagem: '' }); // Limpa os campos
    } catch (error) {
      console.error("Erro ao adicionar patrimônio", error);
      Alert.alert("Erro", "Falha ao adicionar o patrimônio.");
    }
  };

  const handleOpenDetailsModal = (item: Room) => {
    setSelectedPatrimonio(item); // Define o patrimônio selecionado
    setDetailsModalVisible(true); // Abre a modal de detalhes
  };

  const renderItem = ({ item }: { item: Room }) => (
    <TouchableOpacity onPress={() => handleOpenDetailsModal(item)}>
      <View style={[styles.card, themeStyles.card]}>
        <Image source={{ uri: item.link_imagem }} style={styles.image} />
        <View style={styles.info}>
          <Text style={[styles.patrimonioName, themeStyles.text]}>
            {item.denominacao || 'N/A'}
          </Text>
          <Text style={[styles.location, themeStyles.textSecondary]}>
            {item.sala || 'Localização não disponível'}
          </Text>
          <Text style={[styles.inventoryNumber, themeStyles.textSecondary]}>
            {item.num_inventario || 'Número de inventário não disponível'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );


  const handleUpdateItem = async () => {
    if (!selectedPatrimonio) return;

    // Verifica se o num_inventario foi alterado
    if (selectedPatrimonio.num_inventario !== originalNumInventario) {
      Alert.alert("Aviso", "O número de inventário não pode ser alterado.");
      // Reverte o valor para o original
      setSelectedPatrimonio({
        ...selectedPatrimonio,
        num_inventario: originalNumInventario
      });
      return; // Interrompe a função para evitar a atualização
    }

    try {
      const response = await axios.put('https://patrimoniosemordem.nestguard.com.br/api/editar_inventario/', {
        num_inventario: selectedPatrimonio.num_inventario,
        denominacao: selectedPatrimonio.denominacao,
        localizacao: selectedPatrimonio.localizacao,
        sala: selectedPatrimonio.sala,
        link_imagem: selectedPatrimonio.link_imagem,
      });

      if (response.status === 200) {
        Alert.alert("Sucesso", "Patrimônio atualizado com sucesso!");
        setDetailsModalVisible(false); // Fecha a modal
        setIsEditing(false); // Desativa o modo de edição
        fetchInventarios(); // Atualiza a lista após a edição
      }
    } catch (error) {
      console.error("Erro ao atualizar o patrimônio", error);
      Alert.alert("Erro", "Falha ao atualizar o patrimônio.");
    }
  };

  // Adicione esse useEffect para salvar o valor original do num_inventario quando a modal é aberta
  useEffect(() => {
    if (selectedPatrimonio) {
      setOriginalNumInventario(selectedPatrimonio.num_inventario);
    }
  }, [selectedPatrimonio]);


  // Função para filtrar os inventários
  const filteredInventarios = inventarios.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.denominacao.toLowerCase().includes(term) ||
      item.localizacao.toLowerCase().includes(term) ||
      item.sala.toLowerCase().includes(term) ||
      item.num_inventario.includes(term)
    );
  });


  // Função para aplicar a ordenação
  const sortedInventarios = [...inventarios].sort((a, b) => {
    if (order === 'asc') {
      return a.denominacao.localeCompare(b.denominacao);
    } else {
      return b.denominacao.localeCompare(a.denominacao);
    }
  });


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
      <Text style={[styles.title, themeStyles.title]}>Patrimônios</Text>

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


          {userType === "Coordenador" && (
            <TouchableOpacity style={styles.actionButton} onPress={() => setModalVisible(true)}>
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          )}


        </View>
      </View>

      {/* Modal para adicionar patrimônio */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, themeStyles.modalContainer]}>
          <View style={[styles.modalContent, themeStyles.modalContent]}>
            <Text style={[styles.modalTitle, themeStyles.text]}>Adicionar Patrimônio</Text>

            <Text style={[styles.label, themeStyles.text]}>Denominação:</Text>
            <TextInput
              placeholder="Denominação"
              placeholderTextColor={themeStyles.placeholder.color}
              style={[styles.input, themeStyles.input]}
              value={newItem.denominacao}
              onChangeText={(text) => setNewItem({ ...newItem, denominacao: text })}
            />

            <Text style={[styles.label, themeStyles.text]}>Localização:</Text>
            <TextInput
              placeholder="Localização"
              placeholderTextColor={themeStyles.placeholder.color}
              style={[styles.input, themeStyles.input]}
              value={newItem.localizacao}
              onChangeText={(text) => setNewItem({ ...newItem, localizacao: text })}
            />

            <Text style={[styles.label, themeStyles.text]}>Sala:</Text>
            <TextInput
              placeholder="Sala"
              placeholderTextColor={themeStyles.placeholder.color}
              style={[styles.input, themeStyles.input]}
              value={newItem.sala}
              onChangeText={(text) => setNewItem({ ...newItem, sala: text })}
            />

            <Text style={[styles.label, themeStyles.text]}>Link da Imagem:</Text>
            <TextInput
              placeholder="Link da Imagem"
              placeholderTextColor={themeStyles.placeholder.color}
              style={[styles.input, themeStyles.input]}
              value={newItem.link_imagem}
              onChangeText={(text) => setNewItem({ ...newItem, link_imagem: text })}
            />

            <Text style={[styles.label, themeStyles.text]}>Num inventário:</Text>
            <TextInput
              placeholder="Número de Inventário"
              placeholderTextColor={themeStyles.placeholder.color}
              style={[styles.input, themeStyles.input]}
              value={newItem.num_inventario}
              onChangeText={(text) => setNewItem({ ...newItem, num_inventario: text })}
            />

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={[styles.modalButton, themeStyles.modalButton]} onPress={handleAddItem}>
                <Text style={[styles.modalButtonText, themeStyles.text]}>Adicionar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, themeStyles.modalButton]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalButtonText, themeStyles.text]}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* Segunda modal para exibir detalhes do patrimônio */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={[styles.modalContainer, themeStyles.modalContainer]}>
          <View style={[styles.modalContent, themeStyles.modalContent]}>
            <Text style={[styles.modalTitle, themeStyles.text]}>Detalhes do Patrimônio</Text>

            {selectedPatrimonio && (
              <>
                <Text style={[styles.label, themeStyles.text]}>Denominação:</Text>
                <TextInput
                  style={[styles.input, themeStyles.input]}
                  value={selectedPatrimonio.denominacao}
                  editable={isEditing}
                  onChangeText={(text) => setSelectedPatrimonio({ ...selectedPatrimonio, denominacao: text })}
                />

                <Text style={[styles.label, themeStyles.text]}>Localização:</Text>
                <TextInput
                  style={[styles.input, themeStyles.input]}
                  value={selectedPatrimonio.localizacao}
                  editable={isEditing}
                  onChangeText={(text) => setSelectedPatrimonio({ ...selectedPatrimonio, localizacao: text })}
                />

                <Text style={[styles.label, themeStyles.text]}>Sala:</Text>
                <TextInput
                  style={[styles.input, themeStyles.input]}
                  value={selectedPatrimonio.sala}
                  editable={isEditing}
                  onChangeText={(text) => setSelectedPatrimonio({ ...selectedPatrimonio, sala: text })}
                />

                <Text style={[styles.label, themeStyles.text]}>Link da imagem:</Text>
                <TextInput
                  style={[styles.input, themeStyles.input]}
                  value={selectedPatrimonio.link_imagem}
                  editable={false}
                />

                <Text style={[styles.label, themeStyles.text]}>Num Inventário:</Text>
                <TextInput
                  style={[styles.input, themeStyles.input]}
                  value={selectedPatrimonio.num_inventario}
                  editable={false}
                />

                <View style={styles.modalButtonsContainer}>
                  {userType === "Coordenador" && ( // Exibe apenas para coordenadores
                    isEditing ? (
                      <>
                        <TouchableOpacity style={[styles.modalButton, themeStyles.button]} onPress={handleUpdateItem}>
                          <Text style={[styles.modalButtonText, themeStyles.text]}>Salvar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, themeStyles.button]} onPress={() => setIsEditing(false)}>
                          <Text style={[styles.modalButtonText, themeStyles.text]}>Cancelar</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity style={[styles.modalButton, themeStyles.button]} onPress={() => { setIsEditing(true); }}>
                          <Text style={[styles.modalButtonText, themeStyles.text]}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, themeStyles.button]} onPress={() => handleDeleteItem(selectedPatrimonio.num_inventario)}>
                          <Text style={[styles.modalButtonText, themeStyles.text]}>Excluir</Text>
                        </TouchableOpacity>
                      </>
                    )
                  )}
                  <TouchableOpacity style={[styles.modalButton, themeStyles.button]} onPress={() => setDetailsModalVisible(false)}>
                    <Text style={[styles.modalButtonText, themeStyles.text]}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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


      <FlatList
        data={searchTerm ? filteredInventarios : sortedInventarios} // Usa a lista filtrada ou a lista completa
        renderItem={renderItem}
        keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()}
      />

      <Footer onNavigate={onNavigate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  iconButton: {
    backgroundColor: '#8B0000',
    borderRadius: 20,
    padding: 15,
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

  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  flatList: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    paddingLeft: 10,
  },
  patrimonioName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  location: {
    color: '#666',
  },
  inventoryNumber: {
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  logo: {
    width: 170,
    height: 70,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  closeButton: {
    backgroundColor: '#8B0000', // Cor de fundo do botão de fechar
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 15, // Espaço acima do botão de fechar
  },
  closeButtonText: {
    color: '#fff', // Cor do texto do botão de fechar
    fontSize: 16, // Tamanho do texto do botão de fechar
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
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
  patrimonioButton: {
    backgroundColor: '#fff',
    shadowColor: '#000',
  },
  buttonText: {
    color: '#333',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
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
  subtitle: {
    color: '#fff',
  },
  title: {
    color: '#fff',
  },
  description: {
    color: '#ccc',
  },
  patrimonioButton: {
    backgroundColor: '#333',
    shadowColor: '#888',
  },
  buttonText: {
    color: '#eee',
  },
  card: {
    backgroundColor: '#333',
    borderColor: '#444',
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


export default PatrimonioScreen;