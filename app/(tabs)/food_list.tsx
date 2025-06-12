import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FoodsScreen() {
  const [foods, setFoods] = useState(['Eggs', 'Pasta', 'Salad', 'Chicken', 'Soup', 'Rice', 'Fish']);
  const [newFood, setNewFood] = useState('');

  const addFood = () => {
    if (newFood.trim() && !foods.includes(newFood.trim())) {
      setFoods([...foods, newFood.trim()]);
      setNewFood('');
    }
  };

  const removeFood = (food: string) => {
    setFoods(foods.filter(f => f !== food));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Foods List</Text>
      <FlatList
        data={foods}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <View style={styles.foodRow}>
            <Text style={styles.foodItem}>{item}</Text>
            <TouchableOpacity onPress={() => removeFood(item)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        style={styles.list}
      />
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={newFood}
          onChangeText={setNewFood}
          placeholder="Add new food"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity onPress={addFood} style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 18, color: '#fafafa' },
  list: { marginBottom: 16 },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
    elevation: 1,
  },
  foodItem: { fontSize: 17, color: '#222', flex: 1 },
  removeBtn: {
    marginLeft: 12,
    backgroundColor: '#ff5252',
    borderRadius: 16,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  removeBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  addRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 15,
    color: '#222',
  },
  addBtn: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
