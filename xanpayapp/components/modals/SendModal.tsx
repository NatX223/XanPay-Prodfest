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
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { OnboardingColors } from "@/constants/Colors";

const { height: screenHeight } = Dimensions.get("window");

interface SendModalProps {
  isVisible: boolean;
  onClose: () => void;
}

type ViewType = "options" | "invoice" | "funds";
type InvoiceState = "input" | "loading" | "details";

// Mock invoice data
const MOCK_INVOICE = {
  id: "INV-001",
  businessName: "Tech Solutions Inc.",
  businessImage: "https://via.placeholder.com/60x60/8A63D2/FFFFFF?text=TS",
  serviceName: "Web Development Services",
  amount: "$2,450.00",
  createdDate: "2024-01-15",
};

// Chain options
const CHAIN_OPTIONS = [
  { id: "base", name: "Base", symbol: "BASE" },
  { id: "eth", name: "Ethereum", symbol: "ETH" },
  { id: "avax", name: "Avalanche", symbol: "AVAX" },
  { id: "wrld", name: "World", symbol: "WRLD" },
  { id: "op", name: "Optimism", symbol: "OP" },
  { id: "pol", name: "Polygon", symbol: "POL" },
  { id: "uni", name: "Uniswap", symbol: "UNI" },
];

export default function SendModal({ isVisible, onClose }: SendModalProps) {
  const [currentView, setCurrentView] = useState<ViewType>("options");
  const [invoiceState, setInvoiceState] = useState<InvoiceState>("input");
  const [invoiceId, setInvoiceId] = useState("");
  const [selectedChain, setSelectedChain] = useState(CHAIN_OPTIONS[0]);
  const [showChainDropdown, setShowChainDropdown] = useState(false);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  // Calculate modal height based on current view
  const getModalHeight = () => {
    if (currentView === "options") return screenHeight * 0.4;
    if (currentView === "invoice" && invoiceState === "details")
      return screenHeight * 0.7;
    return screenHeight * 0.6;
  };

  useEffect(() => {
    if (isVisible) {
      // Reset to options view when modal opens
      setCurrentView("options");
      setInvoiceState("input");
      setInvoiceId("");
      setAddress("");
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

  // Reset dropdown when switching views
  useEffect(() => {
    if (currentView !== "funds") {
      setShowChainDropdown(false);
    }
  }, [currentView]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleInvoiceSubmit = () => {
    if (!invoiceId.trim()) return;

    setInvoiceState("loading");
    // Simulate API call
    setTimeout(() => {
      setInvoiceState("details");
    }, 2000);
  };

  const handlePasteAddress = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      setAddress(clipboardContent);
    } catch (error) {
      console.error("Failed to paste from clipboard:", error);
    }
  };

  const getHeaderTitle = () => {
    if (currentView === "options") return "Send";
    if (currentView === "invoice") return "Invoice Payment";
    return "Send Funds";
  };

  const showBackButton = currentView !== "options";

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
              height: getModalHeight(),
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.titleContainer}>
              {currentView === "options" ? (
                <>
                  <ThemedText style={styles.title}>Send</ThemedText>
                  <TouchableOpacity
                    onPress={handleClose}
                    accessibilityLabel="Close modal"
                    accessibilityHint="Closes the send payment modal"
                    accessibilityRole="button"
                  >
                    <IconSymbol name="xmark" size={22} color="#8a63d2" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentView("options");
                      setInvoiceState("input");
                    }}
                    accessibilityLabel="Go back"
                    accessibilityHint="Returns to the send options view"
                    accessibilityRole="button"
                  >
                    <IconSymbol name="chevron.left" size={22} color="#8a63d2" />
                  </TouchableOpacity>
                  <ThemedText style={styles.title}>
                    {getHeaderTitle()}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={handleClose}
                    accessibilityLabel="Close modal"
                    accessibilityHint="Closes the send payment modal"
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
                <SendOptionsView
                  onInvoicePress={() => setCurrentView("invoice")}
                  onFundsPress={() => setCurrentView("funds")}
                />
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  onTouchStart={() => setShowChainDropdown(false)}
                >
                  {currentView === "invoice" ? (
                    <InvoiceView
                      state={invoiceState}
                      invoiceId={invoiceId}
                      onInvoiceIdChange={setInvoiceId}
                      onSubmit={handleInvoiceSubmit}
                    />
                  ) : (
                    <FundsView
                      address={address}
                      onAddressChange={setAddress}
                      onPasteAddress={handlePasteAddress}
                      selectedChain={selectedChain}
                      onChainSelect={setSelectedChain}
                      showChainDropdown={showChainDropdown}
                      onToggleChainDropdown={() =>
                        setShowChainDropdown(!showChainDropdown)
                      }
                      amount={amount}
                      onAmountChange={setAmount}
                    />
                  )}
                </ScrollView>
              )}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// Send Options View Component
