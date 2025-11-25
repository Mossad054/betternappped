/**
 * UniversalModal - Unified modal component for the entire application
 * Features:
 * - Consistent theming and background
 * - Scrollable content
 * - Keyboard-safe behavior
 * - Device-responsive layout
 * - Safe area support
 * - Accessibility support
 */

import React, { ReactNode } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/Typography';

interface FooterButton {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

interface UniversalModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footerButtons?: FooterButton[];
  scrollable?: boolean;
  fullHeight?: boolean;
  maxHeight?: number | string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  headerRight?: ReactNode;
  testID?: string;
}

export default function UniversalModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footerButtons,
  scrollable = true,
  fullHeight = false,
  maxHeight,
  showCloseButton = true,
  closeOnBackdrop = true,
  animationType = 'slide',
  headerRight,
  testID,
}: UniversalModalProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Responsive calculations
  const isTablet = screenWidth >= 768;
  const isSmallScreen = screenHeight < 700;
  const modalWidth = isTablet ? Math.min(600, screenWidth * 0.8) : screenWidth;

  // Calculate max height based on device
  const calculatedMaxHeight = maxHeight
    ? (typeof maxHeight === 'string' ? screenHeight * 0.9 : maxHeight)
    : fullHeight
      ? screenHeight - insets.top - insets.bottom
      : screenHeight * 0.85;

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const getButtonStyle = (variant: FooterButton['variant'] = 'primary') => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.border,
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.error,
          borderColor: theme.colors.error,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        };
    }
  };

  const getButtonTextColor = (variant: FooterButton['variant'] = 'primary') => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
        return theme.colors.text;
      case 'ghost':
        return theme.colors.primary;
      default:
        return '#FFFFFF';
    }
  };

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentWrapperProps = scrollable
    ? {
        showsVerticalScrollIndicator: true,
        bounces: true,
        keyboardShouldPersistTaps: 'handled' as const,
        contentContainerStyle: styles.scrollContent,
      }
    : {};

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      statusBarTranslucent
      testID={testID}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={[
                styles.modalContainer,
                isTablet && styles.modalContainerTablet,
              ]}
            >
              <View
                style={[
                  styles.modalContent,
                  {
                    backgroundColor: theme.colors.card,
                    maxHeight: calculatedMaxHeight,
                    width: modalWidth,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.lg,
                  },
                  isTablet && styles.modalContentTablet,
                  fullHeight && {
                    height: calculatedMaxHeight,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  },
                ]}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                    <View style={styles.headerContent}>
                      {title && (
                        <View style={styles.headerTitles}>
                          <Text
                            style={[
                              styles.title,
                              Typography.h3,
                              { color: theme.colors.text },
                            ]}
                            numberOfLines={2}
                          >
                            {title}
                          </Text>
                          {subtitle && (
                            <Text
                              style={[
                                styles.subtitle,
                                Typography.bodySmall,
                                { color: theme.colors.textSecondary },
                              ]}
                              numberOfLines={2}
                            >
                              {subtitle}
                            </Text>
                          )}
                        </View>
                      )}
                      {headerRight}
                    </View>
                    {showCloseButton && (
                      <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: theme.colors.surfaceVariant }]}
                        onPress={onClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityLabel="Close modal"
                        accessibilityRole="button"
                      >
                        <X size={20} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Content */}
                <ContentWrapper
                  style={[
                    styles.body,
                    !scrollable && styles.bodyNonScrollable,
                  ]}
                  {...contentWrapperProps}
                >
                  {children}
                </ContentWrapper>

                {/* Footer */}
                {footerButtons && footerButtons.length > 0 && (
                  <View
                    style={[
                      styles.footer,
                      { borderTopColor: theme.colors.border },
                      footerButtons.length === 1 && styles.footerSingle,
                    ]}
                  >
                    {footerButtons.map((button, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.footerButton,
                          getButtonStyle(button.variant),
                          button.disabled && styles.footerButtonDisabled,
                          footerButtons.length === 1 && styles.footerButtonFull,
                        ]}
                        onPress={button.onPress}
                        disabled={button.disabled || button.loading}
                        accessibilityLabel={button.label}
                        accessibilityRole="button"
                      >
                        <Text
                          style={[
                            styles.footerButtonText,
                            Typography.button,
                            { color: getButtonTextColor(button.variant) },
                            button.disabled && styles.footerButtonTextDisabled,
                          ]}
                        >
                          {button.loading ? 'Loading...' : button.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    justifyContent: 'flex-end',
  },
  modalContainerTablet: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContentTablet: {
    borderRadius: 24,
    maxWidth: 600,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: SPACING.md,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  bodyNonScrollable: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    gap: SPACING.md,
  },
  footerSingle: {
    justifyContent: 'center',
  },
  footerButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    minHeight: 48,
  },
  footerButtonFull: {
    flex: 1,
  },
  footerButtonDisabled: {
    opacity: 0.5,
  },
  footerButtonText: {
    textAlign: 'center',
  },
  footerButtonTextDisabled: {
    opacity: 0.7,
  },
});

// Export constants for use in other components
export const MODAL_SPACING = SPACING;
export const MODAL_TYPOGRAPHY = Typography;
