import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, SectionList } from 'react-native';
import { useTaskStore } from '../../store/useTaskStore';
import { getDDayString, isPastDue } from '../../utils/dateUtils';
import { Task } from '../../db/queries';

export default function VaultScreen() {
  const { tasks } = useTaskStore();

  const sections = useMemo(() => {
    const routines = tasks.filter(t => t.type === 'routine');
    // 할 일 리스트는 중요도(isImportant) 기준으로 내림차순 정렬
    const todos = tasks.filter(t => t.type === 'todo').sort((a, b) => b.isImportant - a.isImportant);
    const goals = tasks.filter(t => t.type === 'goal');

    return [
      { title: '주기적 관리', data: routines },
      { title: `할 일 리스트 (${todos.length})`, data: todos },
      { title: '장기 목표', data: goals },
    ].filter(section => section.data.length > 0 || section.title.includes('할 일'));
  }, [tasks]);

  const renderItem = ({ item }: { item: Task }) => {
    const pastDue = isPastDue(item.nextDueDate);
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.type === 'routine' && (
            <Text style={styles.taskType}>주기: {item.periodValue} {item.periodUnit}</Text>
          )}
        </View>
        {item.nextDueDate && (
          <Text style={[styles.dday, pastDue && styles.ddayPastDue]}>
            {getDDayString(item.nextDueDate)}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  list: { padding: 20 },
  sectionHeader: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 10,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: { fontSize: 16, color: '#333', fontWeight: '500' },
  taskType: { fontSize: 12, color: '#888', marginTop: 4 },
  dday: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  ddayPastDue: {
    color: '#FF3B30',
  },
});
