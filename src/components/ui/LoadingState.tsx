import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Spacing } from '../../constants';
import { Skeleton } from './Skeleton';
import { PCard } from './Card';

interface LoadingStateProps {
  variant?: 'list' | 'grid' | 'profile' | 'detail';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ variant = 'list' }) => {
  if (variant === 'profile') {
    return (
      <View style={styles.container}>
        <Skeleton height={200} style={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} />
        <View style={styles.profileHeader}>
          <Skeleton variant="circle" size={100} style={styles.avatar} />
          <Skeleton variant="text" width="60%" height={32} style={{ marginTop: 20 }} />
          <Skeleton variant="text" width="40%" height={20} style={{ marginTop: 8 }} />
        </View>
        <View style={styles.content}>
          <PCard style={{ marginBottom: 20 }}>
            <Skeleton variant="text" width="80%" height={24} style={{ marginBottom: 12 }} />
            <Skeleton variant="text" width="100%" height={16} style={{ marginBottom: 8 }} />
            <Skeleton variant="text" width="90%" height={16} />
          </PCard>
        </View>
      </View>
    );
  }

  if (variant === 'detail') {
    return (
      <View style={styles.container}>
        <Skeleton height={250} />
        <View style={styles.content}>
          <Skeleton variant="text" width="70%" height={32} style={{ marginBottom: 20 }} />
          <View style={styles.row}>
            <Skeleton variant="rect" width="30%" height={40} style={{ marginRight: 12 }} />
            <Skeleton variant="rect" width="30%" height={40} />
          </View>
          <PCard style={{ marginTop: 24 }}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.listItem}>
                <Skeleton variant="text" width="40%" height={16} />
                <Skeleton variant="text" width="50%" height={16} />
              </View>
            ))}
          </PCard>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {[1, 2, 3, 4].map(i => (
        <PCard key={i} style={styles.card}>
          <View style={styles.cardHeader}>
            <Skeleton variant="circle" width={40} height={40} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} style={{ marginBottom: 4 }} />
              <Skeleton variant="text" width="40%" height={14} />
            </View>
          </View>
          <Skeleton height={150} style={{ marginTop: 12, borderRadius: 8 }} />
        </PCard>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: Spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: -50,
    zIndex: 1,
  },
  avatar: {
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  card: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
});
