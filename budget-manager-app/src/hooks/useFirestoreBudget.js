import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../Data/firebase';
import { useAuth } from '../contexts/AuthContext';
import { initializeUserData, testFirestoreConnection } from '../utils/initFirestore';
import { format, addMonths, startOfMonth } from 'date-fns';


export const useFirestoreBudget = () => {
  const [budget, setBudget] = useState(0);
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [budgetSet, setBudgetSet] = useState(false);
  const { currentUser } = useAuth();

  // Función para obtener el mes actual en formato YYYY-MM
  const getCurrentMonthKey = () => {
    return format(new Date(), 'yyyy-MM');
  };

  // Función para obtener los próximos 3 meses
  const getNextMonths = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 4; i++) {
      const monthDate = addMonths(currentDate, i);
      months.push(format(monthDate, 'yyyy-MM'));
    }
    return months;
  };


  // Escuchar cambios en el presupuesto y gastos del usuario
  useEffect(() => {
    if (!currentUser) {
      setBudgets([]);
      setExpenses([]);
      setBudget(0);
      setBudgetSet(false);
      setLoading(false);
      return;
    }

    let budgetUnsubscribe;
    let expensesUnsubscribe;
    let loadedCount = 0;

    const checkLoadingComplete = () => {
      loadedCount++;
      if (loadedCount >= 2) {
        setLoading(false);
      }
    };

    const setupListeners = async () => {
      try {
        // Probar conexión a Firestore
        const isConnected = await testFirestoreConnection();
        if (!isConnected) {
          console.error('No se pudo conectar a Firestore');
          setLoading(false);
          return;
        }

        // Inicializar datos del usuario si es necesario
        await initializeUserData(currentUser.uid);

        // Escuchar cambios en los presupuestos
        const budgetQuery = query(
          collection(db, 'users', currentUser.uid, 'budgets'),
          orderBy('monthKey', 'asc')
        );

        budgetUnsubscribe = onSnapshot(
          budgetQuery, 
          (querySnapshot) => {
            const budgetsArray = [];
            let currentBudget = 0;
            let hasCurrentBudget = false;

            querySnapshot.forEach((doc) => {
              const budgetData = { ...doc.data(), id: doc.id };
              budgetsArray.push(budgetData);
              
              // Si es el presupuesto del mes actual, lo establecemos como presupuesto actual
              if (budgetData.monthKey === getCurrentMonthKey()) {
                currentBudget = budgetData.amount || 0;
                hasCurrentBudget = true;
              }
            });

            setBudgets(budgetsArray);
            setBudget(currentBudget);
            setBudgetSet(hasCurrentBudget);
            checkLoadingComplete();
          },
          (error) => {
            console.error('Error loading budgets:', error);
            setBudgets([]);
            setBudget(0);
            setBudgetSet(false);
            checkLoadingComplete();
          }
        );

        // Escuchar cambios en los gastos
        const expensesQuery = query(
          collection(db, 'users', currentUser.uid, 'expenses'),
          orderBy('createdAt', 'desc')
        );

        expensesUnsubscribe = onSnapshot(
          expensesQuery, 
          (querySnapshot) => {
            const expensesArray = [];
            querySnapshot.forEach((doc) => {
              expensesArray.push({ ...doc.data(), id: doc.id });
            });
            setExpenses(expensesArray);
            checkLoadingComplete();
          },
          (error) => {
            console.error('Error loading expenses:', error);
            setExpenses([]);
            checkLoadingComplete();
          }
        );
      } catch (error) {
        console.error('Error setting up listeners:', error);
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      if (budgetUnsubscribe) budgetUnsubscribe();
      if (expensesUnsubscribe) expensesUnsubscribe();
    };
  }, [currentUser]);

  // Crear o actualizar presupuesto para múltiples meses
  const setBudgetAmount = async (amount, months = null) => {
    if (!currentUser || !currentUser.uid) {
      console.warn('Usuario no autenticado o sin UID válido');
      return;
    }

    try {
      // Si no se especifican meses, usar los próximos 4 meses (actual + 3 futuros)
      const targetMonths = months || getNextMonths();
      
      for (const monthKey of targetMonths) {
        const budgetQuery = query(
          collection(db, 'users', currentUser.uid, 'budgets'),
          where('monthKey', '==', monthKey)
        );
        
        const budgetSnapshot = await getDocs(budgetQuery);
        
        if (budgetSnapshot.empty) {
          // Crear nuevo presupuesto para este mes
          await addDoc(collection(db, 'users', currentUser.uid, 'budgets'), {
            amount: parseFloat(amount),
            monthKey: monthKey,
            monthName: format(new Date(monthKey + '-01'), 'MMMM yyyy'),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else {
          // Actualizar presupuesto existente para este mes
          const budgetDoc = budgetSnapshot.docs[0];
          await updateDoc(doc(db, 'users', currentUser.uid, 'budgets', budgetDoc.id), {
            amount: parseFloat(amount),
            updatedAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error setting budget:', error);
      throw error;
    }
  };

  // Agregar gasto
  const addExpense = async (expenseData) => {
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'expenses'), {
        ...expenseData,
        amount: parseFloat(expenseData.amount),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  // Eliminar gasto
  const deleteExpense = async (expenseId) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'expenses', expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };


  // Calcular total de gastos
  const totalExpenses = expenses.reduce((total, expense) => total + (expense.amount || 0), 0);
  
  // Calcular fondo de emergencia (10% del presupuesto)
  const emergencyFund = budget * 0.1;
  
  // Calcular presupuesto restante
  const remaining = budget - totalExpenses;
  
  // Calcular ahorros: si el restante es mayor al fondo de emergencia, 
  // los ahorros son la diferencia. Si no, los ahorros son 0.
  const savings = remaining > emergencyFund ? remaining - emergencyFund : 0;


  return {
    budget,
    budgets,
    expenses,
    totalExpenses,
    savings,
    emergencyFund,
    remaining,
    loading,
    budgetSet,
    setBudgetAmount,
    addExpense,
    deleteExpense,
    getCurrentMonthKey,
    getNextMonths
  };
};
