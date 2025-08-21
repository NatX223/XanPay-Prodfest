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
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingColors } from '@/constants/Colors';
import { InvoiceService, Product } from '@/services/invoiceService';

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, filterType]);

  const loadProducts = async () => {
    try {
      setError(null);
      const fetchedProducts = await InvoiceService.getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
      setError(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply stock filter
    switch (filterType) {
      case 'in-stock':
        filtered = filtered.filter(product => product.quantity > 5);
        break;
      case 'low-stock':
        filtered = filtered.filter(product => product.quantity > 0 && product.quantity <= 5);
        break;
      case 'out-of-stock':
        filtered = filtered.filter(product => product.quantity === 0);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProducts();
    setIsRefreshing(false);
  };

  const handleCreateInvoice = async (product: Product) => {
    try {
      const result = await InvoiceService.createInvoice({
        product: product.id,
        quantity: 1,
      });

      if (result.success) {
        Alert.alert('Success', 'Invoice created successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Failed to create invoice:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create invoice');
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return `${currency} ${price.toFixed(2)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: 'Out of Stock', color: '#EF4444' };
    if (quantity <= 5) return { text: 'Low Stock', color: '#F59E0B' };
    return { text: 'In Stock', color: '#10B981' };
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={OnboardingColors.accent} />
          <Text style={styles.loadingText}>Loading products...</Text>
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
          <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Products</Text>
            <Text style={styles.headerSubtitle}>
              {filteredProducts.length} of {products.length} {products.length === 1 ? 'product' : 'products'}
            </Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>
                {products.filter(p => p.quantity > 0).length} Active
              </Text>
            </View>
          </View>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#645b6b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#645b6b"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#645b6b" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'all', label: 'All Products' },
              { key: 'in-stock', label: 'In Stock' },
              { key: 'low-stock', label: 'Low Stock' },
              { key: 'out-of-stock', label: 'Out of Stock' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  filterType === filter.key && styles.activeFilterTab,
                ]}
                onPress={() => setFilterType(filter.key as typeof filterType)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filterType === filter.key && styles.activeFilterTabText,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products List */}
        <ScrollView
          style={styles.scrollView}
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
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>
                {products.length === 0 ? 'No Products Found' : 'No Matching Products'}
              </Text>
              <Text style={styles.emptyMessage}>
                {products.length === 0 
                  ? 'You don\'t have any products yet. Add some products to get started.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {filteredProducts.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <View style={styles.productImageContainer}>
                    {product.productImage ? (
                      <Image
                        source={{ uri: product.productImage }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Ionicons name="image-outline" size={32} color="#ccc" />
                      </View>
                    )}
                  </View>

                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.productName}
                    </Text>
                    <Text style={styles.productPrice}>
                      {formatPrice(product.price, product.currency)}
                    </Text>
                    
                    <View style={styles.productMeta}>
                      <View style={styles.stockInfo}>
                        <Text style={styles.productQuantity}>
                          Stock: {product.quantity}
                        </Text>
                        <View style={[
                          styles.stockBadge,
                          { backgroundColor: getStockStatus(product.quantity).color + '20' }
                        ]}>
                          <Text style={[
                            styles.stockBadgeText,
                            { color: getStockStatus(product.quantity).color }
                          ]}>
                            {getStockStatus(product.quantity).text}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.productDate}>
                        Added: {formatDate(product.createdAt)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.invoiceButton,
                      product.quantity === 0 && styles.disabledButton,
                    ]}
                    onPress={() => handleCreateInvoice(product)}
                    disabled={product.quantity === 0}
                  >
                    <Ionicons
                      name="receipt-outline"
                      size={16}
                      color={product.quantity === 0 ? '#999' : OnboardingColors.buttonText}
                    />
                    <Text
                      style={[
                        styles.invoiceButtonText,
                        product.quantity === 0 && styles.disabledButtonText,
                      ]}
                    >
                      Create Invoice
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Clash',
    fontWeight: '600',
    color: OnboardingColors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Clash',
    color: '#645b6b',
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  statBadge: {
    backgroundColor: 'rgba(138, 99, 210, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(138, 99, 210, 0.2)',
  },
  statBadgeText: {
    fontSize: 12,
    fontFamily: 'Clash',
    fontWeight: '500',
    color: OnboardingColors.accent,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Clash',
    color: OnboardingColors.text,
  },
  filterContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  activeFilterTab: {
    backgroundColor: OnboardingColors.accent,
    borderColor: OnboardingColors.accent,
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: 'Clash',
    color: '#645b6b',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: OnboardingColors.buttonText,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Clash',
    fontWeight: '600',
    color: OnboardingColors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: 'Clash',
    color: '#645b6b',
    textAlign: 'center',
    lineHeight: 22,
  },
  productsGrid: {
    gap: 16,
    paddingHorizontal: 24,
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  productImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 18,
    fontFamily: 'Clash',
    fontWeight: '600',
    color: OnboardingColors.text,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 20,
    fontFamily: 'Clash',
    fontWeight: '700',
    color: OnboardingColors.accent,
    marginBottom: 12,
  },
  productMeta: {
    gap: 8,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productQuantity: {
    fontSize: 14,
    fontFamily: 'Clash',
    color: '#645b6b',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockBadgeText: {
    fontSize: 11,
    fontFamily: 'Clash',
    fontWeight: '600',
  },
  productDate: {
    fontSize: 12,
    fontFamily: 'Clash',
    color: '#999',
  },
  invoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OnboardingColors.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  invoiceButtonText: {
    fontSize: 14,
    fontFamily: 'Clash',
    fontWeight: '500',
    color: OnboardingColors.buttonText,
  },
  disabledButtonText: {
    color: '#999',
  },
});