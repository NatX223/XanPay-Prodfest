import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { OnboardingColors } from "@/constants/Colors";
import { WithdrawService } from '@/services/withdrawService';
import { useBusiness } from '@/contexts/BusinessContext';

const { height: screenHeight } = Dimensions.get("window");

interface WithdrawModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function WithdrawModal({
  isVisible,
  onClose,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const { businessDetails, refreshBusinessDetails } = useBusiness();

  const userBalance = businessDetails?.userBalance || 0;

  useEffect(() => {
    if (isVisible) {
      // Reset form when modal opens
      setAmount("");
      // Animate modal sliding up
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate modal sliding down
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const validateAmount = (amountStr: string): boolean => {
    const numAmount = parseFloat(amountStr);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return false;
    }

    if (numAmount > userBalance) {
      Alert.alert("Error", `Insufficient balance. Available: $${userBalance}`);
      return false;
    }

    return true;
  };

  const handleWithdraw = async () => {
    if (!amount.trim()) {
      Alert.alert("Error", "Please enter an amount");
      return;
    }

    if (!validateAmount(amount)) {
      return;
    }

    setLoading(true);
    try {
      const result = await WithdrawService.withdrawFiat({
        amount: parseFloat(amount),
      });

      if (result.success) {
        Alert.alert(
          "Success", 
          `Withdrawal initiated successfully!\nTransaction ID: ${result.transactionId}\nAmount: $${result.amount} → ${result.currency}`,
          [{ 
            text: "OK", 
            onPress: () => {
              handleClose();
              // Refresh business details to update balance
              refreshBusinessDetails();
            }
          }]
        );
      } else {
        throw new Error('Withdrawal failed');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to process withdrawal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }],
              height: screenHeight * 0.45,
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.titleContainer}>
              <ThemedText style={styles.title}>Withdraw</ThemedText>
              <TouchableOpacity
                onPress={handleClose}
                accessibilityLabel="Close modal"
                accessibilityHint="Closes the withdraw modal"
                accessibilityRole="button"
              >
                <IconSymbol name="xmark" size={22} color="#8a63d2" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              {/* Balance Info */}
              <View style={styles.balanceInfo}>
                <ThemedText style={styles.balanceLabel} darkColor={OnboardingColors.text}>
                  Available Balance
                </ThemedText>
                <ThemedText style={styles.balanceAmount} darkColor={OnboardingColors.accent}>
                  ${userBalance}
                </ThemedText>
              </View>

              {/* Amount Input */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel} darkColor={OnboardingColors.text}>
                  Amount to Withdraw *
                </ThemedText>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.currencySymbol} darkColor={OnboardingColors.text}>
                    $
                  </ThemedText>
                  <TextInput
                    style={styles.textInput}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                    accessibilityLabel="Withdrawal amount"
                    accessibilityHint="Enter the amount you want to withdraw"
                    editable={!loading}
                  />
                </View>
                <ThemedText style={styles.inputHint} darkColor="#666">
                  Maximum: ${userBalance}
                </ThemedText>
              </View>

              {/* Withdraw Button */}
              <TouchableOpacity
                style={[styles.withdrawButton, loading && styles.withdrawButtonDisabled]}
                onPress={handleWithdraw}
                disabled={loading}
                accessibilityLabel="Withdraw funds"
                accessibilityHint="Initiates the withdrawal process"
                accessibilityRole="button"
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <ThemedText style={styles.withdrawButtonText}>
                      Processing...
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText style={styles.withdrawButtonText}>
                    Withdraw
                  </ThemedText>
                )}
              </TouchableOpacity>

              {/* Info Text */}
              <ThemedText style={styles.infoText} darkColor="#666">
                Funds will be transferred to your registered bank account.
              </ThemedText>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    width: "100%",
  },
  titleContainer: {
    height: '25%',
    backgroundColor: "#FFFFFF",
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 27,
    color: "#8a63d2",
    fontFamily: "Clash",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  balanceInfo: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e9ecef",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: "Clash",
    marginBottom: 4,
    opacity: 0.7,
  },
  balanceAmount: {
    fontSize: 24,
    fontFamily: "Clash",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "Clash",
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingHorizontal: 16,
    height: 48,
  },
  currencySymbol: {
    fontSize: 18,
    fontFamily: "Clash",
    fontWeight: "600",
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Clash",
    color: "#333",
    height: "100%",
  },
  inputHint: {
    fontSize: 12,
    fontFamily: "Clash",
    marginTop: 4,
    opacity: 0.7,
  },
  withdrawButton: {
    backgroundColor: OnboardingColors.accent,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  withdrawButtonDisabled: {
    backgroundColor: "#ccc",
  },
  withdrawButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Clash",
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "Clash",
    textAlign: "center",
    lineHeight: 16,
  },
});