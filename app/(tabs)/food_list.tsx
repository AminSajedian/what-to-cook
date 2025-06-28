import { useStore } from "@/contexts/StoreContext";
import { MaterialIcons } from "@expo/vector-icons"; // Add this import for trash icon
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
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
  const { foods, updateFoods, isInitialized, updateWeekDays, updateMeals } =
    useStore();
  const [newFood, setNewFood] = useState("");
  // Local state for editing food items
  const [foodsList, setFoodsList] = useState<string[]>(foods);

  // Sync local state with context when context changes
  React.useEffect(() => {
    setFoodsList(foods);
  }, [foods]);

  // Add food to local state
  const addFood = () => {
    const trimmed = newFood.trim();
    if (trimmed && !foodsList.includes(trimmed)) {
      setFoodsList([...foodsList, trimmed]);
      updateFoods([...foodsList, trimmed]); // Update context immediately
      setNewFood("");
    }
  };

  // Remove food from local state
  const removeFood = (idx: number) => {
    setFoodsList(foodsList.filter((_, i) => i !== idx));
    updateFoods(foodsList.filter((_, i) => i !== idx)); // Update context immediately
  };

  // Add refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Refresh handler: reload context state from AsyncStorage
  const onRefresh = async () => {
    setRefreshing(true);
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    const [days, foodsData, mealsData] = await Promise.all([
      AsyncStorage.getItem("weekDays"),
      AsyncStorage.getItem("foods"),
      AsyncStorage.getItem("meals"),
    ]);
    if (days) updateWeekDays(JSON.parse(days));
    if (foodsData) updateFoods(JSON.parse(foodsData));
    if (mealsData) updateMeals(JSON.parse(mealsData));
    setRefreshing(false);
  };

  // Handler for drag-and-drop reorder
  const onDragEnd = ({ data }: { data: string[] }) => {
    setFoodsList(data);
    updateFoods(data); // Update context immediately
  };

  // Save foods to context
  // const saveFoods = () => {
  //   console.log("🚀 ~ saveFoods ~ foodsList:", foodsList)
  //   updateFoods(foodsList);
  // };

  // Wait for context to be initialized before rendering
  if (!isInitialized) {
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 50}
    >
      <View style={[styles.container, { backgroundColor }]}>
        {" "}
        {/* Theme background */}
        <Text style={[styles.title, { color: textColor, marginBottom: 8 }]}>
          Edit Foods
        </Text>
        <DraggableFlatList
          data={foodsList}
          keyExtractor={(item) => item}
          onDragEnd={onDragEnd}
          renderItem={({ item, drag, isActive }) => {
            const index = foodsList.indexOf(item);
            return (
              <View
                style={[
                  styles.foodRow,
                  {
                    backgroundColor: cardBg,
                    borderColor: cardBorder,
                    shadowColor: colorScheme === "dark" ? "#000" : "#000",
                  },
                  isActive && { opacity: 0.7 },
                ]}
              >
                <TouchableOpacity
                  onLongPress={drag}
                  delayLongPress={150}
                  style={{ marginRight: 10 }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: colorScheme === "dark" ? "#aaa" : "#888",
                    }}
                  >
                    ≡
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={[
                    styles.foodItem,
                    {
                      color: textColor,
                      backgroundColor: "transparent",
                      borderColor: "transparent",
                      fontSize: 17,
                    },
                  ]}
                  value={item}
                  onChangeText={(v) => {
                    const arr = [...foodsList];
                    arr[index] = v;
                    setFoodsList(arr);
                    updateFoods(arr); // Update context immediately
                  }}
                  placeholderTextColor={
                    colorScheme === "dark" ? "#888" : "#aaa"
                  }
                />
                <TouchableOpacity
                  onPress={() => removeFood(index)}
                  style={[styles.removeBtn, { backgroundColor: "#ff5252" }]}
                >
                  <MaterialIcons name="delete" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            );
          }}
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 80 }} // Leave space for add row
        />
        {/* Move the add food section outside the scrollable list and absolutely position it at the bottom */}
        <View
          style={[
            styles.addRowFixed,
            {
              backgroundColor,
              borderTopWidth: 1,
              borderTopColor: cardBorder,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: inputBg,
                borderColor: inputBorder,
                color: textColor,
              },
            ]}
            value={newFood}
            onChangeText={setNewFood}
            placeholder="Add new food"
            placeholderTextColor={colorScheme === "dark" ? "#888" : "#aaa"}
          />
          <TouchableOpacity
            onPress={addFood}
            style={[
              styles.addBtn,
              {
                backgroundColor: colorScheme === "dark" ? "#007AFF" : "#007AFF",
              },
            ]}
          >
            <Text style={[styles.addBtnText, { color: "#fff" }]}>Add</Text>
          </TouchableOpacity>
        </View>
        {/* <TouchableOpacity
          style={{ backgroundColor: '#007AFF', borderRadius: 8, paddingVertical: 14, marginTop: 18, marginBottom: 18 }}
          onPress={saveFoods}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17, textAlign: 'center' }}>SAVE FOODS</Text>
        </TouchableOpacity> */}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingBottom: 0 }, // Remove bottom padding, handled by addRowFixed
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
  addRow: { flexDirection: "row", alignItems: "center", marginTop: 12 }, // keep for reference, not used
  addRowFixed: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 12,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    // backgroundColor, borderTopWidth, borderTopColor set inline for theme
  },
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
