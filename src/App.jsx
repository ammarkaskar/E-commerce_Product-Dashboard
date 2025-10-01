import React, {
  createContext,
  useContext,
  useReducer,
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo
} from 'react';
import {
  Search,
  Filter,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle,
  X,
  Edit,
  Trash2,
  Plus,
  BarChart3
} from 'lucide-react';

/* ========= Error Boundary ========= */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We’re sorry, but there was an error loading the dashboard.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ========= Context Setup ========= */
const AuthContext = createContext();
const ProductContext = createContext();
const NotificationContext = createContext();

/* ========= Auth Provider ========= */
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 1,
    name: 'John Admin',
    role: 'admin',
    email: 'admin@example.com'
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = useCallback(() => setIsAuthenticated(true), []);
  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, login, logout }),
    [user, isAuthenticated, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* ========= Product Provider (useReducer) ========= */
const productReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.payload };
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, { ...action.payload, id: Date.now() }]
      };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? action.payload : p
        )
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload)
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, {
    products: [],
    loading: true,
    filter: 'all',
    searchTerm: '',
    error: null
  });

  // Generate fake data
  const generateMockProducts = useCallback(() => {
    const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty'];
    const statuses = ['active', 'inactive', 'out-of-stock'];

    return Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `Product ${i + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      price: Math.floor(Math.random() * 500) + 10,
      stock: Math.floor(Math.random() * 100),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      sales: Math.floor(Math.random() * 1000),
      rating: (Math.random() * 5).toFixed(1)
    }));
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchProducts = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!abortController.signal.aborted) {
          const products = generateMockProducts();
          dispatch({ type: 'SET_PRODUCTS', payload: products });
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          dispatch({ type: 'SET_ERROR', payload: err.message });
        }
      }
    };

    fetchProducts();
    return () => abortController.abort();
  }, [generateMockProducts]);

  const value = useMemo(() => ({ ...state, dispatch }), [state]);
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

/* ========= Notification Provider ========= */
const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(notification => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback(id => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const value = useMemo(
    () => ({ notifications, addNotification, removeNotification }),
    [notifications, addNotification, removeNotification]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

/* ========= Custom Hooks ========= */
const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
};

const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

// debounce hook
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

/* ========= Notifications UI ========= */
const NotificationContainer = memo(() => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`p-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-80 ${
            n.type === 'success'
              ? 'bg-green-100 text-green-800'
              : n.type === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {n.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {n.type === 'error' && <AlertCircle className="w-5 h-5" />}
          <span className="flex-1">{n.message}</span>
          <button onClick={() => removeNotification(n.id)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
});

/* ========= Analytics Cards ========= */
const AnalyticsDashboard = memo(() => {
  const { products } = useProducts();

  const analytics = useMemo(() => {
    if (!products.length) return null;

    const totalProducts = products.length;
    const totalSales = products.reduce((sum, p) => sum + p.sales, 0);
    const averageRating = (
      products.reduce((sum, p) => sum + parseFloat(p.rating), 0) / products.length
    ).toFixed(1);
    const outOfStock = products.filter(p => p.stock === 0).length;

    return { totalProducts, totalSales, averageRating, outOfStock };
  }, [products]);

  if (!analytics) return <div>Loading analytics...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total Products */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="text-3xl font-bold text-gray-800">{analytics.totalProducts}</p>
          </div>
          <Package className="w-12 h-12 text-blue-500" />
        </div>
      </div>

      {/* Total Sales */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Sales</p>
            <p className="text-3xl font-bold text-gray-800">
              {analytics.totalSales.toLocaleString()}
            </p>
          </div>
          <TrendingUp className="w-12 h-12 text-green-500" />
        </div>
      </div>

      {/* Average Rating */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Avg Rating</p>
            <p className="text-3xl font-bold text-gray-800">{analytics.averageRating}</p>
          </div>
          <BarChart3 className="w-12 h-12 text-yellow-500" />
        </div>
      </div>

      {/* Out of Stock */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Out of Stock</p>
            <p className="text-3xl font-bold text-gray-800">{analytics.outOfStock}</p>
          </div>
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
      </div>
    </div>
  );
});

/* ========= Virtual List ========= */
const VirtualProductList = memo(({ products, onEdit, onDelete }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const containerRef = React.useRef();

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, clientHeight } = containerRef.current;
        const itemHeight = 100;
        const start = Math.floor(scrollTop / itemHeight);
        const end = Math.min(start + Math.ceil(clientHeight / itemHeight) + 5, products.length);
        setVisibleRange({ start, end });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    return () => container && container.removeEventListener('scroll', handleScroll);
  }, [products.length]);

  const visibleProducts = products.slice(visibleRange.start, visibleRange.end);

  return (
    <div
      ref={containerRef}
      className="h-96 overflow-y-auto border rounded-lg"
      style={{ maxHeight: '600px' }}
    >
      <div style={{ height: visibleRange.start * 100 }} />
      {visibleProducts.map(product => (
        <ProductItem key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} />
      ))}
      <div style={{ height: (products.length - visibleRange.end) * 100 }} />
    </div>
  );
});

const ProductItem = memo(({ product, onEdit, onDelete }) => {
  const statusColor = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    'out-of-stock': 'bg-red-100 text-red-800'
  }[product.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="flex items-center justify-between p-4 border-b hover:bg-gray-50">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800">{product.name}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
          <span>{product.category}</span>
          <span>${product.price}</span>
          <span>Stock: {product.stock}</span>
          <span>Sales: {product.sales}</span>
          <span>★ {product.rating}</span>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>{product.status}</span>
        <button onClick={() => onEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

/* ========= Search and Filter ========= */
const SearchAndFilter = memo(() => {
  const { filter, searchTerm, dispatch } = useProducts();
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    dispatch({ type: 'SET_SEARCH', payload: debouncedSearch });
  }, [debouncedSearch, dispatch]);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <select
        value={filter}
        onChange={e => dispatch({ type: 'SET_FILTER', payload: e.target.value })}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="all">All Categories</option>
        <option value="Electronics">Electronics</option>
        <option value="Clothing">Clothing</option>
        <option value="Books">Books</option>
        <option value="Home">Home</option>
        <option value="Sports">Sports</option>
        <option value="Beauty">Beauty</option>
      </select>
    </div>
  );
});

/* ========= Product Dashboard ========= */
const ProductDashboard = () => {
  const { products, loading, error, filter, searchTerm, dispatch } = useProducts();
  const { addNotification } = useNotifications();
  const [editingProduct, setEditingProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesFilter = filter === 'all' || p.category === filter;
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [products, filter, searchTerm]);

  const handleEdit = useCallback(product => setEditingProduct(product), []);
  const handleDelete = useCallback(
    id => {
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
      addNotification({ type: 'success', message: 'Product deleted successfully' });
    },
    [dispatch, addNotification]
  );

  const handleSave = useCallback(
    updated => {
      dispatch({ type: 'UPDATE_PRODUCT', payload: updated });
      setEditingProduct(null);
      addNotification({ type: 'success', message: 'Product updated successfully' });
    },
    [dispatch, addNotification]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">Error Loading Products</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Dashboard</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>

        <AnalyticsDashboard />
        <SearchAndFilter />

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Products ({filteredProducts.length})
            </h2>
          </div>

          <VirtualProductList
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {editingProduct && (
          <ProductEditModal
            product={editingProduct}
            onSave={handleSave}
            onClose={() => setEditingProduct(null)}
          />
        )}
      </div>
    </div>
  );
};

/* ========= Product Edit Modal ========= */
const ProductEditModal = memo(({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState(product);

  const handleSubmit = () => onSave(formData);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Product</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={e =>
                setFormData({ ...formData, price: parseInt(e.target.value, 10) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              value={formData.stock}
              onChange={e =>
                setFormData({ ...formData, stock: parseInt(e.target.value, 10) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ========= Header ========= */
const Header = memo(() => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">E-Commerce Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">{user?.name}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

/* ========= App ========= */
const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <ProductProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <ProductDashboard />
            <NotificationContainer />
          </div>
        </NotificationProvider>
      </ProductProvider>
    </AuthProvider>
  </ErrorBoundary>
);

export default App;


// Ammar's project
