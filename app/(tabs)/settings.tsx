import { useStore } from "@/contexts/StoreContext";
import React, { useState } from "react";
import {
  Button,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  // Use foodsState/setFoods from context, and other context variables
  const {
    weekDays,
    setWeekDays,
    foodsState,
    setFoods,
    fieldLabels,
    setFieldLabels,
    initialized,
  } = useStore();

  // Local state for editing
  const [days, setDays] = useState<string[]>(weekDays);
  const [labels, setLabels] = useState({ ...fieldLabels });
  const [newDay, setNewDay] = useState("");

  // Sync local state with context when context changes
  React.useEffect(() => {
    setDays(weekDays);
  }, [weekDays]);
  React.useEffect(() => {
    setLabels({ ...fieldLabels });
  }, [fieldLabels]);

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

  if (!initialized)
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Edit Week Days</Text>
      <FlatList
        data={days}
        keyExtractor={(d) => d}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={item}
              onChangeText={(v) => {
                const arr = [...days];
                arr[index] = v;
                setDays(arr);
              }}
            />
            <TouchableOpacity
              onPress={() => setDays(days.filter((_, i) => i !== index))}
            >
              <Text style={styles.removeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={newDay}
          onChangeText={setNewDay}
          placeholder="Add new day"
        />
        <Button
          title="Add"
          onPress={() => {
            if (newDay.trim()) {
              setDays([...days, newDay.trim()]);
              setNewDay("");
            }
          }}
        />
      </View>
      <Button title="Save Days" onPress={() => setWeekDays(days)} />

      <Text style={styles.title}>Edit Field Labels</Text>
      {Object.keys(labels).map((key) => {
        const field =
          key as keyof typeof labels as import("@/contexts/StoreContext").PlanField;
        return (
          <View style={styles.row} key={key}>
            <Text style={styles.label}>{key}:</Text>
            <TextInput
              style={styles.input}
              value={labels[field]}
              onChangeText={(v) => setLabels({ ...labels, [field]: v })}
            />
          </View>
        );
      })}
      <Button title="Save Labels" onPress={() => setFieldLabels(labels)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f2f2f7" },
  title: { fontWeight: "bold", fontSize: 18, marginVertical: 12 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  removeBtn: { color: "#ff5252", fontSize: 18, paddingHorizontal: 8 },
  label: { width: 90, fontWeight: "500", fontSize: 15, color: "#333" },
});
