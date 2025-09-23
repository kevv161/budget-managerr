import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BudgetForm from '../components/budgetform.jsx';
import ExpenseForm from '../components/expenseform.jsx';
import BudgetSummary from '../components/budgetsummary.jsx';
import ExpenseList from '../components/expenselist.jsx';
import useBudget from '../useBudget';

function Home() {
  const [showBudgetForm, setShowBudgetForm] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    budget,
    expenses,
    savings,
    budgetSet,
    handleSetBudget,
    handleAddExpense,
    handleDeleteExpense
  } = useBudget();

  const handleBudgetSubmit = (amount) => {
    handleSetBudget(amount);
    setShowBudgetForm(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

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
        {showBudgetForm ? (
          <BudgetForm onBudgetSet={handleBudgetSubmit} />
        ) : (
          <>
            <div className="budget-container" style={{ marginBottom: '20px' }}>
              <BudgetSummary 
                budget={budget} 
                expenses={expenses} 
                savings={savings} 
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