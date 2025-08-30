import { useStore } from "@/contexts/StoreContext";
// import { MaterialIcons } from "@expo/vector-icons";
import DraggableListItem from "@/components/DraggableListItem";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  // RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const {
    weekDays,
    updateWeekDays,
    updateFoods,
    meals,
    updateMeals,
    isInitialized,
  } = useStore();

  // Local state for editing weekDays and meals
  const [days, setDays] = useState<string[]>(weekDays);
  const [newDay, setNewDay] = useState("");
  const [mealsList, setMealsList] = useState<string[]>(meals);
  const [newMeal, setNewMeal] = useState("");

  // Add debounce refs for saving
  const saveDaysTimeoutRef = useRef<number | null>(null);
  const saveMealsTimeoutRef = useRef<number | null>(null);

  // Sync local state with context when context changes
  // Remove useEffect syncing days from context
  // useEffect(() => {
  //   setDays(weekDays);
  // }, [weekDays]);
  useEffect(() => {
    setMealsList(meals);
  }, [meals]);

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Refresh handler: reload context state from AsyncStorage
  const onRefresh = async () => {
    setRefreshing(true);
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    const [daysData, foodsData, mealsData] = await Promise.all([
      AsyncStorage.getItem("weekDays"),
      AsyncStorage.getItem("foods"),
      AsyncStorage.getItem("meals"),
    ]);
    if (daysData) updateWeekDays(JSON.parse(daysData));
    if (foodsData) updateFoods(JSON.parse(foodsData));
    if (mealsData) updateMeals(JSON.parse(mealsData));
    setRefreshing(false);
  };

  // Add/remove/reorder weekDays
  const addDay = () => {
    const trimmed = newDay.trim();
    if (trimmed && !days.includes(trimmed)) {
      const updatedDays = [...days, trimmed];
      setDays(updatedDays);
      updateWeekDays(updatedDays); // Persist immediately
      setNewDay("");
    }
  };
  const removeDay = (idx: number) => {
    const updatedDays = days.filter((_, i) => i !== idx);
    setDays(updatedDays);
    updateWeekDays(updatedDays); // Persist immediately
  };
  const onDaysDragEnd = ({ data }: { data: string[] }) => {
    setDays(data);
    updateWeekDays(data); // Persist new order immediately
  };

  // Add/remove/reorder meals
  const addMeal = () => {
    const trimmed = newMeal.trim();
    if (trimmed && !mealsList.includes(trimmed)) {
      setMealsList([...mealsList, trimmed]);
      setNewMeal("");
    }
  };
  const removeMeal = (idx: number) => {
    setMealsList(mealsList.filter((_, i) => i !== idx));
  };
  const onMealsDragEnd = ({ data }: { data: string[] }) => {
    setMealsList(data);
  };

  // Theme-aware colors
  const backgroundColor = colorScheme === "dark" ? "#111" : "#f2f2f7";
  const textColor = colorScheme === "dark" ? "#fafafa" : "#222";
  const inputBorder = colorScheme === "dark" ? "#333" : "#ccc";
  const cardBg = colorScheme === "dark" ? "#18181b" : "#fff";
  const bottomTabBarHeight = useBottomTabOverflow(); // Get tab bar height

  if (!isInitialized)
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={{ color: textColor }}>Loading...</Text>
      </View>
    );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 100}
    >
      <View style={[styles.container, { backgroundColor }]}>
        {/* Week Days Section */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text style={[styles.title, { color: textColor }]}>Edit Week Days</Text>
          <TouchableOpacity
            onPress={() => {
              const defaultDays = [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ];
              setDays(defaultDays);
              updateWeekDays(defaultDays);
            }}
            style={{
              marginLeft: 8,
              backgroundColor:
                colorScheme === "dark" ? "#ffd54f" : "#ff9800",
              borderRadius: 8,
              paddingHorizontal: 14,
              paddingVertical: 6,
            }}
            accessibilityLabel="Reset week days to default"
          >
            <Text
              style={{
                color: colorScheme === "dark" ? "#222" : "#fff",
                fontWeight: "bold",
                fontSize: 15,
              }}
            >
              Reset
            </Text>
          </TouchableOpacity>
        </View>
        <DraggableFlatList
          data={days}
          keyExtractor={(d: string, index: number) => `day-${index}`}
          onDragEnd={onDaysDragEnd}
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
                  const arr = [...days];
                  arr[index] = v;
                  setDays(arr);
                }}
                onBlur={() => {
                  if (saveDaysTimeoutRef.current) {
                    clearTimeout(saveDaysTimeoutRef.current);
                  }
                  updateWeekDays(days);
                }}
                onRemove={() => removeDay(index)}
                drag={drag}
                isActive={isActive}
                colorScheme={colorScheme}
                textColor={textColor}
                cardBg={cardBg}
                cardBorder={inputBorder}
                inputPlaceholder="Day name"
                removeIconName="delete"
              />
            );
          }}
          // refreshControl={
          //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          // }
          contentContainerStyle={{
            paddingBottom: 30 + bottomTabBarHeight, // Add tab bar height to bottom padding
          }}
          ListFooterComponent={
            <>
              <View
                style={[
                  styles.row,
                  {
                    backgroundColor: cardBg,
                    borderRadius: 10,
                    marginBottom: 16,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: inputBorder,
                    shadowColor: "#000",
                    elevation: 1,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: "transparent",
                      borderColor: "transparent",
                      color: textColor,
                      fontSize: 17,
                    },
                  ]}
                  value={newDay}
                  onChangeText={setNewDay}
                  placeholder="Add new day"
                  placeholderTextColor={
                    colorScheme === "dark" ? "#888" : "#aaa"
                  }
                />
                <TouchableOpacity
                  onPress={addDay}
                  style={{
                    marginLeft: 8,
                    backgroundColor: "#007AFF",
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Meals Section */}
              <Text style={[styles.title, { color: textColor, marginBottom: 8 }]}>
                Edit Meals
              </Text>
              <DraggableFlatList
                data={mealsList}
                keyExtractor={(item: string, index: number) => `meal-${index}`}
                onDragEnd={onMealsDragEnd}
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
                        const arr = [...mealsList];
                        arr[index] = v;
                        setMealsList(arr);
                      }}
                      onBlur={() => {
                        if (saveMealsTimeoutRef.current) {
                          clearTimeout(saveMealsTimeoutRef.current);
                        }
                        updateMeals(mealsList);
                      }}
                      onRemove={() => removeMeal(index)}
                      drag={drag}
                      isActive={isActive}
                      colorScheme={colorScheme}
                      textColor={textColor}
                      cardBg={cardBg}
                      cardBorder={inputBorder}
                      inputPlaceholder="Meal name"
                      removeIconName="delete"
                    />
                  );
                }}
                scrollEnabled={false}
                contentContainerStyle={{
                  paddingBottom: 35 + bottomTabBarHeight, // Add tab bar height to bottom padding
                }}
                ListFooterComponent={
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <TextInput
                      value={newMeal}
                      onChangeText={setNewMeal}
                      placeholder="Add meal (e.g. Snack)"
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: inputBorder,
                        borderRadius: 8,
                        padding: 8,
                        fontSize: 15,
                        color: textColor,
                        backgroundColor: cardBg,
                      }}
                      placeholderTextColor={colorScheme === "dark" ? "#888" : "#aaa"}
                    />
                    <TouchableOpacity
                      onPress={addMeal}
                      style={{
                        marginLeft: 8,
                        backgroundColor: "#007AFF",
                        borderRadius: 8,
                        padding: 10,
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>Add</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            </>
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  title: { fontWeight: "bold", fontSize: 18, marginVertical: 12 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
  },
  removeBtn: { fontSize: 18, paddingHorizontal: 8 },
  label: { width: 90, fontWeight: "500", fontSize: 15 },
});