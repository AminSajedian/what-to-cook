import { useStore } from "@/contexts/StoreContext";
import { MaterialIcons } from '@expo/vector-icons'; // Add this import for trash icon
import React, { useState } from "react";
import {
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme, // Add useColorScheme for theme
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

export default function FoodsScreen() {
  const colorScheme = useColorScheme(); // Get current theme
  const { foodsState, setFoods, initialized, setWeekDays, setFieldLabels } = useStore();
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

  // Handler for drag-and-drop reorder
  const onDragEnd = ({ data }: { data: string[] }) => {
    setFoods(data); // Update context with new order
  };

  // Wait for context to be initialized before rendering
  if (!initialized) {
    return <View style={{ flex: 1, backgroundColor: "#111" }} />;
  }

  // Theme-aware colors
  const backgroundColor = colorScheme === "dark" ? "#111" : "#f2f2f7";
  const cardBg = colorScheme === "dark" ? "#18181b" : "#fff";
  const cardBorder = colorScheme === "dark" ? "#23232a" : "#e5e5ea";
  const textColor = colorScheme === "dark" ? "#fafafa" : "#222";
  const inputBg = colorScheme === "dark" ? "#23232a" : "#fff";
  const inputBorder = colorScheme === "dark" ? "#333" : "#e0e0e0";

  return (
    <View style={[styles.container, { backgroundColor }]}> {/* Theme background */}
      <DraggableFlatList
        data={foodsState.map(item => String(item))}
        keyExtractor={(item) => item}
        renderItem={({ item, drag, isActive }) => (
          <View style={[
            styles.foodRow,
            { backgroundColor: cardBg, borderColor: cardBorder, shadowColor: colorScheme === "dark" ? "#000" : "#000" },
            isActive && { opacity: 0.7 },
          ]}>
            <TouchableOpacity
              onLongPress={drag}
              delayLongPress={150}
              style={{ marginRight: 10 }}
            >
              <Text style={{ fontSize: 20, color: colorScheme === "dark" ? '#aaa' : '#888' }}>≡</Text>
            </TouchableOpacity>
            <Text style={[styles.foodItem, { color: textColor }]}>{item}</Text>
            <TouchableOpacity
              onPress={() => removeFood(item)}
              style={[styles.removeBtn, { backgroundColor: '#ff5252' }]}
            >
              {/* Use MaterialIcons trash icon instead of ✕ */}
              <MaterialIcons name="delete" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onDragEnd={onDragEnd}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <View style={[
        styles.addRow,
        {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor,
          padding: 20,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: cardBorder,
        },
      ]}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: inputBg, borderColor: inputBorder, color: textColor },
          ]}
          value={newFood}
          onChangeText={setNewFood}
          placeholder="Add new food"
          placeholderTextColor={colorScheme === "dark" ? "#888" : "#aaa"}
        />
        {/* Inline: Add theme-aware background color to the Add button */}
        <TouchableOpacity
          onPress={addFood}
          style={[
            styles.addBtn,
            { backgroundColor: colorScheme === 'dark' ? '#007AFF' : '#007AFF' }, // Use a strong blue for both themes
          ]}
        >
          <Text style={[styles.addBtnText, { color: '#fff' }]}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
  },
  list: { marginBottom: 16 },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
    elevation: 1,
    minHeight: 48,
  },
  foodItem: { fontSize: 17, flex: 1 },
  removeBtn: {
    marginLeft: 12,
    borderRadius: 16,
    padding: 0,
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    display: "flex",
  },
  removeBtnText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    textAlignVertical: "center",
  },
  addRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: "#222",
  },
  addBtn: {
    marginLeft: 10,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  addBtnText: { fontWeight: "bold", fontSize: 16 },
});