interface SendOptionsViewProps {
  onInvoicePress: () => void;
  onFundsPress: () => void;
}

function SendOptionsView({
  onInvoicePress,
  onFundsPress,
}: SendOptionsViewProps) {
  return (
    <View style={styles.optionsContainer}>
      <SendOption
        icon="receipt"
        title="Invoice"
        description="Pay an existing invoice"
        onPress={onInvoicePress}
      />
      <SendOption
        icon="arrow.up.right"
        title="Funds"
        description="Send funds to an address"
        onPress={onFundsPress}
      />
    </View>
  );
}

// Individual Option Component
interface SendOptionProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

function SendOption({ icon, title, description, onPress }: SendOptionProps) {
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

// Invoice View Component
interface InvoiceViewProps {
  state: InvoiceState;
  invoiceId: string;
  onInvoiceIdChange: (id: string) => void;
  onSubmit: () => void;
}

function InvoiceView({
  state,
  invoiceId,
  onInvoiceIdChange,
  onSubmit,
}: InvoiceViewProps) {
  if (state === "input") {
    return (
      <View style={styles.invoiceInputContainer}>
        <ThemedText style={styles.inputLabel} darkColor={OnboardingColors.text}>
          Invoice ID
        </ThemedText>
        <TextInput
          style={styles.textInput}
          value={invoiceId}
          onChangeText={onInvoiceIdChange}
          placeholder="Enter invoice ID"
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={[
            styles.submitButton,
            !invoiceId.trim() && styles.submitButtonDisabled,
          ]}
          onPress={onSubmit}
          disabled={!invoiceId.trim()}
          accessibilityLabel="Submit invoice ID"
          accessibilityRole="button"
        >
          <ThemedText style={styles.submitButtonText}>Continue</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === "loading") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={OnboardingColors.accent} />
        <ThemedText
          style={styles.loadingText}
          darkColor={OnboardingColors.text}
        >
          Loading invoice details...
        </ThemedText>
      </View>
    );
  }

  // Invoice details view
  return (
    <View style={styles.invoiceDetailsContainer}>
      <View style={styles.businessHeader}>
        <Image
          source={{ uri: MOCK_INVOICE.businessImage }}
          style={styles.businessImage}
        />
        <View style={styles.businessInfo}>
          <ThemedText
            style={styles.businessName}
            darkColor={OnboardingColors.text}
          >
            {MOCK_INVOICE.businessName}
          </ThemedText>
          <ThemedText
            style={styles.invoiceIdText}
            darkColor={OnboardingColors.text}
          >
            Invoice #{MOCK_INVOICE.id}
          </ThemedText>
        </View>
      </View>

      <View style={styles.invoiceDetails}>
        <View style={styles.detailRow}>
          <ThemedText
            style={styles.detailLabel}
            darkColor={OnboardingColors.text}
          >
            Service
          </ThemedText>
          <ThemedText
            style={styles.detailValue}
            darkColor={OnboardingColors.text}
          >
            {MOCK_INVOICE.serviceName}
          </ThemedText>
        </View>

        <View style={styles.detailRow}>
          <ThemedText
            style={styles.detailLabel}
            darkColor={OnboardingColors.text}
          >
            Amount
          </ThemedText>
          <ThemedText
            style={styles.detailValueAmount}
            darkColor={OnboardingColors.text}
          >
            {MOCK_INVOICE.amount}
          </ThemedText>
        </View>

        <View style={styles.detailRow}>
          <ThemedText
            style={styles.detailLabel}
            darkColor={OnboardingColors.text}
          >
            Created
          </ThemedText>
          <ThemedText
            style={styles.detailValue}
            darkColor={OnboardingColors.text}
          >
            {MOCK_INVOICE.createdDate}
          </ThemedText>
        </View>
      </View>

      <TouchableOpacity
        style={styles.payButton}
        accessibilityLabel="Pay invoice"
        accessibilityRole="button"
      >
        <ThemedText style={styles.payButtonText}>
          Pay {MOCK_INVOICE.amount}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

// Funds View Component
interface FundsViewProps {
  address: string;
  onAddressChange: (address: string) => void;
  onPasteAddress: () => void;
  selectedChain: (typeof CHAIN_OPTIONS)[0];
  onChainSelect: (chain: (typeof CHAIN_OPTIONS)[0]) => void;
  showChainDropdown: boolean;
  onToggleChainDropdown: () => void;
  amount: string;
  onAmountChange: (amount: string) => void;
}

function FundsView({
  address,
  onAddressChange,
  onPasteAddress,
  selectedChain,
  onChainSelect,
  showChainDropdown,
  onToggleChainDropdown,
  amount,
  onAmountChange,
}: FundsViewProps) {
  return (
    <View style={styles.fundsContainer}>
      {/* Address Field */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel} darkColor={OnboardingColors.text}>
          Address
        </ThemedText>
        <View style={styles.addressInputContainer}>
          <TextInput
            style={styles.addressInput}
            value={address}
            onChangeText={onAddressChange}
            placeholder="Enter recipient address"
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.pasteButton}
            onPress={onPasteAddress}
            accessibilityLabel="Paste address"
            accessibilityRole="button"
          >
            <ThemedText style={styles.pasteButtonText}>Paste</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chain Selection */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel} darkColor={OnboardingColors.text}>
          Chain
        </ThemedText>
        <TouchableOpacity
          style={styles.chainSelector}
          onPress={onToggleChainDropdown}
          accessibilityLabel="Select chain"
          accessibilityRole="button"
        >
          <ThemedText
            style={styles.chainText}
            darkColor={OnboardingColors.text}
          >
            {selectedChain.name}
          </ThemedText>
          <IconSymbol
            name="chevron.down"
            size={16}
            color={OnboardingColors.text}
          />
        </TouchableOpacity>

        {showChainDropdown && (
          <View style={styles.chainDropdown}>
            {CHAIN_OPTIONS.map((chain) => (
              <TouchableOpacity
                key={chain.id}
                style={styles.chainOption}
                onPress={() => {
                  onChainSelect(chain);
                  onToggleChainDropdown();
                }}
              >
                <ThemedText
                  style={styles.chainOptionText}
                  darkColor={OnboardingColors.text}
                >
                  {chain.name}
                </ThemedText>
                {selectedChain.id === chain.id && (
                  <IconSymbol
                    name="checkmark"
                    size={16}
                    color={OnboardingColors.accent}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Amount Field */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel} darkColor={OnboardingColors.text}>
          Amount
        </ThemedText>
        <TextInput
          style={styles.textInput}
          value={amount}
          onChangeText={onAmountChange}
          placeholder="0.00"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      {/* Send Button */}
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!address || !amount) && styles.sendButtonDisabled,
        ]}
        disabled={!address || !amount}
        accessibilityLabel="Send funds"
        accessibilityRole="button"
      >
        <ThemedText style={styles.sendButtonText}>Send</ThemedText>
      </TouchableOpacity>
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
    overflow: "hidden",
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
  // Invoice styles
  invoiceInputContainer: {
    paddingVertical: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "Clash",
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: "Clash",
    backgroundColor: "#f8f9fa",
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: OnboardingColors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Clash",
    fontWeight: "600",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Clash",
    marginTop: 16,
    opacity: 0.7,
  },
  invoiceDetailsContainer: {
    paddingVertical: 20,
  },
  businessHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  businessImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontFamily: "Clash",
    fontWeight: "600",
    marginBottom: 4,
  },
  invoiceIdText: {
    fontSize: 14,
    fontFamily: "Clash",
    opacity: 0.7,
  },
  invoiceDetails: {
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 16,
    fontFamily: "Clash",
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: "Clash",
    fontWeight: "500",
  },
  detailValueAmount: {
    fontSize: 18,
    fontFamily: "Clash",
    fontWeight: "600",
    color: OnboardingColors.accent,
  },
  payButton: {
    backgroundColor: OnboardingColors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Clash",
    fontWeight: "600",
  },
  // Funds styles
  fundsContainer: {
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  addressInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
  },
  addressInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontFamily: "Clash",
  },
  pasteButton: {
    backgroundColor: OnboardingColors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  pasteButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Clash",
    fontWeight: "600",
  },
  chainSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  chainText: {
    fontSize: 16,
    fontFamily: "Clash",
  },
  chainDropdown: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chainOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  chainOptionText: {
    fontSize: 16,
    fontFamily: "Clash",
  },
  sendButton: {
    backgroundColor: OnboardingColors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Clash",
    fontWeight: "600",
  },
});
