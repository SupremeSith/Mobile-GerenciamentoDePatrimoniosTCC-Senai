import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, Image, Alert, Modal, TextInput, useAnimatedValue, useColorScheme, StatusBar } from 'react-native';
import axios from 'axios';
import IconButton from '@/components/IconButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '@/components/footer';

interface Patrimonio {
  id: number;
  num_inventario: string;
  denominacao: string;
  localizacao: string;
  sala: string;
  link_imagem: string;
}

const PatrimoniosPorSala: React.FC<{ route: any; onNavigate: (screen: string) => void }> = ({ route, onNavigate }) => {
  const [userType, setUserType] = useState<'Coordenador' | 'Professor' | null>(null);
  const { 
    salaNome, 
    descricao, 
    localizacao, 
    link_imagem, 
    responsavel, 
    email_responsavel 
  } = route.params;

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedPatrimonio, setSelectedPatrimonio] = useState<Patrimonio | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [salaData, setSalaData] = useState({
    sala: salaNome,
    descricao,
    localizacao,
    link_imagem,
    responsavel,
    email_responsavel,
  });

  const colorScheme = useColorScheme();
  const themeStyles = colorScheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    const fetchPatrimonios = async () => {
      try {
        const response = await axios.get(`https://patrimoniosemordem.nestguard.com.br/api/inventarios/`);
        const filteredPatrimonios = response.data.filter((pat: Patrimonio) =>
          pat.sala.toLowerCase() === salaNome.toLowerCase() // Filtra pelos patrimônios que pertencem à sala
        );
        setPatrimonios(filteredPatrimonios);
      } catch (error) {
        console.error('Erro ao buscar os patrimônios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatrimonios();
  }, [salaNome]);

  const deleteSala = async () => {
    try {
      await axios.delete(`https://patrimoniosemordem.nestguard.com.br/api/delete_sala`, { data: { sala: salaNome } });
      Alert.alert('Sucesso', 'Sala deletada com sucesso!');
      onNavigate('Salas'); // Navega de volta para a tela Salas após a deleção
    } catch (error) {
      console.error('Erro ao deletar a sala:', error);
      Alert.alert('Erro', 'Não foi possível deletar a sala.');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Confirmar Deleção',
      'Tem certeza que deseja deletar esta sala?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Deletar',
          onPress: deleteSala,
        },
      ]
    );
  };

  const handleEdit = async () => {
    try {
      await axios.put(`https://patrimoniosemordem.nestguard.com.br/api/editar_sala`, salaData);
      Alert.alert('Sucesso', 'Sala editada com sucesso!');
      setEditModalVisible(false);
    } catch (error) {
      console.error('Erro ao editar a sala:', error);
      Alert.alert('Erro', 'Não foi possível editar a sala.');
    }
  };

  const openDetailsModal = (patrimonio: Patrimonio) => {
    setSelectedPatrimonio(patrimonio);
    setDetailsModalVisible(true);
  };
  

  const renderCard = (item: Patrimonio) => (
    <TouchableOpacity style={styles.card} onPress={() => openDetailsModal(item)}>
      <Image source={{ uri: item.link_imagem }} style={styles.image} />
      <View style={styles.info}>
        <Text style={[styles.patrimonioName, themeStyles.patrimonioName]}>{item.denominacao}</Text>
        <Text style={[styles.location, themeStyles.location]}>{item.localizacao}</Text>
        <Text style={[styles.inventoryNumber, themeStyles.inventoryNumber]}>{item.num_inventario}</Text>
      </View>
    </TouchableOpacity>
  );
  
  

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

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />;
  }

  return (
    <View style={[styles.container, themeStyles.container]}>
      <StatusBar 
        backgroundColor={themeStyles.container.backgroundColor} 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
      />
      <View style={styles.header}>
        <IconButton iconName="arrow-back" onPress={() => onNavigate('Salas')} />
        <Text style={[styles.subtitle, themeStyles.subtitle]}>Sala {salaNome}</Text>

        {userType === 'Coordenador' && (
          <IconButton iconName="settings-outline" onPress={() => setModalVisible(true)} />
        )}
      </View>

      <FlatList
        data={patrimonios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderCard(item)}
        contentContainerStyle={{ paddingBottom: 60 }}
      />

      {/* Modal de Opções */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, themeStyles.modalContent]}>
            <Text style={[styles.modalTitle, themeStyles.modalTitle]}>Opções</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => { setEditModalVisible(true); setModalVisible(false); }}>
              <Text style={styles.modalButtonText}>Editar Sala</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={confirmDelete}>
              <Text style={styles.modalButtonText}>Excluir Sala</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, themeStyles.modalContent]}>
            <Text style={[styles.modalTitle, themeStyles.modalTitle]}>Editar Sala</Text>
            <TextInput
              placeholder="Nome da Sala"
              value={salaData.sala}
              editable={false}
              style={styles.input}
            />
            <TextInput
              placeholder="Descrição"
              value={salaData.descricao}
              onChangeText={(text) => setSalaData({ ...salaData, descricao: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Localização"
              value={salaData.localizacao}
              onChangeText={(text) => setSalaData({ ...salaData, localizacao: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Link da Imagem"
              value={salaData.link_imagem}
              onChangeText={(text) => setSalaData({ ...salaData, link_imagem: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Responsável"
              value={salaData.responsavel}
              onChangeText={(text) => setSalaData({ ...salaData, responsavel: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Email do Responsável"
              value={salaData.email_responsavel}
              onChangeText={(text) => setSalaData({ ...salaData, email_responsavel: text })}
              style={styles.input}
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleEdit}>
              <Text style={styles.modalButtonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
  animationType="slide"
  transparent={true}
  visible={detailsModalVisible}
  onRequestClose={() => setDetailsModalVisible(false)}
>
  <View style={[styles.modalContainer]}>
    <View style={[styles.modalContent, themeStyles.modalContent]}>
      <Text style={[styles.modalTitle, themeStyles.modalTitle]}>Detalhes do Patrimônio</Text>

      {selectedPatrimonio && (
        <>
          <Text style={[styles.label, themeStyles.text]}>Denominação:</Text>
          <Text style={[styles.input, themeStyles.input]}>{selectedPatrimonio.denominacao}</Text>

          <Text style={[styles.label, themeStyles.text]}>Localização:</Text>
          <Text style={[styles.input, themeStyles.input]}>{selectedPatrimonio.localizacao}</Text>

          <Text style={[styles.label, themeStyles.text]}>Sala:</Text>
          <Text style={[styles.input, themeStyles.input]}>{selectedPatrimonio.sala}</Text>

          <Text style={[styles.label, themeStyles.text]}>Link da Imagem:</Text>
          <Text style={[styles.input, themeStyles.input]}>{selectedPatrimonio.link_imagem}</Text>

          <Text style={[styles.label, themeStyles.text]}>Num Inventário:</Text>
          <Text style={[styles.input, themeStyles.input]}>{selectedPatrimonio.num_inventario}</Text>

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setDetailsModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>Fechar</Text>
          </TouchableOpacity>
        </>
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  patrimonioName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  inventoryNumber: {
    fontSize: 12,
    color: '#999',
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
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#8B0000',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#8B0000',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  modalCloseButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  num_inventario: {
    color: 'fff'
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

// Estilos para tema claro e escuro
const lightTheme = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  subtitle: {
    color: '#000',
  },
  patrimonioName: {
    color: '#000',
  },
  location: {
    color: '#666',
  },
  inventoryNumber: {
    color: '#999',
  },
  modalContent: {
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: '#000'
  },
  modalTitle: {
    color: '#000'
  },
  text: {
    color: '#000'
  }
});

const darkTheme = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  subtitle: {
    color: '#fff',
  },
  patrimonioName: {
    color: '#fff', // Texto branco no modo dark
  },
  location: {
    color: '#bbb',
  },
  inventoryNumber: {
    color: '#888',
  },
  modalContent: {
    backgroundColor: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: '#fff'
  },
  modalTitle: {
    color: '#fff'
  },
  text: {
    color: '#fff'
  }
});


export default PatrimoniosPorSala;
