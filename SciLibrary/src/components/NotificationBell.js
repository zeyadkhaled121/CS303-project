import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import { COLORS } from '../../shared/designTokens';


export default function NotificationBell({ onPress }) {
  const { unreadCount } = useSelector(state => state.notifications);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.6}
    >
      <Icon name="bell" size={24} color={COLORS.text.onBrand} />

      {unreadCount > 0 && (
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
          {/* Pulsing dot indicator */}
          <Animated.View style={[styles.pulsingDot]} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.status.danger,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  badgeText: {
    color: COLORS.text.onDanger,
    fontSize: 10,
    fontWeight: 'bold',
  },
  pulsingDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.status.warning,
    top: -2,
    right: -2,
  },
});
