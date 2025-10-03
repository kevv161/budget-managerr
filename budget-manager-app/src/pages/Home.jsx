import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BudgetForm from '../components/budgetform.jsx';
import ExpenseForm from '../components/expenseform.jsx';
import BudgetSummary from '../components/budgetsummary.jsx';
import ExpenseList from '../components/expenselist.jsx';
import { useFirestoreBudget } from '../hooks/useFirestoreBudget';
import { useCurrency } from '../hooks/useCurrency';
import ExportButton from '../components/ExportButton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DotSpinner } from 'ldrs/react'
import 'ldrs/react/DotSpinner.css'

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
    deleteExpense,
    totalExpenses
  } = useFirestoreBudget();

  const {
    selectedCurrency,
    loading: currencyLoading,
    saveCurrencyPreference,
    getCurrencyName,
    CURRENCIES
  } = useCurrency();

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

  const handleCurrencyChange = async (e) => {
    const newCurrency = e.target.value;
    await saveCurrencyPreference(newCurrency);
  };

  // Sincronizar estado local con el estado de Firestore
  useEffect(() => {
    if (!loading) {
      setShowBudgetForm(!budgetSet);
    }
  }, [budgetSet, loading]);

  const getCurrentMonthName = () => {
    // Usar siempre la fecha actual real para mostrar
    const now = new Date();
    return format(now, 'MMMM yyyy', { locale: es });
  };

  return (
    <>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 16px' }}>
        <header className="app-header home-header">
          <div className="header-content">
            <div className="header-info">
              <h1>Budget Manager</h1>
              <div className="currency-selector">
                <label htmlFor="currency-select" className="currency-label">
                  Moneda:
                </label>
                <select
                  id="currency-select"
                  value={selectedCurrency}
                  onChange={handleCurrencyChange}
                  className="currency-dropdown"
                  disabled={currencyLoading}
                >
                  {Object.entries(CURRENCIES).map(([code, currency]) => (
                    <option key={code} value={code}>
                      {currency.name} ({currency.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <p className="current-month">
                Mes actual: {getCurrentMonthName()}
              </p>
            </div>
            <div className="header-actions">
              <button 
                className="btn-secondary btn-mobile" 
                onClick={handleLogout}
              >
                <span className="btn-text">Cerrar sesión</span>
                <span className="btn-icon">🚪</span>
              </button>
            </div>
          </div>
        </header>

        <main className="app-main" style={{ paddingTop: '8px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <DotSpinner
                  size="40"
                  speed="0.9"
                  color="black" 
                />
              <p>Cargando datos...</p>
            </div>
          ) : (!budgetSet || showBudgetForm) ? (
            <div>
              <div style={{ 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffeaa7', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '20px' 
              }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#856404' }}>
                  {budgetSet ? 'Cambiar Presupuesto' : 'Establecer Presupuesto'}
                </h3>
                <p style={{ margin: '0 0 12px 0', color: '#856404' }}>
                  {budgetSet 
                    ? 'Estás cambiando el presupuesto actual.' 
                    : 'Establece tu presupuesto para comenzar a controlar tus gastos.'
                  }
                </p>
              </div>
              <BudgetForm onBudgetSet={handleBudgetSubmit} />
            </div>
          ) : (
            <>
            <div className="budget-container" style={{ marginBottom: '20px' }}>
              <BudgetSummary 
                budget={budget} 
                expenses={expenses} 
                savings={savings}
                emergencyFund={emergencyFund}
                remaining={remaining}
                selectedCurrency={selectedCurrency}
              />
              <div className="budget-actions">
                <button 
                  className="btn-secondary btn-mobile" 
                  onClick={() => setShowBudgetForm(true)}
                >
                  <span className="btn-text">Cambiar Presupuesto</span>
                  <span className="btn-icon">💰</span>
                </button>
              </div>
            </div>

            <div className="expenses-container" style={{ gap: '16px' }}>
              <div className="left-panel">
                <ExpenseForm onExpenseAdd={handleAddExpense} selectedCurrency={selectedCurrency} />
              </div>
              <div className="right-panel">
                <ExpenseList 
                  expenses={expenses} 
                  onDeleteExpense={handleDeleteExpense}
                  selectedCurrency={selectedCurrency}
                />
              </div>
            </div>
            <ExportButton />
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