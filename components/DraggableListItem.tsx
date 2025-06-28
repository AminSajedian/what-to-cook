import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  onRemove: () => void;
  drag: () => void;
  isActive: boolean;
  colorScheme: string | null | undefined;
  textColor: string;
  cardBg: string;
  cardBorder: string;
  inputPlaceholder?: string;
  removeIconName?: React.ComponentProps<typeof MaterialIcons>["name"];
};

export default function DraggableListItem({
  value,
  onChangeText,
  onRemove,
  drag,
  isActive,
  colorScheme,
  textColor,
  cardBg,
  cardBorder,
  inputPlaceholder = "",
  removeIconName = "delete",
}: Props) {
  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
          opacity: isActive ? 0.7 : 1,
        },
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
          styles.input,
          {
            color: textColor,
            backgroundColor: "transparent",
            borderColor: "transparent",
            fontSize: 17,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={inputPlaceholder}
        placeholderTextColor={colorScheme === "dark" ? "#888" : "#aaa"}
      />
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
        <MaterialIcons name={removeIconName} size={22} color="#ff5252" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    elevation: 1,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 17,
  },
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
});
