import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
};

export default function ConfirmModal({
  visible,
  title = 'Are you sure?',
  message = '',
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: Props) {
  const theme = useColorScheme() ?? 'light';
  const tint = Colors[theme].tint;
  const destructive = '#d11a2a';
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <ThemedView style={[styles.card, { shadowColor: tint }]}>
          <View style={styles.headerRow}>
            <MaterialIcons name="warning" size={24} color={tint} />
            <ThemedText type="title" style={styles.title}>
              {title}
            </ThemedText>
          </View>

          {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}

          <View style={styles.rowActions}>
            <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancel]}>
              <ThemedText style={styles.cancelText}>{cancelText}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.button, styles.confirm, { backgroundColor: destructive }]}
            >
              <ThemedText style={styles.confirmText}>{confirmText}</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 540,
    borderRadius: 14,
    padding: 18,
    alignItems: 'stretch',
    // subtle elevated card
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  title: {
    marginBottom: 0,
    textAlign: 'left',
    flex: 1,
  },
  message: {
    marginBottom: 18,
    textAlign: 'left',
    fontSize: 15,
    color: '#6b6b6b',
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 96,
    alignItems: 'center',
  },
  cancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  confirm: {
    // color applied inline (destructive)
  },
  cancelText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },
});
