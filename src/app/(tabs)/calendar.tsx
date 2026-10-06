import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTaskStore } from '../../store/useTaskStore';
import { getTodayString } from '../../utils/dateUtils';

export default function CalendarScreen() {
  const { tasks } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    
    tasks.forEach(task => {
      if (!task.nextDueDate) return;
      
      if (!marks[task.nextDueDate]) {
        marks[task.nextDueDate] = { dots: [] };
      }
      
      let dotColor = '#007AFF'; // Blue for goal/appointment
      if (task.type === 'routine') dotColor = '#34C759'; // Green
      if (task.isImportant) dotColor = '#FF3B30'; // Red for important

      marks[task.nextDueDate].dots.push({ key: task.id.toString(), color: dotColor });
    });
    
    if (marks[selectedDate]) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: '#E5F1FF', selectedTextColor: '#007AFF' };
    } else {
      marks[selectedDate] = { selected: true, selectedColor: '#E5F1FF', selectedTextColor: '#007AFF' };
    }

    return marks;
  }, [tasks, selectedDate]);

  const selectedTasks = useMemo(() => {
    return tasks.filter(t => t.nextDueDate === selectedDate);
  }, [tasks, selectedDate]);

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        markingType={'multi-dot'}
        markedDates={markedDates}
        theme={{
          todayTextColor: '#007AFF',
          arrowColor: '#007AFF',
        }}
      />
      <ScrollView contentContainerStyle={styles.detailContainer}>
        <Text style={styles.detailTitle}>{selectedDate} 일정 상세</Text>
        {selectedTasks.length === 0 ? (
          <Text style={styles.emptyText}>이 날짜에 계획된 일정이 없습니다.</Text>
        ) : (
          selectedTasks.map(task => (
            <View key={task.id} style={styles.card}>
              <View>
                <Text style={styles.cardTitle}>{task.title}</Text>
                <Text style={styles.taskType}>
                  {task.type === 'routine' ? '루틴' : task.type === 'todo' ? '할 일' : '목표'}
                </Text>
              </View>
              {task.isImportant === 1 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>중요</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  detailContainer: { padding: 20 },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, color: '#333', fontWeight: '500' },
  taskType: { fontSize: 14, color: '#888', marginTop: 4 },
  badge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 20 },
});
