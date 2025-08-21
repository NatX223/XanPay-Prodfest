import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingColors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessService, TransactionService, Transaction, BusinessDetails } from '@/services/businessService';
import { TransactionChart } from '@/components/charts/TransactionChart';

interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalOutgoing: number;
  transactionCount: number;
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    totalIncome: 0,
    totalOutgoing: 0,
    transactionCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      
      // Load business details and transactions in parallel
      const [businessData, transactionData] = await Promise.all([
        BusinessService.getUserBusinessDetails(),
        TransactionService.getUserTransactions(),
      ]);

      setBusinessDetails(businessData);
      setTransactions(transactionData);
      
      // Calculate stats
      const calculatedStats = calculateStats(businessData, transactionData);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (business: BusinessDetails, transactions: Transaction[]): DashboardStats => {
    let totalIncome = 0;
    let totalOutgoing = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'Send') {
        totalOutgoing += transaction.amount;
      } else {
        totalIncome += transaction.amount;
      }
    });

    return {
      totalBalance: business.userBalance,
      totalIncome,
      totalOutgoing,
      transactionCount: transactions.length,
    };
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={OnboardingColors.accent} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[OnboardingColors.accent]}
            tintColor={OnboardingColors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.businessName}>
              {businessDetails?.businessName || 'User'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color={OnboardingColors.accent} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(stats.totalBalance)}
          </Text>
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Income</Text>
              <Text style={[styles.balanceStatValue, styles.incomeText]}>
                +{formatCurrency(stats.totalIncome)}
              </Text>
            </View>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Outgoing</Text>
              <Text style={[styles.balanceStatValue, styles.outgoingText]}>
                -{formatCurrency(stats.totalOutgoing)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <Ionicons name="receipt-outline" size={24} color={OnboardingColors.accent} />
            <Text style={styles.statValue}>{stats.transactionCount}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up-outline" size={24} color="#10B981" />
            <Text style={styles.statValue}>
              {stats.totalIncome > stats.totalOutgoing ? '+' : ''}
              {formatCurrency(stats.totalIncome - stats.totalOutgoing)}
            </Text>
            <Text style={styles.statLabel}>Net Flow</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color={OnboardingColors.accent} />
            <Text style={styles.statValue}>
              {transactions.length > 0 ? formatDate(Math.max(...transactions.map(t => t.createdAt))) : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Last Activity</Text>
          </View>
        </View>

        {/* Chart Period Selector */}
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Transaction History</Text>
          <View style={styles.periodSelector}>
            {(['week', 'month', 'year'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  chartPeriod === period && styles.activePeriodButton,
                ]}
                onPress={() => setChartPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    chartPeriod === period && styles.activePeriodButtonText,
                  ]}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transaction Chart */}
        {transactions.length > 0 ? (
          <TransactionChart
            transactions={transactions}
            type="line"
            period={chartPeriod}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="bar-chart-outline" size={48} color="#ccc" />
            <Text style={styles.noDataTitle}>No Transaction Data</Text>
            <Text style={styles.noDataMessage}>
              Start making transactions to see your analytics here.
            </Text>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.recentTransactions}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.slice(0, 5).map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Ionicons
                  name={
                    transaction.type === 'Send'
                      ? 'arrow-up-outline'
                      : transaction.type === 'Deposit'
                      ? 'arrow-down-outline'
                      : 'receipt-outline'
                  }
                  size={20}
                  color={
                    transaction.type === 'Send'
                      ? '#EF4444'
                      : '#10B981'
                  }
                />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionType}>{transaction.type}</Text>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.createdAt)}
                </Text>
                {transaction.note && (
                  <Text style={styles.transactionNote}>{transaction.note}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.type === 'Send' ? styles.outgoingText : styles.incomeText,
                ]}
              >
                {transaction.type === 'Send' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Clash',
    color: OnboardingColors.text,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Clash',
    fontWeight: '600',
    color: OnboardingColors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Clash',
    color: '#645b6b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: OnboardingColors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Clash',
    fontWeight: '500',
    color: OnboardingColors.buttonText,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Clash',
    color: '#645b6b',
  },
  businessName: {
    fontSize: 24,
    fontFamily: 'Clash',
    fontWeight: '600',
    color: OnboardingColors.text,
  },
  signOutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(138, 99, 210, 0.1)',
  },
  balanceCard: {
    backgroundColor: 'rgba(138, 99, 210, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(138, 99, 210, 0.2)',
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: 'Clash',
    color: '#645b6b',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: 'Clash',
    fontWeight: '700',
    color: OnboardingColors.text,
    marginBottom: 16,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceStat: {
    flex: 1,
  },
  balanceStatLabel: {
    fontSize: 12,
    fontFamily: 'Clash',
    color: '#645b6b',
    marginBottom: 4,
  },
  balanceStatValue: {
    fontSize: 16,
    fontFamily: 'Clash',
    fontWeight: '600',
  },
  incomeText: {
    color: '#10B981',
  },
  outgoingText: {
    color: '#EF4444',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Clash',
    fontWeight: '600',
    color: OnboardingColors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Clash',
    color: '#645b6b',
    textAlign: 'center',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: 'Clash',
    fontWeight: '600',
    color: OnboardingColors.text,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activePeriodButton: {
    backgroundColor: OnboardingColors.accent,
  },
  periodButtonText: {
    fontSize: 12,
    fontFamily: 'Clash',
    color: '#645b6b',
  },
  activePeriodButtonText: {
    color: OnboardingColors.buttonText,
    fontWeight: '500',
  },
  noDataContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  noDataTitle: {
    fontSize: 18,
    fontFamily: 'Clash',
    fontWeight: '600',
    color: OnboardingColors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noDataMessage: {
    fontSize: 14,
    fontFamily: 'Clash',
    color: '#645b6b',
    textAlign: 'center',
  },
  recentTransactions: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Clash',
    fontWeight: '600',
    color: OnboardingColors.text,
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontFamily: 'Clash',
    fontWeight: '500',
    color: OnboardingColors.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Clash',
    color: '#645b6b',
  },
  transactionNote: {
    fontSize: 12,
    fontFamily: 'Clash',
    color: '#999',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Clash',
    fontWeight: '600',
  },
});