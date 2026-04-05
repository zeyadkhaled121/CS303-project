import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../shared/designTokens';


export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('=== ERROR BOUNDARY CAUGHT ===');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={80}
                color={COLORS.status.danger}
              />
            </View>

            {/* Error Title */}
            <Text style={styles.title}>Something Went Wrong</Text>

            {/* Error Message */}
            <Text style={styles.message}>
              {this.state.error?.toString().slice(0, 150)}
            </Text>

            {/* Developer Info (Debug Only) */}
            {__DEV__ && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>🐛 Debug Info:</Text>
                <Text style={styles.debugText}>
                  {this.state.errorInfo?.componentStack}
                </Text>
                <Text style={styles.debugText}>
                  {'\n'}Error Count: {this.state.errorCount}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={this.handleReset}
              >
                <MaterialCommunityIcons name="reload" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  this.setState({ hasError: false });
                  this.props.navigation?.navigate('Home');
                }}
              >
                <MaterialCommunityIcons 
                  name="home" 
                  size={20} 
                  color={COLORS.brand.primary} 
                />
                <Text style={styles.secondaryButtonText}>Go to Home</Text>
              </TouchableOpacity>
            </View>

            {/* Support Info */}
            <Text style={styles.supportText}>
              If this continues, please contact support
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  iconContainer: {
    marginBottom: SPACING['2xl'],
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.lineHeights.normal * TYPOGRAPHY.sizes.base,
    paddingHorizontal: SPACING.md,
  },
  debugInfo: {
    width: '100%',
    backgroundColor: COLORS.background.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.status.danger,
    maxHeight: 200,
  },
  debugTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.status.danger,
    marginBottom: SPACING.sm,
  },
  debugText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
  },
  actionContainer: {
    width: '100%',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  primaryButton: {
    backgroundColor: COLORS.brand.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  primaryButtonText: {
    color: COLORS.text.onBrand,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.neutral[100],
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  secondaryButtonText: {
    color: COLORS.brand.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  supportText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xl,
    fontStyle: 'italic',
  },
};
