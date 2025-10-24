import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { userAPI } from '@agro-gram/api';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAqToIQ04s5SexvDX7Oi_q4Y1GPu91KzW0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "agrogram-dev.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "agro-gram-dev",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "agrogram-dev.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1075416759881",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1075416759881:web:368bb7098c6e8cf6454998"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const tokenRefreshIntervalRef = useRef(null);
  const previousFirebaseUidRef = useRef(null);

  // Load existing profile from localStorage on initial mount
  useEffect(() => {
    const existingProfile = localStorage.getItem('userProfile');
    if (existingProfile && !userProfile) {
      try {
        const profileData = JSON.parse(existingProfile);
        console.log('🔄 Loading existing profile from localStorage');
        setUserProfile(profileData);
        console.log('🎯 Restored User Profile Data:', {
          email: profileData.email,
          role: profileData.role,
          sub_role: profileData.sub_role,
          first_name: profileData.first_name
        });
      } catch (error) {
        console.error('❌ Error loading cached profile:', error);
        localStorage.removeItem('userProfile');
      }
    }
  }, []);

  const refreshTokenPeriodically = (user) => {
    if (tokenRefreshIntervalRef.current) {
      clearInterval(tokenRefreshIntervalRef.current);
    }
    
    tokenRefreshIntervalRef.current = setInterval(async () => {
      try {
        if (user) {
          const freshToken = await user.getIdToken(true);
          localStorage.setItem('firebaseToken', freshToken);
          console.log('🔄 Token refreshed automatically');
        }
      } catch (error) {
        console.error('❌ Automatic token refresh failed:', error);
      }
    }, 45 * 60 * 1000);
    
    return tokenRefreshIntervalRef.current;
  };

  const loadUserProfile = async (firebaseUser, forceRefresh = false) => {
    console.log('📡 Starting profile load...', { 
      forceRefresh, 
      previousUid: previousFirebaseUidRef.current,
      newUid: firebaseUser.uid 
    });
    
    setProfileLoading(true);
    
    try {
      // Clear cached profile if user changes
      if (forceRefresh || previousFirebaseUidRef.current !== firebaseUser.uid) {
        console.log('🧹 Clearing cached profile due to user change');
        localStorage.removeItem('userProfile');
        previousFirebaseUidRef.current = firebaseUser.uid;
      }

      // Fetch fresh profile from API
      const response = await userAPI.getProfile();
      console.log('📡 Profile API response received');
      
      if (response.success && response.data) {
        const profileData = response.data;
        
        // Validate profile belongs to current user
        if (profileData.firebase_uid === firebaseUser.uid) {
          console.log('✅ Profile loaded successfully from API');
          console.log('🎯 User Profile Data:', {
            email: profileData.email,
            role: profileData.role,
            sub_role: profileData.sub_role,
            first_name: profileData.first_name
          });
          
          setUserProfile(profileData);
          localStorage.setItem('userProfile', JSON.stringify(profileData));
        } else {
          console.warn('⚠️ Profile UID mismatch');
          localStorage.removeItem('userProfile');
          throw new Error('Profile UID mismatch');
        }
      } else {
        console.warn('⚠️ Profile API failed - using cached data if available');
        // Check for valid cached profile
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          const parsedProfile = JSON.parse(cachedProfile);
          if (parsedProfile.firebase_uid === firebaseUser.uid) {
            console.log('✅ Using cached profile');
            setUserProfile(parsedProfile);
            return;
          }
        }
        throw new Error('Failed to load user profile');
      }
    } catch (profileError) {
      console.error('❌ Profile load error:', profileError.message);
      // Don't set userProfile to null - keep existing state
      throw profileError;
    } finally {
      setProfileLoading(false);
    }
  };

  const cleanupAuth = () => {
    console.log('🧹 Cleaning up auth state');
    setUser(null);
    setUserProfile(null);
    setProfileLoading(false);
    previousFirebaseUidRef.current = null;
    
    if (tokenRefreshIntervalRef.current) {
      clearInterval(tokenRefreshIntervalRef.current);
      tokenRefreshIntervalRef.current = null;
    }
    
    localStorage.removeItem('firebaseToken');
    localStorage.removeItem('userProfile');
  };

  useEffect(() => {
    let isSubscribed = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isSubscribed) return;

      console.log('🔄 Auth state changed:', { 
        user: firebaseUser ? firebaseUser.email : 'No user',
        previousUid: previousFirebaseUidRef.current,
        newUid: firebaseUser?.uid 
      });
      
      if (firebaseUser) {
        console.log('👤 Setting user state for:', firebaseUser.email);
        if (isSubscribed) {
          setUser(firebaseUser);
        }

        try {
          const token = await firebaseUser.getIdToken();
          console.log('💾 Token stored');
          localStorage.setItem('firebaseToken', token);

          refreshTokenPeriodically(firebaseUser);

          // Force refresh when user changes
          const forceRefresh = previousFirebaseUidRef.current !== firebaseUser.uid;
          await loadUserProfile(firebaseUser, forceRefresh);

        } catch (error) {
          console.error('❌ Auth setup error:', error);
          // Keep existing profile state on error
        }
      } else {
        console.log('🔒 No user - clearing all state');
        if (isSubscribed) {
          cleanupAuth();
        }
      }
      
      if (isSubscribed) {
        setAuthChecked(true);
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth listener');
      isSubscribed = false;
      cleanupAuth();
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Login attempt for:', email);
      
      cleanupAuth();
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('firebaseToken', token);
      
      console.log('✅ Login successful for:', email);
      return { success: true, user: userCredential.user };
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      cleanupAuth();
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // 
  const register = async (registrationData) => {
  try {
    const { email, password, ...userData } = registrationData;
    
    console.log('👤 Registration attempt for:', email);
    console.log('📝 Registration data received:', registrationData);
    
    cleanupAuth();
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    const token = await firebaseUser.getIdToken();
    localStorage.setItem('firebaseToken', token);
    
    console.log('✅ Firebase registration successful for:', email);
    
    try {
      // FIX: Handle both camelCase and snake_case field names
      const cleanUserData = {
        email: email,
        firebase_uid: firebaseUser.uid,
        role: userData.role,
        // Handle both subRole and sub_role field names
        sub_role: userData.sub_role || userData.subRole,
        first_name: userData.first_name || userData.firstName,
        last_name: userData.last_name || userData.lastName,
        phone_number: userData.phone_number || userData.phoneNumber,
        location: userData.location,
        business_name: userData.business_name || userData.businessName,
        farm_size: userData.farm_size || userData.farmSize,
        business_description: userData.business_description || userData.businessDescription
      };
      
      // Remove undefined/null/empty values
      Object.keys(cleanUserData).forEach(key => {
        if (cleanUserData[key] === undefined || 
            cleanUserData[key] === null || 
            cleanUserData[key] === '') {
          delete cleanUserData[key];
        }
      });

      console.log('📤 Sending to backend API:', cleanUserData);
      
      // Use the correct API endpoint
      const response = await userAPI.register(cleanUserData);
      console.log('✅ Backend registration response:', response);
      
      if (response.success) {
        // Store the user profile immediately
        setUserProfile(response.data);
        localStorage.setItem('userProfile', JSON.stringify(response.data));
      } else {
        console.error('❌ Backend registration failed:', response);
        throw new Error(response.error || 'Backend registration failed');
      }
      
    } catch (profileError) {
      console.error('❌ Backend profile creation failed:', profileError);
      // Even if backend fails, we still have Firebase user
      throw profileError;
    }
    
    return { 
      success: true, 
      user: firebaseUser,
      message: 'Registration successful!' 
    };
  } catch (error) {
    console.error('❌ Registration error:', error);
    cleanupAuth();
    
    let errorMessage = 'Registration failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters long.';
    } else if (error.message.includes('Backend registration failed')) {
      errorMessage = 'Account created but profile setup failed. Please contact support.';
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

  const logout = async () => {
    try {
      console.log('🚪 Logging out user:', user?.email);
      await userAPI.logout();
    } catch (error) {
      console.warn('API logout failed:', error);
    } finally {
      await signOut(auth);
      cleanupAuth();
      console.log('✅ Logout successful');
    }
    return { success: true };
  };

  const refreshProfile = async (force = false) => {
    if (user) {
      try {
        setProfileLoading(true);
        console.log('🔄 Refreshing profile for:', user.email);
        
        if (force) {
          localStorage.removeItem('userProfile');
        }
        
        await loadUserProfile(user, force);
        return { success: true };
      } catch (error) {
        console.error('Profile refresh error:', error);
        return { success: false, error: error.message };
      } finally {
        setProfileLoading(false);
      }
    }
    return { success: false, error: 'No user logged in' };
  };

  const ensureFreshToken = async () => {
    if (user) {
      try { 
        const token = await user.getIdToken(true);
        localStorage.setItem('firebaseToken', token);
        console.log('🔄 Token refreshed');
        return token;
      } catch (error) {
        console.error('Token refresh error:', error);
        return null;
      }
    }
    return null;
  };

  // Permission and role-based helper functions
  const canSellProducts = () => {
    const role = userProfile?.role;
    return ['FARMER', 'SUPPLIER', 'ADMIN'].includes(role);
  };

  const canAccessForms = () => {
    const role = userProfile?.role;
    return ['FARMER', 'ADMIN', 'AGENT'].includes(role);
  };

  const canAccessCropRecommendation = () => {
    const role = userProfile?.role;
    return ['FARMER', 'ADMIN', 'AGENT'].includes(role);
  };

  const canAccessPricePrediction = () => true;

  const canAccessAIAssistant = () => true;

  const hasPermission = (permission) => {
    const role = userProfile?.role;
    
    const rolePermissions = {
      FARMER: [
        'marketplace.sell_products',
        'forms.access',
        'ai.crop_recommendation',
        'ai.price_prediction',
        'ai.assistant',
        'farms.manage'
      ],
      CONSUMER: [
        'marketplace.buy_products', 
        'marketplace.cart',
        'ai.price_prediction',
        'ai.shopping_assistant',
        'orders.manage'
      ],
      SUPPLIER: [
        'marketplace.sell_products',
        'marketplace.inventory',
        'ai.price_prediction', 
        'ai.business_assistant',
        'products.manage'
      ],
      ADMIN: ['*'],
      AGENT: [
        'forms.view_farms',
        'ai.crop_recommendation',
        'ai.price_prediction',
        'ai.assistant',
        'farmers.assist'
      ]
    };

    const permissions = rolePermissions[role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  };
  
const getDashboardData = async () => {
  try {
    // use the new modular structure 
    const response = await userAPI.getDashboardBySubRole(userProfile?.sub_role);
    if (response && response.success) {
      return response;
    }

    // Fallback to role-based dashboard
    const role = userProfile?.role;
    const roleEndpoints = {
      'FARMER': () => dashboardAPI.farmer.smallholder(),
      'CONSUMER': () => dashboardAPI.consumer.individual(),
      'SUPPLIER': () => dashboardAPI.supplier.input(),
      'AGENT': () => dashboardAPI.agent.financial.dashboard(),
      'ADMIN': () => dashboardAPI.admin.platform(),
    };
    const endpoint = roleEndpoints[role];
    if (endpoint) {
      const fallbackResponse = await endpoint();
      return fallbackResponse;
    }

    return { success: false, error: 'No dashboard configured for role' };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { success: false, error: 'Failed to load dashboard' };
  }
};
  const getRoleFeatures = () => {
    const role = userProfile?.role;
    
    const features = {
      FARMER: {
        canSellProducts: true,
        canBuyProducts: true,
        canAccessForms: true,
        canAccessCropRecommendation: true,
        canAccessPricePrediction: true,
        canAccessAIAssistant: true,
        canManageFarms: true,
        canManageTasks: true,
        canViewAnalytics: true,
        dashboardType: 'farmer',
        displayName: 'Farmer',
        marketplaceView: 'full',
        allowedRoutes: [
          '/', '/dashboard', '/farmer-dashboard', '/farms', '/marketplace', '/recommendations',
          '/price-predictions', '/ai-assistant', '/analytics', '/tasks', '/profile'
        ]
      },
      CONSUMER: {
        canSellProducts: false,
        canBuyProducts: true,
        canAccessForms: false,
        canAccessCropRecommendation: false,
        canAccessPricePrediction: true,
        canAccessAIAssistant: true,
        canManageFarms: false,
        canManageTasks: false,
        canViewAnalytics: false,
        dashboardType: 'consumer',
        displayName: 'Consumer',
        marketplaceView: 'consumer',
        allowedRoutes: [
          '/', '/dashboard', '/consumer-dashboard', '/marketplace', '/cart', '/orders',
          '/price-predictions', '/ai-assistant', '/profile'
        ]
      },
      SUPPLIER: {
        canSellProducts: true,
        canBuyProducts: true,
        canAccessForms: false,
        canAccessCropRecommendation: false,
        canAccessPricePrediction: true,
        canAccessAIAssistant: true,
        canManageFarms: false,
        canManageTasks: false,
        canViewAnalytics: true,
        dashboardType: 'supplier',
        displayName: 'Supplier',
        marketplaceView: 'supplier',
        allowedRoutes: [
          '/', '/dashboard', '/supplier-dashboard', '/marketplace', '/supplier-products', 
          '/price-predictions', '/ai-assistant', '/supplier-analytics', '/profile', '/orders'
        ]
      },
      ADMIN: {
        canSellProducts: true,
        canBuyProducts: true,
        canAccessForms: true,
        canAccessCropRecommendation: true,
        canAccessPricePrediction: true,
        canAccessAIAssistant: true,
        canManageFarms: true,
        canManageTasks: true,
        canViewAnalytics: true,
        dashboardType: 'admin',
        displayName: 'Administrator',
        marketplaceView: 'full',
        allowedRoutes: ['*']
      },
      AGENT: {
        canSellProducts: false,
        canBuyProducts: true,
        canAccessForms: true,
        canAccessCropRecommendation: true,
        canAccessPricePrediction: true,
        canAccessAIAssistant: true,
        canManageFarms: false,
        canManageTasks: false,
        canViewAnalytics: true,
        dashboardType: 'agent',
        displayName: 'Agricultural Agent',
        marketplaceView: 'full',
        allowedRoutes: [
          '/', '/dashboard', '/agent-dashboard', '/marketplace', '/recommendations',
          '/price-predictions', '/ai-assistant', '/agent-farms', '/profile'
        ]
      }
    };

    return features[role] || features.CONSUMER;
  };

  const isRouteAllowed = (route) => {
    const role = userProfile?.role;
    if (!role) return false;
    
    if (role === 'ADMIN') return true;
    
    const features = getRoleFeatures();
    
    if (features.allowedRoutes.includes('*')) return true;
    if (features.allowedRoutes.includes(route)) return true;
    
    const matchedRoute = features.allowedRoutes.find(allowedRoute => 
      route.startsWith(allowedRoute.replace('/*', ''))
    );
    
    return !!matchedRoute;
  };

  const getRoleDashboard = () => {
    const role = userProfile?.role;
    const dashboards = {
      FARMER: '/',
      CONSUMER: '/consumer-dashboard',
      SUPPLIER: '/supplier-dashboard',
      ADMIN: '/',
      AGENT: '/'
    };
    return dashboards[role] || '/';
  };

  const getDashboardComponent = () => {
    const role = userProfile?.role;
    switch (role) {
      case 'CONSUMER':
        return 'consumer';
      case 'SUPPLIER':
        return 'supplier';
      case 'FARMER':
      case 'ADMIN':
      case 'AGENT':
      default:
        return 'default';
    }
  };

  const value = {
    user,
    userProfile,
    loading: loading && !authChecked,
    profileLoading,
    login,
    register,
    logout,
    refreshProfile,
    ensureFreshToken,
    canSellProducts,
    canAccessForms,
    canAccessCropRecommendation,
    canAccessPricePrediction,
    canAccessAIAssistant,
    getRoleFeatures,
    hasPermission,
    getDashboardData,
    isRouteAllowed,
    getRoleDashboard,
    getDashboardComponent
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};