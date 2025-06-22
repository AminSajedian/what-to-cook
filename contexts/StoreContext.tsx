import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { StoreContextType } from "@/types/index";

const defaultWeekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const defaultFoods = ["Eggs", "Pasta", "Salad", "Chicken", "Soup", "Rice", "Fish"];
const defaultMeals = ["Breakfast", "Lunch", "Dinner"];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [weekDays, setWeekDaysState] = useState<string[]>(defaultWeekDays);
  const [foods, setFoodsState] = useState<string[]>(defaultFoods);
  const [meals, setMealsState] = useState<string[]>(defaultMeals);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Persist functions
  const updateWeekDays = (newDays: string[]) => {
    setWeekDaysState(newDays);
    AsyncStorage.setItem("weekDays", JSON.stringify(newDays));
  };
  const updateFoods = (newFoods: string[]) => {
    setFoodsState(newFoods);
    AsyncStorage.setItem("foods", JSON.stringify(newFoods));
  };
  const updateMeals = (newMeals: string[]) => {
    setMealsState(newMeals);
    AsyncStorage.setItem("meals", JSON.stringify(newMeals));
  };

  // Load from AsyncStorage or use defaults
  useEffect(() => {
    (async () => {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage"))
        .default;
      const [weekDaysData, foodsData, mealsData] = await Promise.all([
        AsyncStorage.getItem("weekDays"),
        AsyncStorage.getItem("foods"),
        AsyncStorage.getItem("meals"),
      ]);
      setWeekDaysState(weekDaysData ? JSON.parse(weekDaysData) : defaultWeekDays);
      setFoodsState(foodsData ? JSON.parse(foodsData) : defaultFoods);
      setMealsState(mealsData ? JSON.parse(mealsData) : defaultMeals);
      setIsInitialized(true);
    })();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        weekDays,
        updateWeekDays,
        foods,
        updateFoods,
        meals,
        updateMeals,
        isInitialized,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}