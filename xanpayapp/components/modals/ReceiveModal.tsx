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
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { OnboardingColors } from "@/constants/Colors";
import { InvoiceService, Product } from '@/services/invoiceService';
import { useBusiness } from '@/contexts/BusinessContext';

const { height: screenHeight } = Dimensions.get("window");

interface ReceiveModalProps {
  isVisible: boolean;
  onClose: () => void;
}

type ViewType = "options" | "funds" | "invoice";

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
                  ? screenHeight * 0.3
                  : currentView === "invoice"
                  ? screenHeight * 0.8
                  : screenHeight * 0.55,
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
                    {currentView === "invoice" ? "Create Invoice" : "Funds"}
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
                  onInvoicePress={() => setCurrentView("invoice")}
                  onFundsPress={() => setCurrentView("funds")}
                />
              ) : currentView === "invoice" ? (
                <InvoiceView onBack={() => setCurrentView("options")} onClose={handleClose} />
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

// Dynamic crypto address will be retrieved from BusinessContext

// Invoice View Component
interface InvoiceViewProps {
  onBack: () => void;
  onClose: () => void;
}

function InvoiceView({ onBack, onClose }: InvoiceViewProps) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const products = await InvoiceService.getProducts();
      setProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!productId.trim()) {
      Alert.alert("Error", "Please enter a Product ID");
      return;
    }

    if (!quantity.trim() || parseInt(quantity) <= 0) {
      Alert.alert("Error", "Please enter a valid quantity");
      return;
    }

    setLoading(true);
    try {
      const result = await InvoiceService.createInvoice({
        product: productId.trim(),
        quantity: parseInt(quantity),
      });

      if (result.success) {
        Alert.alert(
          "Success", 
          "Invoice created successfully!",
          [{ text: "OK", onPress: onClose }]
        );
      } else {
        throw new Error(result.error || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === productId);

  return (
    <ScrollView style={styles.invoiceContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        {/* Product ID Input */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel} darkColor={OnboardingColors.text}>
            Product ID *
          </ThemedText>
          <TextInput
            style={styles.textInput}
            value={productId}
            onChangeText={setProductId}
            placeholder="Enter product ID"
            placeholderTextColor="#999"
            accessibilityLabel="Product ID"
            accessibilityHint="Enter the ID of the product for this invoice"
          />
        </View>

        {/* Quantity Input */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel} darkColor={OnboardingColors.text}>
            Quantity *
          </ThemedText>
          <TextInput
            style={styles.textInput}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Enter quantity"
            placeholderTextColor="#999"
            keyboardType="numeric"
            accessibilityLabel="Quantity"
            accessibilityHint="Enter the quantity for this invoice"
          />
        </View>

        {/* Product Preview */}
        {selectedProduct && (
          <View style={styles.productPreview}>
            <ThemedText style={styles.previewTitle} darkColor={OnboardingColors.text}>
              Product Preview
            </ThemedText>
            <View style={styles.productCard}>
              <ThemedText style={styles.productName} darkColor={OnboardingColors.text}>
                {selectedProduct.productName}
              </ThemedText>
              <ThemedText style={styles.productPrice} darkColor={OnboardingColors.text}>
                ${selectedProduct.price} {selectedProduct.currency}
              </ThemedText>
              <ThemedText style={styles.productStock} darkColor={OnboardingColors.text}>
                Available: {selectedProduct.quantity}
              </ThemedText>
              {parseInt(quantity) > 0 && (
                <ThemedText style={styles.totalPrice} darkColor={OnboardingColors.accent}>
                  Total: ${(selectedProduct.price * parseInt(quantity || "0")).toFixed(2)}
                </ThemedText>
              )}
            </View>
          </View>
        )}

        {/* Available Products */}
        {loadingProducts ? (
          <View style={styles.productsSection}>
            <ThemedText style={styles.sectionTitle} darkColor={OnboardingColors.text}>
              Loading Products...
            </ThemedText>
          </View>
        ) : products.length > 0 ? (
          <View style={styles.productsSection}>
            <ThemedText style={styles.sectionTitle} darkColor={OnboardingColors.text}>
              Available Products
            </ThemedText>
            {products.slice(0, 3).map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.productItem,
                  productId === product.id && styles.selectedProductItem
                ]}
                onPress={() => setProductId(product.id)}
              >
                <View style={styles.productInfo}>
                  <ThemedText style={styles.productItemName} darkColor={OnboardingColors.text}>
                    {product.productName}
                  </ThemedText>
                  <ThemedText style={styles.productItemPrice} darkColor={OnboardingColors.text}>
                    ${product.price} {product.currency}
                  </ThemedText>
                </View>
                <ThemedText style={styles.productId} darkColor="#666">
                  ID: {product.id}
                </ThemedText>
              </TouchableOpacity>
            ))}
            {products.length > 3 && (
              <ThemedText style={styles.moreProducts} darkColor="#666">
                +{products.length - 3} more products available
              </ThemedText>
            )}
          </View>
        ) : (
          <View style={styles.productsSection}>
            <ThemedText style={styles.sectionTitle} darkColor={OnboardingColors.text}>
              No Products Available
            </ThemedText>
            <ThemedText style={styles.moreProducts} darkColor="#666">
              Add products first to create invoices
            </ThemedText>
          </View>
        )}

        {/* Create Invoice Button */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateInvoice}
          disabled={loading}
          accessibilityLabel="Create Invoice"
          accessibilityHint="Creates an invoice with the specified product and quantity"
          accessibilityRole="button"
        >
          <ThemedText style={styles.createButtonText}>
            {loading ? "Creating..." : "Create Invoice"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Funds View Component
interface FundsViewProps {
  onBack: () => void;
}

function FundsView({ onBack }: FundsViewProps) {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const { businessDetails, isLoading, error, refreshBusinessDetails } = useBusiness();

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 10)}...${address.slice(-4)}`;
  };

  // Get the wallet address from business details
  const walletAddress = businessDetails?.userAddress;
  const isAddressAvailable = walletAddress && walletAddress.trim() !== '';

  // Handle copy functionality
  const handleCopyAddress = async () => {
    if (!isAddressAvailable) return;
    
    try {
      await Clipboard.setStringAsync(walletAddress);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
      Alert.alert("Error", "Failed to copy address to clipboard");
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.fundsContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={OnboardingColors.accent} />
          <ThemedText style={styles.loadingText} darkColor={OnboardingColors.text}>
            Loading wallet address...
          </ThemedText>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.fundsContainer}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText} darkColor={OnboardingColors.text}>
            Failed to load wallet address
          </ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refreshBusinessDetails}
            accessibilityLabel="Retry loading address"
            accessibilityRole="button"
          >
            <ThemedText style={styles.retryButtonText}>
              Tap to retry
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fundsContainer}>
      <View style={styles.addressSection}>
        <ThemedText
          style={styles.addressLabel}
          darkColor={OnboardingColors.text}
        >
          Your Crypto Address
        </ThemedText>

        {isAddressAvailable ? (
          <View style={styles.addressContainer}>
            <ThemedText
              style={styles.addressText}
              darkColor={OnboardingColors.text}
            >
              {formatAddress(walletAddress)}
            </ThemedText>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyAddress}
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
        ) : (
          <View style={styles.addressContainer}>
            <ThemedText
              style={[styles.addressText, styles.noAddressText]}
              darkColor={OnboardingColors.text}
            >
              Wallet address not available
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.qrSection}>
        {isAddressAvailable ? (
          <View style={styles.qrContainer}>
            <QRCode
              value={walletAddress}
              size={180}
              color={OnboardingColors.text}
              backgroundColor="#FFFFFF"
            />
          </View>
        ) : (
          <View style={styles.qrContainer}>
            <View style={styles.qrPlaceholder}>
              <IconSymbol
                name="qrcode"
                size={60}
                color="#ccc"
              />
              <ThemedText style={styles.qrPlaceholderText} darkColor="#999">
                QR code unavailable
              </ThemedText>
            </View>
          </View>
        )}
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
    height: '30%',
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
    marginBottom: 60,
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
  // Invoice View Styles
  invoiceContainer: {
    flex: 1,
  },
  formContainer: {
    paddingBottom: 10,
    
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "Clash",
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Clash",
    color: "#333",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  productPreview: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e3f2fd",
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: "Clash",
    fontWeight: "600",
    marginBottom: 12,
    color: OnboardingColors.accent,
  },
  productCard: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  productName: {
    fontSize: 16,
    fontFamily: "Clash",
    fontWeight: "600",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontFamily: "Clash",
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    fontFamily: "Clash",
    opacity: 0.7,
    marginBottom: 8,
  },
  totalPrice: {
    fontSize: 16,
    fontFamily: "Clash",
    fontWeight: "600",
  },
  productsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Clash",
    fontWeight: "600",
    marginBottom: 12,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  selectedProductItem: {
    backgroundColor: "#e8f5e8",
    borderColor: OnboardingColors.accent,
  },
  productInfo: {
    flex: 1,
  },
  productItemName: {
    fontSize: 14,
    fontFamily: "Clash",
    fontWeight: "500",
    marginBottom: 2,
  },
  productItemPrice: {
    fontSize: 12,
    fontFamily: "Clash",
    opacity: 0.7,
  },
  productId: {
    fontSize: 10,
    fontFamily: "Clash",
    opacity: 0.6,
  },
  moreProducts: {
    fontSize: 12,
    fontFamily: "Clash",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
  createButton: {
    backgroundColor: OnboardingColors.accent,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  createButtonDisabled: {
    backgroundColor: "#ccc",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Clash",
    fontWeight: "600",
  },
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Clash",
    marginTop: 16,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Clash",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: OnboardingColors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Clash",
    fontWeight: "600",
  },
  noAddressText: {
    opacity: 0.6,
    fontStyle: "italic",
  },
  qrPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    height: 180,
  },
  qrPlaceholderText: {
    fontSize: 14,
    fontFamily: "Clash",
    marginTop: 8,
    textAlign: "center",
  },
});
