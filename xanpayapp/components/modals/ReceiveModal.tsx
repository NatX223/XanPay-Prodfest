import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { OnboardingColors } from "@/constants/Colors";

const { height: screenHeight } = Dimensions.get("window");

interface ReceiveModalProps {
  isVisible: boolean;
  onClose: () => void;
}

type ViewType = "options" | "funds";

export default function ReceiveModal({
  isVisible,
  onClose,
}: ReceiveModalProps) {
  const [currentView, setCurrentView] = useState<ViewType>("options");
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset to options view when modal opens
      setCurrentView("options");
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
              height:
                currentView === "options"
                  ? screenHeight * 0.32
                  : screenHeight * 0.6,
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.titleContainer}>
              {currentView === "options" ? (
                <>
                  <ThemedText style={styles.title}>Receive</ThemedText>
                  <TouchableOpacity
                    onPress={handleClose}
                    accessibilityLabel="Close modal"
                    accessibilityHint="Closes the receive payment modal"
                    accessibilityRole="button"
                  >
                    <IconSymbol name="xmark" size={22} color="#8a63d2" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => setCurrentView("options")}
                    accessibilityLabel="Go back"
                    accessibilityHint="Returns to the receive options view"
                    accessibilityRole="button"
                  >
                    <IconSymbol name="chevron.left" size={22} color="#8a63d2" />
                  </TouchableOpacity>
                  <ThemedText style={styles.title} lightColor="#FFFFFF">
                    Funds
                  </ThemedText>
                  <TouchableOpacity
                    onPress={handleClose}
                    accessibilityLabel="Close modal"
                    accessibilityHint="Closes the receive payment modal"
                    accessibilityRole="button"
                  >
                    <IconSymbol name="xmark" size={22} color="#8a63d2" />
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              {currentView === "options" ? (
                <ReceiveOptionsView
                  onInvoicePress={() => {
                    handleClose();
                    router.push("/(tabs)/dashboard");
                  }}
                  onFundsPress={() => setCurrentView("funds")}
                />
              ) : (
                <FundsView onBack={() => setCurrentView("options")} />
              )}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// Options View Component
interface ReceiveOptionsViewProps {
  onInvoicePress: () => void;
  onFundsPress: () => void;
}

function ReceiveOptionsView({
  onInvoicePress,
  onFundsPress,
}: ReceiveOptionsViewProps) {
  return (
    <View style={styles.optionsContainer}>
      <ReceiveOption
        icon="receipt"
        title="Invoice"
        description="Create a payment request"
        onPress={onInvoicePress}
      />
      <ReceiveOption
        icon="arrow.down.left"
        title="Funds"
        description="Show your crypto address"
        onPress={onFundsPress}
      />
    </View>
  );
}

// Individual Option Component
interface ReceiveOptionProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

function ReceiveOption({
  icon,
  title,
  description,
  onPress,
}: ReceiveOptionProps) {
  return (
    <TouchableOpacity
      style={styles.optionButton}
      onPress={onPress}
      accessibilityLabel={`${title} option`}
      accessibilityHint={description}
      accessibilityRole="button"
    >
      <View style={styles.optionIconContainer}>
        <IconSymbol
          name={icon as any}
          size={24}
          color={OnboardingColors.accent}
        />
      </View>
      <View style={styles.optionTextContainer}>
        <ThemedText
          style={styles.optionTitle}
          darkColor={OnboardingColors.text}
        >
          {title}
        </ThemedText>
        <ThemedText
          style={styles.optionDescription}
          darkColor={OnboardingColors.text}
        >
          {description}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

// Static crypto address constant
const STATIC_CRYPTO_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

// Funds View Component
interface FundsViewProps {
  onBack: () => void;
}

function FundsView({ onBack }: FundsViewProps) {
  const [copyFeedback, setCopyFeedback] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-4)}`;
  };

  return (
    <View style={styles.fundsContainer}>
      <View style={styles.addressSection}>
        <ThemedText
          style={styles.addressLabel}
          darkColor={OnboardingColors.text}
        >
          Your Crypto Address
        </ThemedText>

        <View style={styles.addressContainer}>
          <ThemedText
            style={styles.addressText}
            darkColor={OnboardingColors.text}
          >
            {formatAddress(STATIC_CRYPTO_ADDRESS)}
          </ThemedText>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={async () => {
              try {
                await Clipboard.setStringAsync(STATIC_CRYPTO_ADDRESS);
                setCopyFeedback(true);
                setTimeout(() => setCopyFeedback(false), 2000);
              } catch (error) {
                console.error("Failed to copy address:", error);
                // Could show error feedback here
              }
            }}
            accessibilityLabel={
              copyFeedback ? "Address copied" : "Copy address"
            }
            accessibilityHint="Copies the crypto address to clipboard"
            accessibilityRole="button"
          >
            <ThemedText style={styles.copyButtonText}>
              {copyFeedback ? "Copied!" : "Copy"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.qrSection}>
        <View style={styles.qrContainer}>
          <QRCode
            value={STATIC_CRYPTO_ADDRESS}
            size={180}
            color={OnboardingColors.text}
            backgroundColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
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
    height: "30%",
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
    paddingBottom: 8,
  },
  optionsContainer: {
    flex: 1,
    gap: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#bcf5d8",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: OnboardingColors.accent + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontFamily: "Clash",
    fontWeight: "500",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: "Clash",
    opacity: 0.7,
  },
  fundsContainer: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 5,
  },
  addressSection: {
    marginBottom: 40,
  },
  addressLabel: {
    fontSize: 18,
    fontFamily: "Clash",
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  addressText: {
    fontSize: 16,
    fontFamily: "Clash",
    fontWeight: "500",
    flex: 1,
  },
  copyButton: {
    backgroundColor: OnboardingColors.accent,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 12,
  },
  copyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Clash",
    fontWeight: "600",
  },
  fullAddressText: {
    fontSize: 12,
    fontFamily: "Courier New",
    opacity: 0.6,
    textAlign: "center",
    lineHeight: 16,
  },
  qrSection: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
  },
  qrContainer: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 230,
    height: 230,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 1,
  },
});
