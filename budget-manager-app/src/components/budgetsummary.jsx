import { convertCurrency, formatCurrency, CURRENCIES } from '../utils/currencyConverter';

const BudgetSummary = ({ budget, expenses, savings, emergencyFund, remaining, selectedCurrency }) => {
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const percentSpent = budget > 0 ? (totalExpenses / budget) * 100 : 0;
  
  // Convert amounts to selected currency
  const convertAmount = (amount) => {
    if (selectedCurrency === 'GTQ') return amount;
    return convertCurrency(amount, 'GTQ', selectedCurrency);
  };

  const formatAmount = (amount) => {
    const convertedAmount = convertAmount(amount);
    return formatCurrency(convertedAmount, selectedCurrency);
  };
  
  // Determine status class based on remaining budget
  let statusClass = 'normal';
  if (remaining < 0) {
    statusClass = 'danger';
  } else if (remaining < budget * 0.2) {
    statusClass = 'warning';
  }

  return (
    <div className="budget-summary">
      <div className="summary-card budget">
        <div className="card-icon">💰</div>
        <div className="card-content">
          <h3>Presupuesto Total</h3>
          <p className="amount">{formatAmount(budget)}</p>
        </div>
      </div>
      
      <div className="summary-card expenses">
        <div className="card-icon">💸</div>
        <div className="card-content">
          <h3>Gastos Totales</h3>
          <p className="amount">{formatAmount(totalExpenses)}</p>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${Math.min(percentSpent, 100)}%` }}
            ></div>
          </div>
          <p className="percent">{percentSpent.toFixed(1)}% del presupuesto</p>
        </div>
      </div>
      
      <div className={`summary-card remaining ${statusClass}`}>
        <div className="card-icon">
          {remaining < 0 ? '⚠️' : remaining < budget * 0.2 ? '⚡' : '✅'}
        </div>
        <div className="card-content">
          <h3>Restante</h3>
          <p className="amount">{formatAmount(remaining)}</p>
        </div>
      </div>
      
      <div className="summary-card savings">
        <div className="card-icon">🛡️</div>
        <div className="card-content">
          <h3>Fondo de Emergencia</h3>
          <p className="amount">{formatAmount(emergencyFund)}</p>
          <p className="info">10% de tu presupuesto guardado para emergencias</p>
        </div>
      </div>
      
      <div className="summary-card available">
        <div className="card-icon">💎</div>
        <div className="card-content">
          <h3>Dinero Disponible</h3>
          <p className="amount">{formatAmount(savings)}</p>
          <p className="info">Dinero disponible después del fondo de emergencia</p>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;