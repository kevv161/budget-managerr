import { useState, useEffect } from 'react';

const useBudget = () => {
  const [budget, setBudget] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [budgetSet, setBudgetSet] = useState(false);

  // Calculate savings (10% of budget)
  const savings = budget * 0.1;

  const handleSetBudget = (amount) => {
    setBudget(amount);
    setBudgetSet(true);
  };

  const handleAddExpense = (expense) => {
    setExpenses(prevExpenses => [...prevExpenses, expense]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
  };

  return {
    budget,
    expenses,
    savings,
    budgetSet,
    handleSetBudget,
    handleAddExpense,
    handleDeleteExpense
  };
};

export default useBudget;
