import { useState } from 'react';
import { format, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

const BudgetForm = ({ onBudgetSet }) => {
  const [budgetLimit, setBudgetLimit] = useState('');

  // Función para obtener los próximos 4 meses
  const getNextMonths = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 4; i++) {
      const monthDate = addMonths(currentDate, i);
      months.push(format(monthDate, 'MMMM yyyy', { locale: es }));
    }
    return months;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(budgetLimit);
    
    if (!budgetLimit || isNaN(amount) || amount <= 0) {
      alert('Por favor ingrese un límite de presupuesto válido');
      return;
    }
    
    onBudgetSet(amount);
  };

  const nextMonths = getNextMonths();

  return (
    <div className="budget-form-container">
      <h2>Establecer Presupuesto</h2>
      <div style={{ 
        backgroundColor: '#e3f2fd', 
        border: '1px solid #90caf9', 
        borderRadius: '8px', 
        padding: '12px', 
        marginBottom: '16px' 
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#1565c0' }}>
          📅 Presupuestos que se crearán:
        </h4>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#1565c0' }}>
          {nextMonths.map((month, index) => (
            <li key={index}>
              {month} {index === 0 && '(Mes actual)'}
            </li>
          ))}
        </ul>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#1565c0' }}>
          Se establecerá el mismo monto para los próximos 4 meses
        </p>
      </div>
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
          Establecer Presupuestos
        </button>
      </form>
    </div>
  );
};

export default BudgetForm;