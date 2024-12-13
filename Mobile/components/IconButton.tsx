import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IconButtonProps {
  iconName: keyof typeof Ionicons.glyphMap; // Nome do ícone que você vai passar
  onPress: () => void;
  size?: number;
  color?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ iconName, onPress, size = 25, color = 'white' }) => {
  return (
    <TouchableOpacity style={styles.iconButton} onPress={onPress}>
      <Ionicons name={iconName} size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    backgroundColor: '#8B0000',
    borderRadius: 20,
    padding: 15,
  },
});

export default IconButton;
