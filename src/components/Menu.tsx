import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import Icon from 'react-native-vector-icons/Feather';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
}

const Menu: React.FC<MenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const menuItems = [
    { id: 'currency', label: 'Currency Selection', icon: 'dollar-sign', description: 'Choose your preferred currency' },
    { id: 'history', label: 'Transaction History', icon: 'clock', description: 'View all your transactions' },
    { id: 'about', label: 'About Us', icon: 'info', description: 'Learn about the app' },
    { id: 'recommendations', label: 'Recommendations', icon: 'trending-up', description: 'Get spending insights' },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        
        <View style={[styles.menuPanel, isDark ? styles.darkMenuPanel : styles.lightMenuPanel]}>
          {/* Header */}
          <View style={[styles.header, styles.gradientHeader]}>
            <Text style={styles.headerTitle}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuContent}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleItemClick(item.id)}
                style={[styles.menuItem, isDark ? styles.darkMenuItem : styles.lightMenuItem]}
              >
                <View style={[styles.iconContainer, isDark ? styles.darkIconContainer : styles.lightIconContainer]}>
                  <Icon name={item.icon} size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemLabel, isDark ? styles.darkText : styles.lightText]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.menuItemDescription, isDark ? styles.darkSecondaryText : styles.lightSecondaryText]}>
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Settings Section */}
          <View style={[styles.settingsSection, isDark ? styles.darkBorder : styles.lightBorder]}>
            <TouchableOpacity
              onPress={() => handleItemClick('settings')}
              style={[styles.menuItem, isDark ? styles.darkMenuItem : styles.lightMenuItem]}
            >
              <View style={[styles.iconContainer, isDark ? styles.darkIconContainer : styles.lightIconContainer]}>
                <Icon name="settings" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemLabel, isDark ? styles.darkText : styles.lightText]}>
                  Settings
                </Text>
                <Text style={[styles.menuItemDescription, isDark ? styles.darkSecondaryText : styles.lightSecondaryText]}>
                  App preferences and theme
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={[styles.footer, isDark ? styles.darkFooter : styles.lightFooter]}>
            <Text style={[styles.footerText, isDark ? styles.darkSecondaryText : styles.lightSecondaryText]}>
              Expense Tracker v2.0
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuPanel: {
    width: 320,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  lightMenuPanel: {
    backgroundColor: '#ffffff',
  },
  darkMenuPanel: {
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#3b82f6',
  },
  gradientHeader: {
    backgroundColor: '#3b82f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuContent: {
    flex: 1,
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  lightMenuItem: {
    backgroundColor: 'transparent',
  },
  darkMenuItem: {
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  lightIconContainer: {
    backgroundColor: '#f3f4f6',
  },
  darkIconContainer: {
    backgroundColor: '#1f2937',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 12,
  },
  settingsSection: {
    borderTopWidth: 1,
  },
  lightBorder: {
    borderTopColor: '#e5e7eb',
  },
  darkBorder: {
    borderTopColor: '#374151',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  lightFooter: {
    backgroundColor: '#f9fafb',
  },
  darkFooter: {
    backgroundColor: '#1f2937',
  },
  footerText: {
    fontSize: 12,
  },
  lightText: {
    color: '#111827',
  },
  darkText: {
    color: '#ffffff',
  },
  lightSecondaryText: {
    color: '#6b7280',
  },
  darkSecondaryText: {
    color: '#9ca3af',
  },
});

export default Menu;