import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, TextInput, Switch, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Animated, { FadeOutDown, Layout } from 'react-native-reanimated';
import { useTaskStore } from '../../store/useTaskStore';
import { getTodayString } from '../../utils/dateUtils';
import { Task, addTask } from '../../db/queries';

export default function TodayScreen() {
  const { tasks, completeTask, clearTasks, loadTasks } = useTaskStore();
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'routine' | 'todo' | 'goal'>('routine');
  const [periodValue, setPeriodValue] = useState('1');
  const [periodUnit, setPeriodUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [routineType, setRoutineType] = useState<'relative' | 'fixed'>('relative');
  const [isImportant, setIsImportant] = useState(false);

  const todayTasks = useMemo(() => {
    const todayStr = getTodayString();
    return tasks.filter(t => t.nextDueDate && t.nextDueDate <= todayStr && t.lastDoneDate !== todayStr);
  }, [tasks]);

  const handleComplete = (task: Task) => {
    completeTask(task);
  };

  const handleAddTask = () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    // 할 일이나 목표는 시작 시점에 nextDue를 null로 하거나 선택하게 할 수 있습니다. 일단 null로 배정합니다.
    const nextDue = type === 'routine' ? getTodayString() : null;
    
    addTask(
      title.trim(),
      type,
      nextDue,
      type === 'routine' ? parseInt(periodValue) || 1 : null,
      type === 'routine' ? periodUnit : null,
      isImportant ? 1 : 0,
      type === 'routine' ? routineType : 'relative'
    );
    loadTasks();
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setType('routine');
    setPeriodValue('1');
    setPeriodUnit('days');
    setRoutineType('relative');
    setIsImportant(false);
  };

  const confirmClearTasks = () => {
    Alert.alert(
      '데이터 초기화',
      '테스트용 데이터를 포함한 모든 할 일을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => clearTasks() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>오늘의 타임라인 & 루틴</Text>
            <Text style={styles.subtitle}>남은 할 일: {todayTasks.length}개</Text>
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={confirmClearTasks}>
            <Text style={styles.clearBtnText}>전체 삭제</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {todayTasks.length === 0 ? (
            <Text style={styles.emptyText}>오늘의 모든 일정을 완료했습니다! 🎉</Text>
          ) : (
            todayTasks.map((task) => (
              <Animated.View
                key={task.id}
                layout={Layout.springify()}
                exiting={FadeOutDown}
                style={[styles.card, task.isImportant === 1 && styles.cardImportant]}
              >
                <View style={styles.cardContent}>
                  {task.isImportant === 1 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>중요</Text>
                    </View>
                  )}
                  <Text style={styles.cardTitle}>{task.title}</Text>
                  {task.type === 'routine' && (
                    <Text style={styles.taskType}>주기: {task.periodValue} {task.periodUnit}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => handleComplete(task)}
                >
                  <Text style={styles.checkboxText}>완료</Text>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 할 일 추가</Text>
            
            <TextInput
              style={styles.input}
              placeholder="할 일 제목"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>카테고리</Text>
            <View style={styles.row}>
              {['routine', 'todo', 'goal'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, type === t && styles.chipActive]}
                  onPress={() => setType(t as any)}
                >
                  <Text style={[styles.chipText, type === t && styles.chipTextActive]}>
                    {t === 'routine' ? '루틴' : t === 'todo' ? '할 일' : '목표'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {type === 'routine' && (
              <>
                <Text style={styles.label}>반복 기준 (완료일 기준 vs 고정 날짜)</Text>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.chip, routineType === 'relative' && styles.chipActive]}
                    onPress={() => setRoutineType('relative')}
                  >
                    <Text style={[styles.chipText, routineType === 'relative' && styles.chipTextActive]}>완료일 기준 (배터리/염색 등)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, routineType === 'fixed' && styles.chipActive]}
                    onPress={() => setRoutineType('fixed')}
                  >
                    <Text style={[styles.chipText, routineType === 'fixed' && styles.chipTextActive]}>고정 날짜 (월세 등)</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>반복 주기</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 10, marginBottom: 0 }]}
                    keyboardType="numeric"
                    value={periodValue}
                    onChangeText={setPeriodValue}
                  />
                  {['days', 'weeks', 'months'].map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.chip, periodUnit === u && styles.chipActive]}
                      onPress={() => setPeriodUnit(u as any)}
                    >
                      <Text style={[styles.chipText, periodUnit === u && styles.chipTextActive]}>
                        {u === 'days' ? '일' : u === 'weeks' ? '주' : '개월'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={[styles.row, { justifyContent: 'space-between', marginTop: 20 }]}>
              <Text style={styles.label}>중요 표시 (빨간 뱃지)</Text>
              <Switch value={isImportant} onValueChange={setIsImportant} />
            </View>

            <View style={[styles.row, { marginTop: 30 }]}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => { setModalVisible(false); resetForm(); }}>
                <Text style={styles.btnCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSubmit]} onPress={handleAddTask}>
                <Text style={styles.btnSubmitText}>추가하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scroll: { padding: 20 },
  header: { marginBottom: 20, marginTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  clearBtn: { backgroundColor: '#FF3B30', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  clearBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  list: { gap: 12 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardImportant: { borderLeftWidth: 4, borderLeftColor: '#FF3B30' },
  cardContent: { flex: 1 },
  badge: { backgroundColor: '#FF3B30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 4 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  cardTitle: { fontSize: 16, color: '#333', fontWeight: '500' },
  taskType: { fontSize: 12, color: '#888', marginTop: 4 },
  checkbox: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  checkboxText: { color: 'white', fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, elevation: 5 },
  fabText: { fontSize: 32, color: 'white', lineHeight: 34 },
  
  /* Modal Styles */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#f0f0f0', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  chipActive: { backgroundColor: '#007AFF' },
  chipText: { color: '#666', fontWeight: '500' },
  chipTextActive: { color: 'white' },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnCancel: { backgroundColor: '#f0f0f0', marginRight: 10 },
  btnCancelText: { color: '#666', fontWeight: 'bold', fontSize: 16 },
  btnSubmit: { backgroundColor: '#007AFF' },
  btnSubmitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
