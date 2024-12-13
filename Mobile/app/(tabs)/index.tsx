import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Home from './telas/home';
import ServiceHomeScreen from './telas/ServiceHome'; 
import LoginScreen from './telas/login';
import SalasScreen from './telas/salas';
import Menu from './telas/menu';
import ScannerScreen from './telas/LeitorScreen';
import PatrimonioScreen from './telas/patrimonios';
import EditarPerfil from './telas/EditarPerfil';
import PatrimoniosPorSala from './telas/PatrimoniosPorSala'; // Importe a tela aqui
import Cadastro from './telas/cadastro';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<string>('Home');
  const [currentUserType, setCurrentUserType] = useState<'Coordenador' | 'Professor'>('Coordenador'); // Mantendo o currentUserType
  const [screenParams, setScreenParams] = useState<any>(null); // Para armazenar os parâmetros da tela

  const onNavigate = (screen: string, params?: { [key: string]: any }) => {
    setCurrentScreen(screen);
    setScreenParams(params); // Armazena os parâmetros da tela
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <Home onNavigate={onNavigate} />;
      case 'ServiceHome':
        return <ServiceHomeScreen onNavigate={onNavigate} userType={currentUserType} />; // Passando o userType
        case 'Perfil':
          return  <EditarPerfil onNavigate={onNavigate}/> ;
      case 'Login':
        return <LoginScreen onNavigate={onNavigate} />;
      case 'Salas':
        return <SalasScreen onNavigate={onNavigate} userType={currentUserType} />;
      case 'Menu':
        return <Menu onNavigate={onNavigate} />;
      case 'Leitor':
        return <ScannerScreen onNavigate={onNavigate} />;
      case 'Patrimonio':
        return <PatrimonioScreen onNavigate={onNavigate} userType={currentUserType} />;
      case 'PatrimoniosPorSala':
        return <PatrimoniosPorSala route={{ params: { salaNome: screenParams?.salaNome } }} onNavigate={onNavigate} />;
      case 'Cadastro':
        return <Cadastro onNavigate={onNavigate} />;
      default:
        return <Home onNavigate={onNavigate} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
});

export default App;
