// Represents a single day's meal plan
export interface DayPlan {
  day: string;
  notes: string;
  [meal: string]: string; // meal name as key, food as value, plus 'notes'
}

// Store context value shape
export interface StoreContextType {
  weekDays: string[];
  updateWeekDays: (days: string[]) => void;
  foods: string[];
  updateFoods: (foods: string[]) => void;
  meals: string[];
  updateMeals: (meals: string[]) => void;
  isInitialized: boolean;
}
