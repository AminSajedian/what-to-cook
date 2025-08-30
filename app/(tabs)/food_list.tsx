import { useStore } from "@/contexts/StoreContext";
// import { MaterialIcons } from "@expo/vector-icons"; // Add this import for trash icon
import DraggableListItem from "@/components/DraggableListItem";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  // RefreshControl,
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

  // Add debounce ref for saving
  const saveTimeoutRef = useRef<number | null>(null);

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
    const newList = foodsList.filter((_, i) => i !== idx);
    setFoodsList(newList);
    updateFoods(newList); // Immediate update for removal
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
    updateFoods(data); // Immediate update for reorder
  };

  // Move hook call to top-level, before any conditional logic
  const bottomTabOverflow = useBottomTabOverflow(); // Get tab bar height

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
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 130}
    >
      <View style={[styles.container, { backgroundColor }]}>
        {/* Theme background */}
        {/* <Text style={[styles.title, { color: textColor, marginBottom: 8 }]}>
          Edit Foods
        </Text> */}
        {/* Fixed add food section at the top */}
        <View
          style={[
            styles.addRowFixed,
            {
              backgroundColor,
              borderBottomWidth: 1,
              borderBottomColor: cardBorder,
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
        <DraggableFlatList
          data={foodsList}
          keyExtractor={(item: string, index: number) => `food-${index}`}
          onDragEnd={onDragEnd}
          renderItem={({
            item,
            drag,
            isActive,
            getIndex,
          }: {
            item: string;
            drag: () => void;
            isActive: boolean;
            getIndex: () => number | undefined;
          }) => {
            const index = getIndex() ?? 0;
            return (
              <DraggableListItem
                value={item}
                onChangeText={(v) => {
                  const arr = [...foodsList];
                  arr[index] = v;
                  setFoodsList(arr);
                  // Remove debounced save - only save on blur
                }}
                onBlur={() => {
                  // Save immediately when user finishes editing
                  if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current);
                  }
                  updateFoods(foodsList);
                }}
                onRemove={() => removeFood(index)}
                drag={drag}
                isActive={isActive}
                colorScheme={colorScheme}
                textColor={textColor}
                cardBg={cardBg}
                cardBorder={cardBorder}
                inputPlaceholder="Food name"
                removeIconName="delete"
              />
            );
          }}
          style={styles.list}
          contentContainerStyle={{
            paddingBottom: 60 + bottomTabOverflow, // Add tab bar height to bottom padding
          }}
          // refreshControl={
          //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          // }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15 },
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
  addRow: { flexDirection: "row", alignItems: "center" }, // keep for reference, not used
  addRowFixed: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: -20, // Extend to container edges
    marginBottom: 12, // Add space between add section and list
    // marginTop: 12,
    // backgroundColor, borderBottomWidth, borderBottomColor set inline for theme
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