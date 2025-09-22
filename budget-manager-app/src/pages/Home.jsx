import { useState } from 'react';
import BudgetForm from '../components/budgetform.jsx';
import ExpenseForm from '../components/expenseform.jsx';
import BudgetSummary from '../components/budgetsummary.jsx';
import ExpenseList from '../components/expenselist.jsx';
import useBudget from '../useBudget';

function Home() {
  const [showBudgetForm, setShowBudgetForm] = useState(true);
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

  return (
    <>
      <header className="app-header">
        <h1>Budget Manager</h1>
        <p className="currency-tag">Moneda: Quetzales (Q)</p>
      </header>

      <main className="app-main">
        {showBudgetForm ? (
          <BudgetForm onBudgetSet={handleBudgetSubmit} />
        ) : (
          <>
            <div className="budget-container">
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

            <div className="expenses-container">
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

      <footer className="app-footer">
        <p>Budget Manager App &copy; 2025</p>
      </footer>
    </>
  );
}

export default Home;