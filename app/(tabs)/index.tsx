import { useStore } from "@/contexts/StoreContext";
// import type { DayPlan } from "@/types/index"; // Import DayPlan
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
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

  // Add state and modal for clear confirmation
  const [confirmClear, setConfirmClear] = useState<{
    idx: number;
    field: PlanField;
  } | null>(null);

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

  // Add search state for modal filtering
  const [foodSearch, setFoodSearch] = useState(""); // <-- Add this line

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

  // Reset all selected foods in the week plan
  const handleResetPlanFoods = () => {
    if (!planData || !updatePlan) return;
    const resetPlan = planData.map((day) => {
      const resetDay = { ...day };
      meals.forEach((meal) => {
        resetDay[meal] = "";
      });
      return resetDay;
    });
    updatePlan(resetPlan);
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

  // Always call hooks at the top level
  const bottomTabOverflow = useBottomTabOverflow();

  // Wait for context to be initialized before rendering
  if (!isInitialized) {
    // Inline fix: ensure only React elements are returned, not raw values
    return (
      <View style={{ flex: 1, backgroundColor }}>
        <Text style={{ color: textColor, textAlign: "center", marginTop: 40 }}>
          Loading...
        </Text>
      </View>
    );
  }

  // Add animation state for FAB rotation
  const resetAnim = React.useRef(new Animated.Value(0)).current;
  const handleAnimatedReset = () => {
    Animated.sequence([
      Animated.timing(resetAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(resetAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
    handleResetPlanFoods();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 50} // adjust offset if needed
    >
      <View style={[styles.container, { backgroundColor }]}>
        {/* Theme background */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            ...styles.contentContainer,
            paddingBottom: 10 + bottomTabOverflow, // Add tab bar height to bottom padding
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {planData.map((item, idx) => (
            <View
              key={item.day}
              style={[
                styles.dayCard,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  shadowColor: colorScheme === "dark" ? "#000" : "#000",
                },
              ]}
            >
              <Text
                style={[styles.dayTitle, { color: textColor, opacity: 0.93 }]}
              >
                {item.day}
              </Text>
              {/* Render meal fields dynamically */}
              {meals.map((field) => (
                <View style={styles.row} key={field}>
                  <Text style={[styles.label, { color: labelColor }]}>
                    {" "}
                    {field}:{" "}
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.foodSelectorField,
                        { backgroundColor: inputBg, borderColor: inputBorder },
                        item[field] && {
                          backgroundColor: selectedBg,
                          borderColor: selectedText,
                        },
                      ]}
                      onPress={() => openFoodSelector(idx, field)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.foodSelectorText,
                          { color: textColor },
                          item[field] && {
                            color: selectedText,
                            fontWeight: "bold",
                          },
                        ]}
                      >
                        {" "}
                        {item[field] ? item[field] : `Select food`}{" "}
                      </Text>
                    </TouchableOpacity>
                    {/* Add clear button next to selected food */}
                    {item[field] && (
                      <TouchableOpacity
                        style={{ position: "absolute", right: 13 }}
                        onPress={() => {
                          setConfirmClear({ idx, field });
                        }}
                        accessibilityLabel={`Clear ${field}`}
                      >
                        <Text
                          style={{
                            fontSize: 20,
                            color: "#d11a2a",
                            fontWeight: "bold",
                          }}
                        >
                          ×
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
              <TextInput
                style={[
                  styles.notes,
                  {
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                    color: textColor,
                  },
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
          <View
            style={[
              styles.modalOverlay,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(0,0,0,0.7)"
                    : "rgba(0,0,0,0.18)",
              },
            ]}
          >
            {/* Darker overlay in dark mode */}
            <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
              {/* Modal card uses theme */}
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Select Food
              </Text>
              {/* Search field for filtering foods */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colorScheme === "dark" ? "#3a3a3a" : "#c7e2fa",
                    borderRadius: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    fontSize: 16,
                    color: textColor,
                    backgroundColor:
                      colorScheme === "dark" ? "#232f3e" : "#eaf6ff",
                    shadowColor: colorScheme === "dark" ? "#000" : "#007AFF",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                  value={foodSearch}
                  onChangeText={setFoodSearch}
                  placeholder="Search food..."
                  placeholderTextColor={
                    colorScheme === "dark" ? "#7cc4fa" : "#7cc4fa"
                  }
                  autoFocus={true}
                />
                {foodSearch.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setFoodSearch("")}
                    style={{
                      padding: 8,
                      borderRadius: 20,
                      justifyContent: "center",
                      alignItems: "center",
                      position: "absolute",
                      right: 10,
                      top: -1,
                    }}
                    accessibilityLabel="Clear search"
                  >
                    <Text
                      style={{
                        fontSize: 23,
                        color: colorScheme === "dark" ? "#7cc4fa" : "#007AFF",
                        fontWeight: "bold",
                      }}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <FlatList
                data={foods
                  .map((item) => String(item))
                  .filter((item) =>
                    item.toLowerCase().includes(foodSearch.trim().toLowerCase())
                  )}
                keyExtractor={(item) => String(item)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.foodSelectorItem,
                      { backgroundColor: inputBg, borderColor: inputBorder },
                    ]}
                    onPress={() => selectFood(item)}
                  >
                    <Text
                      style={[
                        styles.foodSelectorItemText,
                        { color: textColor },
                      ]}
                    >
                      {String(item)}
                    </Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => (
                  <View style={styles.foodSelectorSeparator} />
                )}
                keyboardShouldPersistTaps="handled"
              />
              <TouchableOpacity
                style={[
                  styles.modalCancel,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#23232a" : "#f2f2f7",
                    borderColor: cardBorder,
                  },
                ]}
                onPress={() => setFoodSelectorVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: selectedText }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Confirmation modal for clearing food */}
        <Modal
          visible={!!confirmClear}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setConfirmClear(null)}
        >
          <View
            style={[
              styles.modalOverlay,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(0,0,0,0.7)"
                    : "rgba(0,0,0,0.18)",
              },
            ]}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: cardBg, alignItems: "center" },
              ]}
            >
              <Text
                style={{
                  color: textColor,
                  fontSize: 17,
                  fontWeight: "bold",
                  marginBottom: 12,
                }}
              >
                Remove selected food?
              </Text>
              <Text
                style={{ color: labelColor, fontSize: 15, marginBottom: 18 }}
              >
                Are you sure you want to clear this meal?
              </Text>
              <View style={{ flexDirection: "row", gap: 16 }}>
                <TouchableOpacity
                  style={[
                    styles.modalCancel,
                    { backgroundColor: "#f2f2f7", borderColor: cardBorder },
                  ]}
                  onPress={() => setConfirmClear(null)}
                >
                  <Text style={[styles.modalCancelText, { color: "#444" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalCancel,
                    { backgroundColor: "#d11a2a", borderColor: "#d11a2a" },
                  ]}
                  onPress={() => {
                    if (confirmClear) {
                      handleUpdatePlan(
                        confirmClear.idx,
                        confirmClear.field,
                        ""
                      );
                      setConfirmClear(null);
                    }
                  }}
                >
                  <Text style={[styles.modalCancelText, { color: "#fff" }]}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add FAB reset button at bottom left */}
        <Animated.View
          style={[
            styles.fabReset,
            {
              backgroundColor: selectedText,
              position: "absolute",
              left: 18,
              bottom: 24 + bottomTabOverflow,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.18,
              shadowRadius: 8,
              elevation: 6,
              transform: [
                {
                  rotate: resetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleAnimatedReset}
            accessibilityLabel="Reset all selected foods"
          >
            <MaterialIcons name="refresh" size={25} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
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
  headerTitle: {
    fontWeight: "bold",
    fontSize: 22,
    color: "#222",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  fabReset: {
    width: 50,
    height: 50,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
