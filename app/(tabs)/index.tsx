import React, { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const defaultFoods = [""];

type PlanField = "breakfast" | "lunch" | "dinner" | "notes";

// Helper for field labels
const fieldLabels: Record<PlanField, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  notes: "Notes",
};

export default function HomeScreen() {
  const [foods] = useState(defaultFoods);
  const [plan, setPlan] = useState(
    weekDays.map((day) => ({
      day,
      breakfast: "",
      lunch: "",
      dinner: "",
      notes: "",
    }))
  );

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
      updatePlan(foodSelectorDayIdx, foodSelectorField, food);
    }
    setFoodSelectorVisible(false);
    setFoodSelectorDayIdx(null);
    setFoodSelectorField(null);
  };

  const updatePlan = (index: number, field: PlanField, value: string) => {
    const newPlan = [...plan];
    newPlan[index][field] = value;
    setPlan(newPlan);
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {plan.map((item, idx) => (
          <View key={item.day} style={styles.dayCard}>
            <Text style={styles.dayTitle}>{item.day}</Text>
            {/* Render each meal field as a touchable to open modal */}
            {(["breakfast", "lunch", "dinner"] as PlanField[]).map((field) => (
              <View style={styles.row} key={field}>
                <Text style={styles.label}>{fieldLabels[field]}:</Text>
                <TouchableOpacity
                  style={[
                    styles.foodSelectorField,
                    // Highlight if a food is selected
                    item[field] ? styles.foodSelectorFieldSelected : undefined,
                  ]}
                  onPress={() => openFoodSelector(idx, field)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.foodSelectorText,
                      // Highlight text if a food is selected
                      item[field] ? styles.foodSelectorTextSelected : undefined,
                    ]}
                  >
                    {item[field] ? item[field] : `Select food`}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={styles.notes}
              value={item.notes}
              onChangeText={(v) => updatePlan(idx, "notes", v)}
              placeholder="Add notes..."
              multiline
              placeholderTextColor="#aaa"
              selectionColor="#007AFF"
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Food</Text>
            <FlatList
              data={foods}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.foodSelectorItem}
                  onPress={() => selectFood(item)}
                >
                  <Text style={styles.foodSelectorItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={styles.foodSelectorSeparator} />
              )}
            />
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setFoodSelectorVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
