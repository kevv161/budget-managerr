import { useState } from 'react';
import { CATEGORIES, getCategoryIsFixed } from '../config/categories';

const ExpenseForm = ({ onExpenseAdd }) => {
  const [expense, setExpense] = useState({
    description: '',
    amount: '',
    category: 'otros',
    isFixed: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(expense.amount);
    
    if (!expense.description || !expense.amount || isNaN(amount) || amount <= 0) {
      alert('Por favor complete todos los campos correctamente');
      return;
    }
    
    onExpenseAdd({
      ...expense,
      amount
    });
    
    // Reset form
    setExpense({
      description: '',
      amount: '',
      category: 'otros',
      isFixed: false
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      setExpense(prev => ({
        ...prev,
        [name]: value,
        isFixed: getCategoryIsFixed(value)
      }));
    } else {
      setExpense(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="expense-form-container">
      <div className="form-header">
        <h2>Agregar Gasto</h2>
        <div className="form-icon">➕</div>
      </div>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <input
            type="text"
            id="description"
            name="description"
            value={expense.description}
            onChange={handleChange}
            placeholder="Descripción del gasto"
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Monto (Q)</label>
          <div className="input-group">
            <span className="currency-symbol">Q</span>
            <input
              type="number"
              id="amount"
              name="amount"
              value={expense.amount}
              onChange={handleChange}
              placeholder="Monto del gasto"
              step="0.01"
              min="0.01"
              required
              className="form-input"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Categoría</label>
          <select
            id="category"
            name="category"
            value={expense.category}
            onChange={handleChange}
            required
            className="form-select"
          >
            {CATEGORIES.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Tipo de Gasto</label>
          <div className="expense-type-info">
            <span className={`expense-type-badge ${expense.isFixed ? 'fixed' : 'variable'}`}>
              {expense.isFixed ? 'Gasto Fijo' : 'Gasto No Fijo'}
            </span>
            <p className="expense-type-description">
              {expense.isFixed 
                ? 'Este es un gasto fijo (agua, electricidad/luz, internet, streaming, compras necesarias)' 
                : 'Este es un gasto variable (gastos médicos, compras no esenciales, entretenimiento)'}
            </p>
          </div>
        </div>
        
        <button type="submit" className="btn-primary form-submit">
          <span className="btn-text">Agregar Gasto</span>
          <span className="btn-icon">💾</span>
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;