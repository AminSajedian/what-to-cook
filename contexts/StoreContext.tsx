import type { DayPlan, StoreContextType } from "@/types/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

// Add defaultPlan generator
const getDefaultPlan = (weekDays: string[], meals: string[]): DayPlan[] =>
  weekDays.map((day) => ({
    day,
    ...Object.fromEntries(meals.map((m) => [m, ""])),
    notes: "",
  }));

// Extend StoreContextType to include plan and updatePlan
type StoreContextTypeExtended = StoreContextType & {
  plan: DayPlan[];
  updatePlan: (plan: DayPlan[]) => void;
};

const StoreContext = createContext<StoreContextTypeExtended | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [weekDays, setWeekDaysState] = useState<string[]>(defaultWeekDays);
  const [foods, setFoodsState] = useState<string[]>(defaultFoods);
  const [meals, setMealsState] = useState<string[]>(defaultMeals);
  const [plan, setPlanState] = useState<DayPlan[]>(getDefaultPlan(defaultWeekDays, defaultMeals));
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Persist functions
  const updateWeekDays = (newDays: string[]) => {
    setWeekDaysState(newDays);
    AsyncStorage.setItem("weekDays", JSON.stringify(newDays));
  };
  const updateFoods = (newFoods: string[]) => {
    console.log("🚀 ~ updateFoods ~ newFoods:", newFoods)
    setFoodsState(newFoods);
    AsyncStorage.setItem("foods", JSON.stringify(newFoods));
  };
  const updateMeals = (newMeals: string[]) => {
    setMealsState(newMeals);
    AsyncStorage.setItem("meals", JSON.stringify(newMeals));
  };
  // Add updatePlan
  const updatePlan = (newPlan: DayPlan[]) => {
    console.log("🚀 ~ updatePlan ~ newPlan:", newPlan)
    setPlanState(newPlan);
    AsyncStorage.setItem("plan", JSON.stringify(newPlan));
  };

  // Load from AsyncStorage or use defaults
  useEffect(() => {
    (async () => {
      // const AsyncStorage = (await import("@react-native-async-storage/async-storage"))
      //   .default;
      const [weekDaysData, foodsData, mealsData, planData] = await Promise.all([
        AsyncStorage.getItem("weekDays"),
        AsyncStorage.getItem("foods"),
        AsyncStorage.getItem("meals"),
        AsyncStorage.getItem("plan"),
      ]);
      console.log("🚀 ~ StoreContext ~ foodsData:", foodsData)
      const loadedWeekDays = weekDaysData ? JSON.parse(weekDaysData) : defaultWeekDays;
      const loadedMeals = mealsData ? JSON.parse(mealsData) : defaultMeals;
      setWeekDaysState(loadedWeekDays);
      setFoodsState(foodsData ? JSON.parse(foodsData) : defaultFoods);
      setMealsState(loadedMeals);
      // Plan: try to load, else generate default
      if (planData) {
        setPlanState(JSON.parse(planData));
      } else {
        setPlanState(getDefaultPlan(loadedWeekDays, loadedMeals));
      }
      setIsInitialized(true);
    })();
  }, []);

  // When weekDays or meals change, reset plan to match (if needed)
  useEffect(() => {
    setPlanState((prevPlan) => {
      // If weekDays or meals changed, re-map plan to match new structure
      const newPlan = weekDays.map((day) => {
        const prevDay = prevPlan.find((p) => p.day === day);
        const mealFields = Object.fromEntries(
          meals.map((m) => [m, prevDay && m in prevDay ? prevDay[m] : ""])
        );
        return {
          day,
          ...mealFields,
          notes: prevDay ? prevDay.notes : "",
        };
      });
      AsyncStorage.setItem("plan", JSON.stringify(newPlan));
      return newPlan;
    });
  }, [weekDays, meals]);

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
        plan,
        updatePlan,
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