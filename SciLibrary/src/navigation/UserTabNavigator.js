import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { COLORS } from '../../shared/designTokens';

// Screens
import HomeScreen from '../screens/HomeScreen';
import CatalogScreen from '../screens/CatalogScreen';
import MyBorrowedBooksScreen from '../screens/MyBorrowedBooksScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

// Badge component for notification indicator
const NotificationBadge = ({ count }) => {
  if (!count || count === 0) return null;
  
  return (
    <View style={{
      position: 'absolute',
      right: -8,
      top: -3,
      backgroundColor: '#ef4444',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#fff',
    }}>
      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

const UserTabNavigator = () => {
  // Get unread notifications count
  const { items: notifications, unreadCount } = useSelector((state) => state.notifications);
  const computedUnread = unreadCount || notifications?.filter((n) => !n.read).length || 0;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Catalog':
              iconName = focused ? 'library-shelves' : 'library-shelves';
              break;
            case 'MyBorrowedBooks':
              iconName = focused ? 'book-multiple' : 'book-multiple-outline';
              break;
            case 'Settings':
              iconName = focused ? 'account-circle' : 'account-circle-outline';
              break;
            default:
              iconName = 'circle';
          }

          return (
            <View style={{ position: 'relative' }}>
              <MaterialCommunityIcons name={iconName} size={size} color={color} />
              {route.name === 'Home' && <NotificationBadge count={computedUnread} />}
            </View>
          );
        },
        tabBarActiveTintColor: COLORS.brand.primary,
        tabBarInactiveTintColor: COLORS.neutral[400],
        tabBarStyle: {
          backgroundColor: COLORS.background.primary,
          borderTopColor: COLORS.neutral[200],
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          marginTop: -2,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.background.primary,
          borderBottomColor: COLORS.neutral[200],
          borderBottomWidth: 1,
          elevation: 0,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: COLORS.text.primary,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard', headerShown: false }} />
      <Tab.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Catalog', headerShown: false }} />
      <Tab.Screen name="MyBorrowedBooks" component={MyBorrowedBooksScreen} options={{ title: 'My Library', headerShown: false }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings', headerShown: false }} />
    </Tab.Navigator>
  );
};

export default UserTabNavigator;
