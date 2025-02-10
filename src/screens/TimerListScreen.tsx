import { 
  StyleSheet, 
  Text, 
  View, 
  SectionList, 
  TouchableOpacity, 
  Modal, 
  Button
} from 'react-native';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TimerProgress from '../components/TimerProgress';

interface Timer {
  id: string;
  name: string;
  duration: number;
  remainingTime: number;
  category: string;
  status: 'running' | 'paused' | 'completed';
  createdAt: string;
}

interface Group {
  title: string;
  data: Timer[];
}

const TimerListScreen = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [completedVisible, setCompletedVisible] = useState(false);
  const [completedTimer, setCompletedTimer] = useState<Timer | null>(null);
  const intervalsRef = useRef<{[key: string]: NodeJS.Timeout}>({});

  // Load timers from storage
  const loadTimers = async () => {
    try {
      const storedTimers = await AsyncStorage.getItem('@timers');
      const parsedTimers: Timer[] = storedTimers ? JSON.parse(storedTimers) : [];
      setTimers(parsedTimers);
      groupTimers(parsedTimers);
    } catch (error) {
      console.error('Error loading timers:', error);
    }
  };

  // Group timers by category
  const groupTimers = (timerList: Timer[]) => {
    const grouped = timerList.reduce((acc: {[key: string]: Timer[]}, timer) => {
      acc[timer.category] = acc[timer.category] || [];
      acc[timer.category].push(timer);
      return acc;
    }, {});
    
    setGroups(Object.entries(grouped).map(([title, data]) => ({
      title,
      data,
    })));
  };

  // Timer countdown logic
  useEffect(() => {
    const runningTimers = timers.filter(t => t.status === 'running');
    
    runningTimers.forEach(timer => {
      if (!intervalsRef.current[timer.id]) {
        intervalsRef.current[timer.id] = setInterval(() => {
          setTimers(prev => prev.map(t => {
            if (t.id === timer.id && t.status === 'running') {
              const newTime = t.remainingTime - 1;
              
              if (newTime <= 0) {
                clearInterval(intervalsRef.current[timer.id]);
                delete intervalsRef.current[timer.id];
                setCompletedTimer(t);
                setCompletedVisible(true);
                return {...t, status: 'completed', remainingTime: 0};
              }
              return {...t, remainingTime: newTime};
            }
            return t;
          }));
        }, 1000);
      }
    });

    // Cleanup paused timers
    const pausedTimers = timers.filter(t => t.status !== 'running');
    pausedTimers.forEach(timer => {
      if (intervalsRef.current[timer.id]) {
        clearInterval(intervalsRef.current[timer.id]);
        delete intervalsRef.current[timer.id];
      }
    });

    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
      intervalsRef.current = {};
    };
  }, [timers]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleTimerControl = async (timerId: string, action: 'start' | 'pause' | 'reset') => {
    const updatedTimers = timers.map(timer => {
      if (timer.id === timerId) {
        const newState = {...timer};
        switch(action) {
          case 'start':
            newState.status = 'running';
            break;
          case 'pause':
            newState.status = 'paused';
            break;
          case 'reset':
            newState.status = 'paused';
            newState.remainingTime = timer.duration;
            break;
        }
        return newState;
      }
      return timer;
    });

    await saveTimers(updatedTimers);
  };

  // Bulk actions
  const handleBulkAction = async (category: string, action: 'start' | 'pause' | 'reset') => {
    const updatedTimers = timers.map(timer => {
      if (timer.category === category) {
        const newState = {...timer};
        switch(action) {
          case 'start':
            newState.status = 'running';
            break;
          case 'pause':
            newState.status = 'paused';
            break;
          case 'reset':
            newState.status = 'paused';
            newState.remainingTime = timer.duration;
            break;
        }
        return newState;
      }
      return timer;
    });

    await saveTimers(updatedTimers);
  };

  const saveTimers = async (updatedTimers: Timer[]) => {
    try {
      await AsyncStorage.setItem('@timers', JSON.stringify(updatedTimers));
      setTimers(updatedTimers);
      groupTimers(updatedTimers);
    } catch (error) {
      console.error('Error saving timers:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTimers();
    }, [])
  );
  return (
    <View style={styles.container}>
      <SectionList
        sections={groups}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <TouchableOpacity 
            style={styles.categoryHeader}
            onPress={() => toggleCategory(title)}
          >
            <View style={styles.categoryTitle}>
              <Text style={styles.categoryText}>{title}</Text>
              <Icon
                name={expandedCategories[title] ? 'chevron-down' : 'chevron-forward'}
                size={24}
              />
            </View>
            <View style={styles.bulkActions}>
              <TouchableOpacity onPress={() => handleBulkAction(title, 'start')}>
                <Icon name="play" size={20} style={styles.bulkIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleBulkAction(title, 'pause')}>
                <Icon name="pause" size={20} style={styles.bulkIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleBulkAction(title, 'reset')}>
                <Icon name="refresh" size={20} style={styles.bulkIcon} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        renderItem={({ item }) => (
          expandedCategories[item.category] ? (
            <View style={styles.timerCard}>
              <View style={styles.timerInfo}>
                <Text style={styles.timerName}>{item.name}</Text>
                <Text style={styles.timerStatus}>
                  {item.status} - {item.remainingTime}s
                </Text>
                <TimerProgress 
                  progress={item.remainingTime / item.duration}
                />
              </View>
              <View style={styles.timerControls}>
                <TouchableOpacity onPress={() => handleTimerControl(item.id, 'start')}>
                  <Icon name="play" size={28} style={styles.controlIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleTimerControl(item.id, 'pause')}>
                  <Icon name="pause" size={28} style={styles.controlIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleTimerControl(item.id, 'reset')}>
                  <Icon name="refresh" size={28} style={styles.controlIcon} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      />

      <Modal
        visible={completedVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Timer Completed!</Text>
            <Text style={styles.modalSubText}>{completedTimer?.name}</Text>
            <Button
              title="OK"
              onPress={() => setCompletedVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  bulkActions: {
    flexDirection: 'row',
    gap: 15,
  },
  bulkIcon: {
    color: '#007AFF',
  },
  timerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    margin: 5,
    borderRadius: 10,
    elevation: 2,
  },
  timerInfo: {
    flex: 1,
  },
  timerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  timerStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  controlIcon: {
    color: '#007AFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubText: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default TimerListScreen;