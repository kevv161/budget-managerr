import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BudgetForm from '../components/budgetform.jsx';
import ExpenseForm from '../components/expenseform.jsx';
import BudgetSummary from '../components/budgetsummary.jsx';
import ExpenseList from '../components/expenselist.jsx';
import { useFirestoreBudget } from '../hooks/useFirestoreBudget';

function Home() {
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    budget,
    expenses,
    savings,
    emergencyFund,
    remaining,
    loading,
    budgetSet,
    setBudgetAmount,
    addExpense,
    deleteExpense
  } = useFirestoreBudget();

  const handleBudgetSubmit = async (amount) => {
    try {
      await setBudgetAmount(amount);
      setShowBudgetForm(false);
    } catch (error) {
      console.error('Error setting budget:', error);
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await addExpense(expenseData);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteExpense(expenseId);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  // Sincronizar estado local con el estado de Firestore
  useEffect(() => {
    if (!loading) {
      setShowBudgetForm(!budgetSet);
    }
  }, [budgetSet, loading]);

  return (
    <>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 16px' }}>
        <header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <h1 style={{ marginBottom: '6px' }}>Budget Manager</h1>
            <p className="currency-tag">Moneda: Quetzales (Q)</p>
          </div>
          <button 
            className="btn-secondary" 
            onClick={handleLogout}
            style={{ whiteSpace: 'nowrap' }}
          >
            Cerrar sesión
          </button>
        </header>

        <main className="app-main" style={{ paddingTop: '8px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Cargando datos...</p>
            </div>
          ) : (!budgetSet || showBudgetForm) ? (
            <BudgetForm onBudgetSet={handleBudgetSubmit} />
          ) : (
            <>
            <div className="budget-container" style={{ marginBottom: '20px' }}>
              <BudgetSummary 
                budget={budget} 
                expenses={expenses} 
                savings={savings}
                emergencyFund={emergencyFund}
                remaining={remaining}
              />
              <button 
                className="btn-secondary" 
                onClick={() => setShowBudgetForm(true)}
              >
                Cambiar Presupuesto
              </button>
            </div>

            <div className="expenses-container" style={{ gap: '16px' }}>
              <div className="left-panel">
                <ExpenseForm onExpenseAdd={handleAddExpense} />
              </div>
              <div className="right-panel">
                <ExpenseList 
                  expenses={expenses} 
                  onDeleteExpense={handleDeleteExpense} 
                />
              </div>
            </div>
            </>
          )}
        </main>

        <footer className="app-footer" style={{ paddingTop: '24px' }}>
          <p>Budget Manager App &copy; 2025</p>
        </footer>
      </div>
    </>
  );
}

export default Home;