import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

import { BankDropdownProps, BankOption } from '@/types/bankDetails';
import { BANK_OPTIONS, getBankByCode } from '@/constants/bankOptions';
import { OnboardingColors } from '@/constants/Colors';

export function BankDropdown({
  value,
  onValueChange,
  error,
  disabled = false,
}: BankDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Animation values
  const focusAnimation = useSharedValue(0);
  const errorAnimation = useSharedValue(0);

  React.useEffect(() => {
    focusAnimation.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  React.useEffect(() => {
    errorAnimation.value = withTiming(error ? 1 : 0, { duration: 200 });
  }, [error]);

  const selectedBank = getBankByCode(value);

  const handlePress = () => {
    if (!disabled) {
      setIsOpen(true);
      setIsFocused(true);
    }
  };

  const handleSelect = (bankCode: string) => {
    onValueChange(bankCode);
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsFocused(false);
  };

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      ['#645b6b', OnboardingColors.accent]
    );

    const errorBorderColor = interpolateColor(
      errorAnimation.value,
      [0, 1],
      [borderColor, '#FF3B30']
    );

    return {
      borderColor: errorBorderColor,
    };
  });

  const renderBankItem = ({ item }: { item: BankOption }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        value === item.code && styles.selectedItem,
      ]}
      onPress={() => handleSelect(item.code)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Select ${item.displayName}`}
    >
      <Text style={[
        styles.dropdownItemText,
        value === item.code && styles.selectedItemText,
      ]}>
        {item.displayName}
      </Text>
      {value === item.code && (
        <Ionicons
          name="checkmark"
          size={20}
          color={OnboardingColors.accent}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Bank Name</Text>
      
      <Animated.View style={[styles.inputContainer, containerAnimatedStyle]}>
        <TouchableOpacity
          style={[styles.dropdown, disabled && styles.disabled]}
          onPress={handlePress}
          disabled={disabled}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Select bank"
          accessibilityHint="Opens bank selection dropdown"
          accessibilityState={{
            expanded: isOpen,
            disabled: disabled,
          }}
        >
          <Text style={[
            styles.dropdownText,
            !selectedBank && styles.placeholderText,
            disabled && styles.disabledText,
          ]}>
            {selectedBank ? selectedBank.displayName : 'Select a bank'}
          </Text>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={disabled ? '#999' : OnboardingColors.accent}
          />
        </TouchableOpacity>
      </Animated.View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Bank</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close bank selection"
              >
                <Ionicons name="close" size={24} color={OnboardingColors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={BANK_OPTIONS}
              renderItem={renderBankItem}
              keyExtractor={(item) => item.code}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Clash',
    color: OnboardingColors.accent,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#645b6b',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Clash',
    color: OnboardingColors.accent,
  },
  placeholderText: {
    color: '#645b6b',
  },
  disabledText: {
    color: '#999',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Clash',
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: OnboardingColors.background,
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
    elevation: 8,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Clash',
    fontWeight: '600',
    color: OnboardingColors.text,
  },
  closeButton: {
    padding: 4,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  selectedItem: {
    backgroundColor: 'rgba(138, 99, 210, 0.1)',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Clash',
    color: OnboardingColors.text,
  },
  selectedItemText: {
    color: OnboardingColors.accent,
    fontWeight: '500',
  },
});