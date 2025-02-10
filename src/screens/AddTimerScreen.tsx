import { Button, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddTimerScreen = () => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [success, setSuccess] = useState("")

  const handleSave = async () => {
    if (!name.trim() || !category.trim() || !duration.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    const durationNumber = Number(duration);
    if (isNaN(durationNumber) || durationNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid duration (positive number)');
      return;
    }

    // Create new timer object
    const newTimer = {
      id: Date.now().toString(),
      name: name.trim(),
      duration: durationNumber,
      remainingTime: durationNumber,
      category: category.trim(),
      status: 'paused',
      createdAt: new Date().toISOString(),
    };

    try {
      // Save to AsyncStorage
      const existingTimers = await AsyncStorage.getItem('@timers');
      const timersArray = existingTimers ? JSON.parse(existingTimers) : [];
      const updatedTimers = [...timersArray, newTimer];
      
      await AsyncStorage.setItem('@timers', JSON.stringify(updatedTimers));
      setDuration("")
      setCategory("")
      setName("")
      setSuccess("Timer added!")
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save timer');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Timer</Text>

      {/* Timer Name Input */}
      <View style={styles.inputContainer}>
        <Icon name="alarm-outline" size={24} style={styles.icon} />
        <TextInput
          placeholder="Timer Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#666"
        />
      </View>

      {/* Duration Input */}
      <View style={styles.inputContainer}>
        <Icon name="time-outline" size={24} style={styles.icon} />
        <TextInput
          placeholder="Duration in seconds"
          value={duration}
          onChangeText={setDuration}
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor="#666"
        />
      </View>

      {/* Category Input */}
      <View style={styles.inputContainer}>
        <Icon name="list-outline" size={24} style={styles.icon} />
        <TextInput
          placeholder="Category (e.g., Workout, Study)"
          value={category}
          onChangeText={setCategory}
          style={styles.input}
          placeholderTextColor="#666"
        />
      </View>
      {success && <Text>{success}</Text>}
      <View style={styles.buttonContainer}>
        <Button
          title="Save Timer"
          onPress={handleSave}
          color="#007AFF"
          disabled={!name || !duration || !category}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  icon: {
    marginRight: 10,
    color: '#666',
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default AddTimerScreen;