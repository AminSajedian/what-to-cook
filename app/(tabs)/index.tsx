import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
const defaultFoods = [
  "Eggs",
  "Pasta",
  "Salad",
  "Chicken",
  "Soup",
  "Rice",
  "Fish",
];

type PlanField = "breakfast" | "lunch" | "dinner" | "notes";

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

  const updatePlan = (index: number, field: PlanField, value: string) => {
    const newPlan = [...plan];
    newPlan[index][field] = value;
    setPlan(newPlan);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {plan.map((item, idx) => (
        <View key={item.day} style={styles.dayCard}>
          <Text style={styles.dayTitle}>{item.day}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Breakfast:</Text>
            {/* Set minHeight and justifyContent for Picker wrapper to avoid text cut-off */}
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={item.breakfast}
                onValueChange={(v) => updatePlan(idx, "breakfast", v)}
                style={styles.picker}
                dropdownIconColor="#007AFF"
                itemStyle={styles.pickerItem}
                mode="dropdown"
                // Remove fontSize/fontWeight from style prop for Android
              >
                <Picker.Item label="Select food" value="" color="#888" style={styles.pickerPlaceholder} />
                {foods.map((f) => (
                  <Picker.Item
                    key={f}
                    label={f}
                    value={f}
                    color="#222"
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Lunch:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={item.lunch}
                onValueChange={(v) => updatePlan(idx, "lunch", v)}
                style={styles.picker}
                dropdownIconColor="#007AFF"
                itemStyle={styles.pickerItem}
                mode="dropdown"
              >
                <Picker.Item label="Select food" value="" color="#888" style={styles.pickerPlaceholder} />
                {foods.map((f) => (
                  <Picker.Item
                    key={f}
                    label={f}
                    value={f}
                    color="#222"
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dinner:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={item.dinner}
                onValueChange={(v) => updatePlan(idx, "dinner", v)}
                style={styles.picker}
                dropdownIconColor="#007AFF"
                itemStyle={styles.pickerItem}
                mode="dropdown"
              >
                <Picker.Item label="Select food" value="" color="#888" style={styles.pickerPlaceholder} />
                {foods.map((f) => (
                  <Picker.Item
                    key={f}
                    label={f}
                    value={f}
                    color="#222"
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
          </View>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  contentContainer: { padding: 4, paddingBottom: 8 }, // Further reduced padding
  link: {
    color: "#007AFF",
    fontWeight: "bold",
    marginBottom: 8, // Reduced margin
    fontSize: 16,
    alignSelf: "flex-end",
  },
  dayCard: {
    backgroundColor: "#fafafa",
    borderRadius: 8, // Less rounded
    padding: 8, // Reduced padding
    marginBottom: 6, // Reduced margin between cards
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, // Lighter shadow
    shadowRadius: 2,
    elevation: 1,
  },
  dayTitle: {
    fontWeight: "bold",
    fontSize: 16, // Smaller font
    marginBottom: 4, // Reduced margin
    color: "#222",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2, // Minimal margin between rows
  },
  label: {
    width: 70, // Narrower
    fontWeight: "500",
    fontSize: 13, // Smaller font
    color: "#333",
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 6, // Less rounded
    overflow: "hidden",
    backgroundColor: "#f5f7fa",
    marginLeft: 4, // Reduced margin
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
    minHeight: 36, // Smaller height
  },
  picker: {
    width: "100%",
    minHeight: 36, // Smaller height
    color: "#222",
    backgroundColor: "transparent",
    paddingHorizontal: 4,
    justifyContent: "center",
    ...Platform.select({
      android: {
        textAlignVertical: "center",
        paddingTop: 0,
        paddingBottom: 0,
      },
    }),
  },
  pickerItem: {
    ...Platform.select({
      ios: {
        fontSize: 14,
        fontWeight: "500",
      },
      android: {
        paddingVertical: 8,
      },
    }),
    color: "#222",
    backgroundColor: "#f5f7fa",
    paddingVertical: 4,
  },
  pickerPlaceholder: {
    ...Platform.select({
      ios: {
        fontSize: 14,
        fontStyle: "italic",
        fontWeight: "400",
      },
      android: {},
    }),
    color: "#888",
    backgroundColor: "#f5f7fa",
  },
  notes: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 6,
    padding: 6,
    minHeight: 28,
    marginVertical: 2,
    backgroundColor: "#f5f7fa",
    fontSize: 13,
    color: "#222",
    fontWeight: "500",
    letterSpacing: 0.1,
    textAlignVertical: "top",
  },
});
