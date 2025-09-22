const BudgetSummary = ({ budget, expenses, savings }) => {
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const remaining = budget - totalExpenses;
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
        <h3>Presupuesto Total</h3>
        <p className="amount">Q{budget.toFixed(2)}</p>
      </div>
      
      <div className="summary-card expenses">
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
      
      <div className={`summary-card remaining ${statusClass}`}>
        <h3>Restante</h3>
        <p className="amount">Q{remaining.toFixed(2)}</p>
      </div>
      
      <div className="summary-card savings">
        <h3>Fondo de Emergencia</h3>
        <p className="amount">Q{savings.toFixed(2)}</p>
        <p className="info">10% de tu presupuesto guardado para emergencias</p>
      </div>
    </div>
  );
};

export default BudgetSummary;