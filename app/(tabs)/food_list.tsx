import { useStore } from "@/contexts/StoreContext"; // import useStore
import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function FoodsScreen() {
  const { foodsState, setFoods, initialized, setWeekDays, setFieldLabels } =
    useStore(); // use context
  const [newFood, setNewFood] = useState("");

  // Add food to context
  const addFood = () => {
    const trimmed = newFood.trim();
    if (trimmed && !foodsState.includes(trimmed)) {
      setFoods([...foodsState, trimmed]);
      setNewFood("");
    }
  };

  // Remove food from context
  const removeFood = (food: string) => {
    setFoods(foodsState.filter((f) => f !== food));
  };

  // Add refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Refresh handler: reload context state from AsyncStorage
  const onRefresh = async () => {
    setRefreshing(true);
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    const [days, foods, labels] = await Promise.all([
      AsyncStorage.getItem("weekDays"),
      AsyncStorage.getItem("foods"),
      AsyncStorage.getItem("fieldLabels"),
    ]);
    if (days) setWeekDays(JSON.parse(days));
    if (foods) setFoods(JSON.parse(foods));
    if (labels) setFieldLabels(JSON.parse(labels));
    setRefreshing(false);
  };

  // Wait for context to be initialized before rendering
  if (!initialized) {
    return <View style={{ flex: 1, backgroundColor: "#111" }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Foods List</Text>
      <FlatList
        data={foodsState}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.foodRow}>
            <Text style={styles.foodItem}>{item}</Text>
            <TouchableOpacity
              onPress={() => removeFood(item)}
              style={styles.removeBtn}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
  container: { flex: 1, backgroundColor: "#111", padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#fafafa",
  },
  list: { marginBottom: 16 },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
    elevation: 1,
    minHeight: 48,
  },
  foodItem: { fontSize: 17, color: "#222", flex: 1 },
  removeBtn: {
    marginLeft: 12,
    backgroundColor: "#ff5252",
    borderRadius: 16,
    padding: 0,
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    display: "flex",
  },
  removeBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    textAlignVertical: "center",
  },
  addRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    fontSize: 15,
    color: "#222",
  },
  addBtn: {
    marginLeft: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
