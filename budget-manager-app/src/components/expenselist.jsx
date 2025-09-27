import { getCategoryIcon, getCategoryName } from '../config/categories';

const ExpenseList = ({ expenses, onDeleteExpense }) => {

  if (expenses.length === 0) {
    return (
      <div className="expense-list-container">
        <h2>Gastos</h2>
        <p className="no-expenses">No hay gastos registrados</p>
      </div>
    );
  }

  return (
    <div className="expense-list-container">
      <h2>Gastos</h2>
      <ul className="expense-list">
        {expenses.map((expense) => (
          <li key={expense.id} className="expense-item">
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
              <span>Q{expense.amount.toFixed(2)}</span>
            </div>
            <button 
              className="delete-btn" 
              onClick={() => onDeleteExpense(expense.id)}
              aria-label="Eliminar gasto"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseList;