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
  orderBy
} from 'firebase/firestore';
import { db } from '../Data/firebase';
import { useAuth } from '../contexts/AuthContext';
import { initializeUserData, testFirestoreConnection } from '../utils/initFirestore';


export const useFirestoreBudget = () => {
  const [budget, setBudget] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [budgetSet, setBudgetSet] = useState(false);
  const { currentUser } = useAuth();


  // Escuchar cambios en el presupuesto y gastos del usuario
  useEffect(() => {
    if (!currentUser) {
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

        // Escuchar cambios en el presupuesto
        const budgetQuery = query(
          collection(db, 'users', currentUser.uid, 'budgets')
        );

        budgetUnsubscribe = onSnapshot(
          budgetQuery, 
          (querySnapshot) => {
            if (!querySnapshot.empty) {
              const budgetDoc = querySnapshot.docs[0];
              const budgetData = budgetDoc.data();
              const budgetAmount = budgetData.amount || 0;
              setBudget(budgetAmount);
              setBudgetSet(budgetAmount > 0);
            } else {
              setBudget(0);
              setBudgetSet(false);
            }
            checkLoadingComplete();
          },
          (error) => {
            console.error('Error loading budget:', error);
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

  // Crear o actualizar presupuesto
  const setBudgetAmount = async (amount) => {
    if (!currentUser) return;

    try {
      const budgetQuery = query(
        collection(db, 'users', currentUser.uid, 'budgets')
      );
      
      // Verificar si ya existe un presupuesto
      const budgetSnapshot = await getDocs(budgetQuery);
      
      if (budgetSnapshot.empty) {
        // Crear nuevo presupuesto
        await addDoc(collection(db, 'users', currentUser.uid, 'budgets'), {
          amount: parseFloat(amount),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Actualizar presupuesto existente
        const budgetDoc = budgetSnapshot.docs[0];
        await updateDoc(doc(db, 'users', currentUser.uid, 'budgets', budgetDoc.id), {
          amount: parseFloat(amount),
          updatedAt: new Date()
        });
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
    expenses,
    totalExpenses,
    savings,
    emergencyFund,
    remaining,
    loading,
    budgetSet,
    setBudgetAmount,
    addExpense,
    deleteExpense
  };
};
