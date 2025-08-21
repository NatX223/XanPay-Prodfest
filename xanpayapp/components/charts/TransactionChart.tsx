import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { OnboardingColors } from '@/constants/Colors';
import { Transaction } from '@/services/businessService';

const screenWidth = Dimensions.get('window').width;

interface TransactionChartProps {
  transactions: Transaction[];
  type?: 'line' | 'bar';
  period?: 'week' | 'month' | 'year';
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }>;
}

export function TransactionChart({ 
  transactions, 
  type = 'line',
  period = 'week' 
}: TransactionChartProps) {
  const processTransactionData = (): ChartData => {
    const now = new Date();
    const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));

    // Filter transactions within the period
    const filteredTransactions = transactions.filter(
      transaction => new Date(transaction.createdAt) >= startDate
    );

    // Create date buckets
    const buckets: { [key: string]: number } = {};
    const labels: string[] = [];

    if (period === 'week') {
      // Daily buckets for week view
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const key = date.toISOString().split('T')[0];
        const label = date.toLocaleDateString('en-US', { weekday: 'short' });
        buckets[key] = 0;
        labels.push(label);
      }
    } else if (period === 'month') {
      // Weekly buckets for month view
      for (let i = 3; i >= 0; i--) {
        const date = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
        const weekStart = new Date(date.getTime() - (date.getDay() * 24 * 60 * 60 * 1000));
        const key = `week-${weekStart.toISOString().split('T')[0]}`;
        const label = `W${Math.ceil(date.getDate() / 7)}`;
        buckets[key] = 0;
        labels.push(label);
      }
    } else {
      // Monthly buckets for year view
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('en-US', { month: 'short' });
        buckets[key] = 0;
        labels.push(label);
      }
    }

    // Aggregate transaction data
    filteredTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      let key: string;

      if (period === 'week') {
        key = transactionDate.toISOString().split('T')[0];
      } else if (period === 'month') {
        const weekStart = new Date(transactionDate.getTime() - (transactionDate.getDay() * 24 * 60 * 60 * 1000));
        key = `week-${weekStart.toISOString().split('T')[0]}`;
      } else {
        key = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      }

      if (buckets.hasOwnProperty(key)) {
        // Spend is negative, deposits and purchases are positive
        const amount = transaction.type === 'Send' ? -transaction.amount : transaction.amount;
        buckets[key] += amount;
      }
    });

    const data = Object.values(buckets);

    return {
      labels,
      datasets: [{
        data: data.length > 0 ? data : [0], // Ensure at least one data point
        color: (opacity = 1) => `rgba(138, 99, 210, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  };

  const chartData = processTransactionData();

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: OnboardingColors.background,
    backgroundGradientTo: OnboardingColors.background,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(138, 99, 210, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 91, 107, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: OnboardingColors.accent,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: 'rgba(0, 0, 0, 0.1)',
      strokeWidth: 1,
    },
  };

  const calculateNetFlow = (): { income: number; outgoing: number; net: number } => {
    let income = 0;
    let outgoing = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'Send') {
        outgoing += transaction.amount;
      } else {
        income += transaction.amount;
      }
    });

    return { income, outgoing, net: income - outgoing };
  };

  const { income, outgoing, net } = calculateNetFlow();

  if (type === 'bar') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Transaction Flow</Text>
          <Text style={styles.period}>{period.charAt(0).toUpperCase() + period.slice(1)}</Text>
        </View>
        
        <BarChart
          data={chartData}
          width={screenWidth - 48}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          showValuesOnTopOfBars={false}
          fromZero={true}
          style={styles.chart}
        />
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statValue, styles.incomeValue]}>
              ${income.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Outgoing</Text>
            <Text style={[styles.statValue, styles.outgoingValue]}>
              ${outgoing.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Net</Text>
            <Text style={[
              styles.statValue, 
              net >= 0 ? styles.incomeValue : styles.outgoingValue
            ]}>
              ${net.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <Text style={styles.period}>{period.charAt(0).toUpperCase() + period.slice(1)}</Text>
      </View>
      
      <LineChart
        data={chartData}
        width={screenWidth - 48}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withDots={true}
        withShadow={false}
        withVerticalLabels={true}
        withHorizontalLabels={true}
      />
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={[styles.statValue, styles.incomeValue]}>
            ${income.toFixed(2)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Outgoing</Text>
          <Text style={[styles.statValue, styles.outgoingValue]}>
            ${outgoing.toFixed(2)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Net</Text>
          <Text style={[
            styles.statValue, 
            net >= 0 ? styles.incomeValue : styles.outgoingValue
          ]}>
            ${net.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Clash',
    fontWeight: '600',
    color: OnboardingColors.text,
  },
  period: {
    fontSize: 14,
    fontFamily: 'Clash',
    color: '#645b6b',
    textTransform: 'capitalize',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Clash',
    color: '#645b6b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Clash',
    fontWeight: '600',
  },
  incomeValue: {
    color: '#10B981',
  },
  outgoingValue: {
    color: '#EF4444',
  },
});