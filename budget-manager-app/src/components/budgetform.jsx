import { useState } from 'react';

const BudgetForm = ({ onBudgetSet }) => {
  const [budgetLimit, setBudgetLimit] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(budgetLimit);
    
    if (!budgetLimit || isNaN(amount) || amount <= 0) {
      alert('Por favor ingrese un límite de presupuesto válido');
      return;
    }
    
    onBudgetSet(amount);
  };

  return (
    <div className="budget-form-container">
      <h2>Establecer Presupuesto</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="budget">Límite de Presupuesto (Q)</label>
          <div className="input-group">
            <span className="currency-symbol">Q</span>
            <input
              type="number"
              id="budget"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              placeholder="Ingrese su límite de presupuesto"
              step="0.01"
              min="1"
              required
            />
          </div>
        </div>
        <button type="submit" className="btn-primary">
          Establecer Presupuesto
        </button>
      </form>
    </div>
  );
};

export default BudgetForm;