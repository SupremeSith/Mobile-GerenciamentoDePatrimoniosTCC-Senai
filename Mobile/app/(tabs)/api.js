// api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://192.168.0.17:8000/api/salas/';

export const fetchRooms = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data; // Retorna os dados das salas
  } catch (error) {
    console.error("Erro ao buscar as salas:", error);
    throw error; // Lança o erro para tratamento posterior
  }
};

// Função para salvar o token no AsyncStorage
export const saveToken = async (token) => {
    try {
        await AsyncStorage.setItem('authToken', token);
    } catch (error) {
        console.error('Erro ao salvar o token:', error);
    }
};

// Função para obter o token do AsyncStorage
export const getToken = async () => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        return token;
    } catch (error) {
        console.error('Erro ao obter o token:', error);
        return null;
    }
};
