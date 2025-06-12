import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type PlanField = "breakfast" | "lunch" | "dinner" | "notes";

type StoreContextType = {
  weekDays: string[];
  setWeekDays: (days: string[]) => void;
  foodsState: string[];
  setFoods: (foods: string[]) => void;
  fieldLabels: Record<PlanField, string>;
  setFieldLabels: (labels: Record<PlanField, string>) => void;
  initialized: boolean;
};

const defaultFieldLabels: Record<PlanField, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  notes: "Notes",
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [weekDays, setWeekDaysState] = useState<string[]>([]);
  const [foodsState, setFoodsState] = useState<string[]>([]);
  const [fieldLabels, setFieldLabelsState] =
    useState<Record<PlanField, string>>(defaultFieldLabels);
  const [initialized, setInitialized] = useState(false);

  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const [days, foods, labels] = await Promise.all([
        AsyncStorage.getItem("weekDays"),
        AsyncStorage.getItem("foods"), // changed from "defaultFoods" to "foods"
        AsyncStorage.getItem("fieldLabels"),
      ]);
      setWeekDaysState(
        days
          ? JSON.parse(days)
          : [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ]
      );
      setFoodsState(
        foods
          ? JSON.parse(foods)
          : ["Eggs", "Pasta", "Salad", "Chicken", "Soup", "Rice", "Fish"]
      );
      setFieldLabelsState(labels ? JSON.parse(labels) : defaultFieldLabels);
      setInitialized(true);
    })();
  }, []);

  // Save to AsyncStorage when changed
  const setWeekDays = (days: string[]) => {
    setWeekDaysState(days);
    AsyncStorage.setItem("weekDays", JSON.stringify(days));
  };
  const setFoods = (foods: string[]) => {
    setFoodsState(foods);
    AsyncStorage.setItem("foods", JSON.stringify(foods)); // changed from "defaultFoods" to "foods"
  };
  const setFieldLabels = (labels: Record<PlanField, string>) => {
    setFieldLabelsState(labels);
    AsyncStorage.setItem("fieldLabels", JSON.stringify(labels));
  };

  return (
    <StoreContext.Provider
      value={{
        weekDays,
        setWeekDays,
        foodsState,
        setFoods,
        fieldLabels,
        setFieldLabels,
        initialized,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
