const BudgetSummary = ({ budget, expenses, savings, emergencyFund, remaining }) => {
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const percentSpent = budget > 0 ? (totalExpenses / budget) * 100 : 0;
  
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
          <p className="amount">Q{budget.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="summary-card expenses">
        <div className="card-icon">💸</div>
        <div className="card-content">
          <h3>Gastos Totales</h3>
          <p className="amount">Q{totalExpenses.toFixed(2)}</p>
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
          <p className="amount">Q{remaining.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="summary-card savings">
        <div className="card-icon">🛡️</div>
        <div className="card-content">
          <h3>Fondo de Emergencia</h3>
          <p className="amount">Q{emergencyFund.toFixed(2)}</p>
          <p className="info">10% de tu presupuesto guardado para emergencias</p>
        </div>
      </div>
      
      <div className="summary-card available">
        <div className="card-icon">💎</div>
        <div className="card-content">
          <h3>Dinero Disponible</h3>
          <p className="amount">Q{savings.toFixed(2)}</p>
          <p className="info">Dinero disponible después del fondo de emergencia</p>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;