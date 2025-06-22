import { useStore } from "@/contexts/StoreContext";
import React, { useState } from "react";
import {
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

export default function SettingsScreen() {
  const colorScheme = useColorScheme(); // Get current theme
  // Use foodsState/setFoods from context, and other context variables
  const {
    weekDays,
    setWeekDays,
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

  // Theme-aware colors
  const backgroundColor = colorScheme === "dark" ? "#111" : "#f2f2f7";
  const textColor = colorScheme === "dark" ? "#fafafa" : "#222";
  const inputBorder = colorScheme === "dark" ? "#333" : "#ccc";

  if (!initialized)
    return (
      <View style={[styles.container, { backgroundColor }]}> {/* Theme background */}
        <Text style={{ color: textColor }}>Loading...</Text>
      </View>
    );

  return (
    <View style={[styles.container, { backgroundColor }]}> {/* Theme background */}
      <Text style={[styles.title, { color: textColor, marginBottom: 8 }]}>Edit Week Days</Text>
      <DraggableFlatList
        data={days}
        keyExtractor={(d) => d}
        onDragEnd={({ data }) => setDays(data)} // Allow drag-and-drop sorting
        renderItem={({ item, drag, isActive }) => {
          // Find the index manually since DraggableFlatList's RenderItemParams does not provide it
          const index = days.indexOf(item);
          return (
            <View style={[styles.row, { backgroundColor: colorScheme === 'dark' ? '#18181b' : '#fff', borderRadius: 10, marginBottom: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: inputBorder, shadowColor: colorScheme === 'dark' ? '#000' : '#000', elevation: 1 }]}> {/* Card style for each day */}
              <TouchableOpacity
                onLongPress={drag}
                delayLongPress={150}
                style={{ marginRight: 10 }}
              >
                <Text style={{ fontSize: 20, color: colorScheme === 'dark' ? '#aaa' : '#888' }}>≡</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { backgroundColor: 'transparent', borderColor: 'transparent', color: textColor, fontSize: 17 }]}
                value={item}
                onChangeText={(v) => {
                  const arr = [...days];
                  arr[index] = v;
                  setDays(arr);
                }}
                placeholderTextColor={colorScheme === "dark" ? "#888" : "#aaa"}
              />
              <TouchableOpacity
                onPress={() => setDays(days.filter((_, i) => i !== index))}
                style={{ marginLeft: 8, justifyContent: 'center', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 22, color: '#ff5252', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          <>
            <View style={[styles.row, { backgroundColor: colorScheme === 'dark' ? '#18181b' : '#fff', borderRadius: 10, marginBottom: 16, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: inputBorder, shadowColor: colorScheme === 'dark' ? '#000' : '#000', elevation: 1 }]}> {/* Card style for add new day */}
              <TextInput
                style={[styles.input, { backgroundColor: 'transparent', borderColor: 'transparent', color: textColor, fontSize: 17 }]}
                value={newDay}
                onChangeText={setNewDay}
                placeholder="Add new day"
                placeholderTextColor={colorScheme === "dark" ? "#888" : "#aaa"}
              />
              <TouchableOpacity
                onPress={() => {
                  if (newDay.trim()) {
                    setDays([...days, newDay.trim()]);
                    setNewDay("");
                  }
                }}
                style={{ marginLeft: 8, backgroundColor: '#007AFF', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, justifyContent: 'center', alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Add</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: '#007AFF', borderRadius: 8, paddingVertical: 14, marginBottom: 18 }}
              onPress={() => setWeekDays(days)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17, textAlign: 'center' }}>SAVE DAYS</Text>
            </TouchableOpacity>
            
            <Text style={[styles.title, { color: textColor, marginBottom: 8 }]}>Edit Field Labels</Text>
            {Object.keys(labels).map((key) => {
              const field = key as keyof typeof labels as import("@/contexts/StoreContext").PlanField;
              return (
                <View style={[styles.row, { backgroundColor: colorScheme === 'dark' ? '#18181b' : '#fff', borderRadius: 10, marginBottom: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: inputBorder, shadowColor: colorScheme === 'dark' ? '#000' : '#000', elevation: 1 }]} key={key}>
                  <Text style={[styles.label, { color: textColor, fontSize: 16 }]}>{key}:</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: 'transparent', borderColor: 'transparent', color: textColor, fontSize: 17 }]}
                    value={labels[field]}
                    onChangeText={(v) => setLabels({ ...labels, [field]: v })}
                    placeholderTextColor={colorScheme === "dark" ? "#888" : "#aaa"}
                  />
                </View>
              );
            })}
            <TouchableOpacity
              style={{ backgroundColor: '#007AFF', borderRadius: 8, paddingVertical: 14, marginBottom: 18 }}
              onPress={() => setFieldLabels(labels)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17, textAlign: 'center' }}>SAVE LABELS</Text>
            </TouchableOpacity>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
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
