import { useContext } from 'react';
import { getCategoryIcon, getCategoryName } from '../config/categories';
import { convertCurrency, formatCurrency } from '../utils/currencyConverter';
import { ThemeContext } from '../contexts/ThemeContext';

const ExpenseList = ({ expenses, onDeleteExpense, selectedCurrency }) => {
  const { theme } = useContext(ThemeContext);
  
  // Convert amount to selected currency
  const formatAmount = (amount) => {
    if (selectedCurrency === 'GTQ') return `Q${amount.toFixed(2)}`;
    const convertedAmount = convertCurrency(amount, 'GTQ', selectedCurrency);
    return formatCurrency(convertedAmount, selectedCurrency);
  };

  if (expenses.length === 0) {
    return (
      <div className={`expense-list-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
        <h2>Gastos</h2>
        <p className="no-expenses">No hay gastos registrados</p>
      </div>
    );
  }

  return (
    <div className={`expense-list-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className="list-header">
        <h2>Gastos</h2>
        <div className="expense-count">
          {expenses.length} {expenses.length === 1 ? 'gasto' : 'gastos'}
        </div>
      </div>
      <ul className="expense-list">
        {expenses.map((expense) => (
          <li key={expense.id} className="expense-item">
            <div className="expense-main">
              <div className="expense-icon">
                {getCategoryIcon(expense.category)}
              </div>
              <div className="expense-details">
                <h3>{expense.description}</h3>
                <div className="expense-info">
                  <span className="expense-category">
                    {getCategoryName(expense.category)}
                  </span>
                  <span className={`expense-type ${expense.isFixed ? 'fixed' : 'variable'}`}>
                    {expense.isFixed ? 'Fijo' : 'No Fijo'}
                  </span>
                </div>
              </div>
              <div className="expense-amount">
                <span className="amount">{formatAmount(expense.amount)}</span>
              </div>
              <button 
                className="delete-btn" 
                onClick={() => onDeleteExpense(expense.id)}
                aria-label="Eliminar gasto"
                title="Eliminar gasto"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseList;