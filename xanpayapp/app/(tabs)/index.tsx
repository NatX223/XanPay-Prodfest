import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { OnboardingColors } from "@/constants/Colors";
import { useBusiness } from "@/contexts/BusinessContext";
import { TransactionService, Transaction } from "@/services/businessService";
import ReceiveModal from "@/components/modals/ReceiveModal";
import SendModal from "@/components/modals/SendModal";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const currencies = [
  { code: "USDC", symbol: "$", balance: "2,450.75" },
  { code: "NGN", symbol: "₦", balance: "1,850,000.00" },
  { code: "USD", symbol: "$", balance: "2,450.75" },
];

export default function HomeScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const { businessDetails, isLoading, error, refreshBusinessDetails } =
    useBusiness();

  // Fetch transactions when business details are loaded
  useEffect(() => {
    if (businessDetails) {
      fetchTransactions();
    }
  }, [businessDetails]);

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const userTransactions = await TransactionService.getUserTransactions();
      setTransactions(userTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refreshBusinessDetails(), fetchTransactions()]);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "Deposit":
        return "arrow.down";
      case "Send":
        return "arrow.up.right";
      case "Purchase":
        return "cart";
      default:
        return "circle";
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "Deposit":
        return "#10B981";
      case "Send":
        return "#EF4444";
      case "Purchase":
        return "#F59E0B";
      default:
        return OnboardingColors.text;
    }
  };

  const formatTransactionDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTransactionAmount = (amount: number, type: string) => {
    const prefix = type === "Deposit" || type === "Purchase" ? "+" : "-";
    return `${prefix}$${amount.toFixed(2)}`;
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.transactionIconContainer,
            { backgroundColor: getTransactionColor(item.type) + "20" },
          ]}
        >
          <IconSymbol
            name={getTransactionIcon(item.type)}
            size={20}
            color={getTransactionColor(item.type)}
          />
        </View>
        <View style={styles.transactionDetails}>
          <ThemedText
            style={styles.transactionDescription}
            darkColor={OnboardingColors.text}
          >
            {item.type}
          </ThemedText>
          <ThemedText
            style={styles.transactionInfo}
            darkColor={OnboardingColors.text}
          >
            {`${formatTransactionDate(item.createdAt)} • ${
              item.productName || item.note || "Transaction"
            }`}
          </ThemedText>
        </View>
      </View>
      <ThemedText
        style={[
          styles.transactionAmount,
          { color: getTransactionColor(item.type) },
        ]}
      >
        {formatTransactionAmount(item.amount, item.type)}
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView
        style={styles.container}
        lightColor={OnboardingColors.background}
        darkColor={OnboardingColors.background}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={isLoading || transactionsLoading}
              onRefresh={handleRefresh}
              colors={[OnboardingColors.accent]}
              tintColor={OnboardingColors.accent}
            />
          }
        >
          {/* Header with Logo and Business Image */}
          <View style={styles.headerContainer}>
            <View style={styles.logoRow}>
              <Image
                source={{
                  uri:
                    businessDetails?.businessImage ||
                    "https://via.placeholder.com/50x50/8A63D2/FFFFFF?text=B",
                }}
                style={styles.businessImage}
              />
              <ThemedText
                style={styles.logoText}
                darkColor={OnboardingColors.logoText}
              >
                {businessDetails?.businessName || "XanPay"}
              </ThemedText>
            </View>
            {isLoading && (
              <ActivityIndicator size="small" color={OnboardingColors.accent} />
            )}
          </View>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <View style={styles.balanceLeft}>
                <ThemedText style={styles.balanceLabel} lightColor="#FFFFFF">
                  Total Balance
                </ThemedText>
                <View style={styles.balanceRow}>
                  <ThemedText style={styles.currencySymbol}>
                    {selectedCurrency.symbol}
                  </ThemedText>
                  <ThemedText style={styles.balanceAmount}>
                    {businessDetails?.userBalance?.toFixed(2) || "0.00"}
                  </ThemedText>
                </View>
                {error && (
                  <TouchableOpacity
                    onPress={refreshBusinessDetails}
                    style={styles.errorContainer}
                  >
                    <ThemedText style={styles.errorText}>
                      Tap to retry
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={styles.currencySelector}
                onPress={() => setShowCurrencyModal(true)}
              >
                <ThemedText style={styles.currencyCode} lightColor="#FFFFFF">
                  {selectedCurrency.code}
                </ThemedText>
                <IconSymbol name="chevron.down" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Icons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowReceiveModal(true)}
              accessibilityLabel="Receive payment"
              accessibilityHint="Opens options to receive payments via invoice or crypto address"
              accessibilityRole="button"
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol
                  name="plus"
                  size={24}
                  color={OnboardingColors.accent}
                />
              </View>
              <ThemedText style={styles.actionLabel}>Receive</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowSendModal(true)}
              accessibilityLabel="Send payment"
              accessibilityHint="Opens options to send payments via invoice or crypto address"
              accessibilityRole="button"
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol
                  name="arrow.up.right"
                  size={24}
                  color={OnboardingColors.accent}
                />
              </View>
              <ThemedText style={styles.actionLabel}>Send</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <IconSymbol
                  name="banknote"
                  size={24}
                  color={OnboardingColors.accent}
                />
              </View>
              <ThemedText style={styles.actionLabel}>Withdraw</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Transactions List */}
          <View style={styles.transactionsContainer}>
            <View style={styles.transactionsHeader}>
              <ThemedText
                style={styles.transactionsTitle}
                darkColor={OnboardingColors.text}
              >
                Recent Transactions
              </ThemedText>
              {transactionsLoading && (
                <ActivityIndicator
                  size="small"
                  color={OnboardingColors.accent}
                />
              )}
            </View>
            {transactions.length > 0 ? (
              <FlatList
                data={transactions.slice(0, 10)} // Show only recent 10 transactions
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyTransactions}>
                <ThemedText style={styles.emptyTransactionsText}>
                  No transactions yet
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Currency Selection Modal */}
        <Modal
          visible={showCurrencyModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCurrencyModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCurrencyModal(false)}
          >
            <View style={styles.currencyModal}>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={styles.currencyOption}
                  onPress={() => {
                    setSelectedCurrency(currency);
                    setShowCurrencyModal(false);
                  }}
                >
                  <ThemedText
                    style={styles.currencyOptionText}
                    lightColor={OnboardingColors.text}
                  >
                    {currency.code} - {currency.symbol}
                    {currency.balance}
                  </ThemedText>
                  {selectedCurrency.code === currency.code && (
                    <IconSymbol
                      name="checkmark"
                      size={20}
                      color={OnboardingColors.accent}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Receive Modal */}
        <ReceiveModal
          isVisible={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
        />

        {/* Send Modal */}
        <SendModal
          isVisible={showSendModal}
          onClose={() => setShowSendModal(false)}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: OnboardingColors.background,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerContainer: {
    marginTop: 12,
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  businessImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  logoText: {
    fontSize: 25,
    fontFamily: "Clash",
  },
  balanceCard: {
    width: "100%",
    height: screenHeight * 0.2,
    backgroundColor: OnboardingColors.accent,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flex: 1,
  },
  balanceLeft: {
    flex: 1,
    justifyContent: "center",
  },
  balanceLabel: {
    fontSize: 16,
    fontFamily: "Clash",
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currencySymbol: {
    fontSize: 30,
    fontFamily: "Clash",
    marginRight: 4,
    color: "#fbfafc",
  },
  balanceAmount: {
    fontSize: 30,
    fontFamily: "Clash",
    color: "#fbfafc",
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  currencyCode: {
    fontSize: 14,
    fontFamily: "Clash",
    fontWeight: "600",
    marginRight: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 32,
  },
  actionButton: {
    alignItems: "center",
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 25,
    borderColor: "#d0bce0",
    backgroundColor: "#f6f2f7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 14,
    fontFamily: "Clash",
    fontWeight: "500",
    color: "#8a63d2",
  },
  transactionsContainer: {
    flex: 1,
    marginBottom: 100,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 20,
    fontFamily: "Clash",
  },
  emptyTransactions: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyTransactionsText: {
    fontSize: 16,
    fontFamily: "Clash",
    color: OnboardingColors.text,
    opacity: 0.6,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontFamily: "Clash",
    fontWeight: "400",
    marginBottom: 2,
  },
  transactionInfo: {
    fontSize: 14,
    fontFamily: "Clash",
    opacity: 0.6,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: "Clash",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  currencyModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: screenWidth * 0.8,
    maxWidth: 300,
  },
  currencyOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  currencyOptionText: {
    fontSize: 16,
    fontFamily: "Clash",
    fontWeight: "500",
  },
  errorContainer: {
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Clash",
    color: "rgba(255, 255, 255, 0.8)",
    textDecorationLine: "underline",
  },
});
