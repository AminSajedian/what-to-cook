import { useStore } from "@/contexts/StoreContext";
// import type { DayPlan } from "@/types/index"; // Import DayPlan
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme, // Add useColorScheme
} from "react-native";

type PlanField = "notes" | string; // Allow dynamic meal fields

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const {
    // weekDays,
    updateWeekDays,
    foods,
    updateFoods,
    meals,
    updateMeals,
    isInitialized,
    plan,
    updatePlan,
  } = useStore();

  // Use plan from context, fallback to empty array if not initialized
  const planData = plan ?? [];

  // Modal state for food selection
  const [foodSelectorVisible, setFoodSelectorVisible] = useState(false);
  const [foodSelectorDayIdx, setFoodSelectorDayIdx] = useState<number | null>(
    null
  );
  const [foodSelectorField, setFoodSelectorField] = useState<PlanField | null>(
    null
  );

  // Open modal for a specific field
  const openFoodSelector = (dayIdx: number, field: PlanField) => {
    if (field === "notes") return;
    setFoodSelectorDayIdx(dayIdx);
    setFoodSelectorField(field);
    setFoodSelectorVisible(true);
  };

  // Select a food from modal
  const selectFood = (food: string) => {
    if (
      foodSelectorDayIdx !== null &&
      foodSelectorField &&
      foodSelectorField !== "notes"
    ) {
      // console.log("🚀 ~ selectFood ~ foodSelectorDayIdx:", foodSelectorDayIdx)
      // console.log("🚀 ~ selectFood ~ foodSelectorField:", foodSelectorField)
      // console.log("🚀 ~ selectFood ~ food:", food)
      handleUpdatePlan(foodSelectorDayIdx, foodSelectorField, food);
    }
    setFoodSelectorVisible(false);
    setFoodSelectorDayIdx(null);
    setFoodSelectorField(null);
  };

  // Update plan and persist to context
  const handleUpdatePlan = (index: number, field: PlanField, value: string) => {
    if (!planData || !updatePlan) return;
    const newPlan = [...planData];
    newPlan[index] = { ...newPlan[index], [field]: value };
    // console.log("🚀 ~ handleUpdatePlan ~ newPlan:", newPlan)
    updatePlan(newPlan);
  };

  // Add refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Refresh handler: reload context state from AsyncStorage
  const onRefresh = async () => {
    setRefreshing(true);
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    const [days, foodsData, mealsData, planDataRaw] = await Promise.all([
      AsyncStorage.getItem("weekDays"),
      AsyncStorage.getItem("foods"),
      AsyncStorage.getItem("meals"),
      AsyncStorage.getItem("plan"),
    ]);
    if (days) updateWeekDays(JSON.parse(days));
    if (foodsData) updateFoods(JSON.parse(foodsData));
    if (mealsData) updateMeals(JSON.parse(mealsData));
    if (planDataRaw && updatePlan) updatePlan(JSON.parse(planDataRaw));
    setRefreshing(false);
  };

  // Theme-aware colors
  const backgroundColor = colorScheme === "dark" ? "#111" : "#f2f2f7";
  const textColor = colorScheme === "dark" ? "#fafafa" : "#222";
  const cardBg = colorScheme === "dark" ? "#18181b" : "#fff";
  const cardBorder = colorScheme === "dark" ? "#23232a" : "#e5e5ea";
  const labelColor = colorScheme === "dark" ? "#bdbdbd" : "#444";
  const inputBg = colorScheme === "dark" ? "#23232a" : "#f7faff";
  const inputBorder = colorScheme === "dark" ? "#333" : "#d1d1d6";
  const selectedBg = colorScheme === "dark" ? "#232f3e" : "#e6f0fa";
  const selectedText = colorScheme === "dark" ? "#7cc4fa" : "#007AFF";

  // Wait for context to be initialized before rendering
  if (!isInitialized) {
    // Inline fix: ensure only React elements are returned, not raw values
    return (
      <View style={{ flex: 1, backgroundColor }}>
        <Text style={{ color: textColor, textAlign: 'center', marginTop: 40 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}> {/* Theme background */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {planData.map((item, idx) => (
          <View
            key={item.day}
            style={[
              styles.dayCard,
              { backgroundColor: cardBg, borderColor: cardBorder, shadowColor: colorScheme === "dark" ? "#000" : "#000" },
            ]}
          >
            <Text style={[styles.dayTitle, { color: textColor, opacity: 0.93 }]}>{item.day}</Text>
            {/* Render meal fields dynamically */}
            {meals.map((field) => (
              <View style={styles.row} key={field}>
                <Text style={[styles.label, { color: labelColor }]}>{field}:</Text>
                <TouchableOpacity
                  style={[
                    styles.foodSelectorField,
                    { backgroundColor: inputBg, borderColor: inputBorder },
                    item[field] && { backgroundColor: selectedBg, borderColor: selectedText },
                  ]}
                  onPress={() => openFoodSelector(idx, field)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.foodSelectorText,
                      { color: textColor },
                      item[field] && { color: selectedText, fontWeight: "bold" },
                    ]}
                  >
                    {item[field] ? item[field] : `Select food`}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={[
                styles.notes,
                { backgroundColor: inputBg, borderColor: inputBorder, color: textColor },
              ]}
              value={item.notes}
              onChangeText={(v) => handleUpdatePlan(idx, "notes", v)}
              placeholder="Add notes..."
              multiline
              placeholderTextColor={colorScheme === "dark" ? "#888" : "#aaa"}
              selectionColor={selectedText}
            />
          </View>
        ))}
      </ScrollView>
      
      {/* Modal for food selection */}
      <Modal
        visible={foodSelectorVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFoodSelectorVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.18)' }]}> {/* Darker overlay in dark mode */}
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}> {/* Modal card uses theme */}
            <Text style={[styles.modalTitle, { color: textColor }]}>Select Food</Text>
            <FlatList
              data={foods.map(item => String(item))}
              keyExtractor={(item) => String(item)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.foodSelectorItem,
                    { backgroundColor: inputBg, borderColor: inputBorder },
                  ]}
                  onPress={() => selectFood(item)}
                >
                  <Text style={[styles.foodSelectorItemText, { color: textColor }]}>{String(item)}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={styles.foodSelectorSeparator} />
              )}
            />
            <TouchableOpacity
              style={[
                styles.modalCancel,
                { backgroundColor: colorScheme === 'dark' ? '#23232a' : '#f2f2f7', borderColor: cardBorder },
              ]}
              onPress={() => setFoodSelectorVisible(false)}
            >
              <Text style={[styles.modalCancelText, { color: selectedText }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7" }, // Softer background
  contentContainer: { padding: 10, paddingBottom: 20 },
  dayCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e5ea",
  },
  dayTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
    color: "#222",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  label: {
    width: 80,
    fontWeight: "600",
    fontSize: 15,
    color: "#444",
    letterSpacing: 0.1,
  },
  foodSelectorField: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d1d6",
    borderRadius: 10,
    backgroundColor: "#f7faff",
    marginLeft: 8,
    justifyContent: "center",
    minHeight: 38,
    maxHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  // Add a style for selected field
  foodSelectorFieldSelected: {
    backgroundColor: "#e6f0fa", // Light blue background
    borderColor: "#007AFF", // Blue border
  },
  foodSelectorText: {
    color: "#222",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  // Add a style for selected text
  foodSelectorTextSelected: {
    color: "#007AFF", // Blue text
    fontWeight: "bold",
  },
  notes: {
    borderWidth: 1,
    borderColor: "#d1d1d6",
    borderRadius: 10,
    padding: 10,
    minHeight: 32,
    marginVertical: 4,
    backgroundColor: "#f7faff",
    fontSize: 14,
    color: "#222",
    fontWeight: "400",
    letterSpacing: 0.1,
    textAlignVertical: "top",
  },
  // Modal styles (renamed for food selector)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  foodSelectorItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f7faff",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#e5e5ea",
  },
  foodSelectorItemText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  foodSelectorSeparator: {
    height: 6,
    backgroundColor: "transparent",
  },
  modalCancel: {
    marginTop: 18,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 10,
    backgroundColor: "#f2f2f7",
    borderWidth: 1,
    borderColor: "#e5e5ea",
  },
  modalCancelText: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.1,
  },
});