import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OnboardingColors } from '@/constants/Colors';

interface ReceiveModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function ReceiveModal({ isVisible, onClose }: ReceiveModalProps) {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Receive Payment</Text>
          <Text style={styles.subtitle}>Coming soon...</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Clash',
    fontWeight: 'bold',
    marginBottom: 8,
    color: OnboardingColors.text,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Clash',
    color: OnboardingColors.text,
    opacity: 0.7,
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: OnboardingColors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Clash',
    fontWeight: '600',
  },
});