import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreBudget } from '../hooks/useFirestoreBudget';
import { useCurrency } from '../hooks/useCurrency';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DotSpinner } from 'ldrs/react'
import 'ldrs/react/DotSpinner.css'

function BudgetHistory() {
	const navigate = useNavigate();
	const { logout } = useAuth();
	const {
		budgets,
		expenses,
		loading,
		getCurrentMonthKey,
		setBudgetAmount
	} = useFirestoreBudget();

	const {
		selectedCurrency,
		getCurrencyName
	} = useCurrency();

	const [filteredBudgets, setFilteredBudgets] = useState([]);
	const [selectedMonth, setSelectedMonth] = useState('');
	const [editingBudget, setEditingBudget] = useState(null);
	const [editAmount, setEditAmount] = useState('');

	// Filtrar presupuestos por mes seleccionado
	useEffect(() => {
		if (selectedMonth) {
			const filtered = budgets.filter(budget => budget.monthKey === selectedMonth);
			setFilteredBudgets(filtered);
		} else {
			setFilteredBudgets(budgets);
		}
	}, [budgets, selectedMonth]);

	// Obtener gastos para un mes específico
	const getExpensesForMonth = (monthKey) => {
		return expenses.filter(expense => {
			const expenseDate = expense.createdAt?.toDate ? expense.createdAt.toDate() : new Date(expense.createdAt);
			const expenseMonthKey = format(expenseDate, 'yyyy-MM');
			return expenseMonthKey === monthKey;
		});
	};

	// Calcular estadísticas para un presupuesto
	const calculateBudgetStats = (budget) => {
		const monthExpenses = getExpensesForMonth(budget.monthKey);
		const totalExpenses = monthExpenses.reduce((total, expense) => total + (expense.amount || 0), 0);
		const remaining = budget.amount - totalExpenses;
		const emergencyFund = budget.amount * 0.1;
		const savings = remaining > emergencyFund ? remaining - emergencyFund : 0;
		
		return {
			totalExpenses,
			remaining,
			emergencyFund,
			savings,
			expenseCount: monthExpenses.length
		};
	};

	// Obtener meses únicos para el filtro
	const getUniqueMonths = () => {
		const months = budgets.map(budget => budget.monthKey).filter((value, index, self) => self.indexOf(value) === index);
		return months.sort();
	};

	const handleLogout = async () => {
		try {
			await logout();
		} finally {
			navigate('/login');
		}
	};

	const getCurrentMonthName = () => {
		const now = new Date();
		return format(now, 'MMMM yyyy', { locale: es });
	};

	const formatMonthName = (monthKey) => {
		try {
			const date = parseISO(monthKey + '-01');
			return format(date, 'MMMM yyyy', { locale: es });
		} catch (error) {
			return monthKey;
		}
	};

	const getBudgetStatus = (budget) => {
		const stats = calculateBudgetStats(budget);
		if (stats.remaining < 0) return { status: 'over-budget', color: '#f44336', text: 'Sobre presupuesto' };
		if (stats.remaining < stats.emergencyFund) return { status: 'low', color: '#ff9800', text: 'Presupuesto bajo' };
		return { status: 'good', color: '#4caf50', text: 'En buen estado' };
	};

	// Función para iniciar la edición de un presupuesto
	const handleEditBudget = (budget) => {
		setEditingBudget(budget);
		setEditAmount(budget.amount.toString());
	};

	// Función para cancelar la edición
	const handleCancelEdit = () => {
		setEditingBudget(null);
		setEditAmount('');
	};

	// Función para guardar los cambios del presupuesto
	const handleSaveBudget = async () => {
		if (!editingBudget || !editAmount) return;

		const amount = parseFloat(editAmount);
		if (isNaN(amount) || amount <= 0) {
			alert('Por favor ingrese un monto válido');
			return;
		}

		try {
			// Actualizar solo el presupuesto del mes específico
			await setBudgetAmount(amount, [editingBudget.monthKey]);
			setEditingBudget(null);
			setEditAmount('');
		} catch (error) {
			console.error('Error updating budget:', error);
			alert('Error al actualizar el presupuesto');
		}
	};

	if (loading) {
		return (
			<div style={{ textAlign: 'center', padding: '40px' }}>
				<DotSpinner
					size="40"
					speed="0.9"
					color="black" 
				/>
				<p>Cargando historial de presupuestos...</p>
			</div>
		);
	}

	return (
		<>
			<div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 16px' }}>
				<header className="app-header home-header">
					<div className="header-content">
						<div className="header-info">
							<h1>Historial de Presupuestos</h1>
							<p className="current-month">
								Mes actual: {getCurrentMonthName()}
							</p>
						</div>
						<div className="header-actions">
							<button 
								className="btn-secondary btn-mobile" 
								onClick={() => navigate('/home')}
								style={{ marginRight: '8px' }}
							>
								<span className="btn-text">Volver al Inicio</span>
								<span className="btn-icon">🏠</span>
							</button>
							<button 
								className="btn-secondary btn-mobile" 
								onClick={handleLogout}
							>
								<span className="btn-text">Cerrar sesión</span>
								<span className="btn-icon">🚪</span>
							</button>
						</div>
					</div>
				</header>

				<main className="app-main" style={{ paddingTop: '8px' }}>
					{/* Información sobre edición */}
					<div style={{ 
						backgroundColor: '#e8f5e8', 
						border: '1px solid #4caf50', 
						borderRadius: '8px', 
						padding: '12px', 
						marginBottom: '20px' 
					}}>
						<h4 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>
							✏️ Edición Individual de Presupuestos
						</h4>
						<p style={{ margin: '0', color: '#2e7d32', fontSize: '14px' }}>
							Puedes modificar el presupuesto de cualquier mes individualmente usando el botón "Editar" en cada tarjeta. 
							Esto te permite ajustar presupuestos específicos sin afectar los demás meses.
						</p>
					</div>

					{/* Filtro por mes */}
					<div style={{ marginBottom: '20px' }}>
						<label htmlFor="month-filter" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
							Filtrar por mes:
						</label>
						<select
							id="month-filter"
							value={selectedMonth}
							onChange={(e) => setSelectedMonth(e.target.value)}
							style={{
								padding: '8px 12px',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '16px',
								minWidth: '200px'
							}}
						>
							<option value="">Todos los meses</option>
							{getUniqueMonths().map(monthKey => (
								<option key={monthKey} value={monthKey}>
									{formatMonthName(monthKey)}
								</option>
							))}
						</select>
					</div>

					{/* Lista de presupuestos */}
					{filteredBudgets.length === 0 ? (
						<div style={{ 
							textAlign: 'center', 
							padding: '40px',
							backgroundColor: '#f5f5f5',
							borderRadius: '8px'
						}}>
							<p>No hay presupuestos registrados para el filtro seleccionado.</p>
						</div>
					) : (
						<div style={{ display: 'grid', gap: '16px' }}>
							{filteredBudgets.map((budget) => {
								const stats = calculateBudgetStats(budget);
								const status = getBudgetStatus(budget);
								const isCurrentMonth = budget.monthKey === getCurrentMonthKey();
								
								return (
									<div 
										key={budget.id}
										style={{
											backgroundColor: 'white',
											border: isCurrentMonth ? '2px solid #2196f3' : '1px solid #ddd',
											borderRadius: '8px',
											padding: '20px',
											boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
										}}
									>
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
											<div>
												<h3 style={{ margin: '0 0 4px 0', color: '#333' }}>
													{formatMonthName(budget.monthKey)}
													{isCurrentMonth && <span style={{ marginLeft: '8px', fontSize: '14px', color: '#2196f3' }}>(Mes actual)</span>}
												</h3>
												{editingBudget?.id === budget.id ? (
													<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
														<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
															<span style={{ fontSize: '14px', color: '#666' }}>Nuevo presupuesto:</span>
															<span style={{ fontSize: '14px', color: '#666' }}>{getCurrencyName(selectedCurrency)}</span>
															<input
																type="number"
																value={editAmount}
																onChange={(e) => setEditAmount(e.target.value)}
																style={{
																	width: '120px',
																	padding: '4px 8px',
																	border: '1px solid #ddd',
																	borderRadius: '4px',
																	fontSize: '14px'
																}}
																step="0.01"
																min="1"
															/>
														</div>
														<button
															onClick={handleSaveBudget}
															style={{
																backgroundColor: '#4caf50',
																color: 'white',
																border: 'none',
																padding: '4px 12px',
																borderRadius: '4px',
																fontSize: '12px',
																cursor: 'pointer'
															}}
														>
															Guardar
														</button>
														<button
															onClick={handleCancelEdit}
															style={{
																backgroundColor: '#f44336',
																color: 'white',
																border: 'none',
																padding: '4px 12px',
																borderRadius: '4px',
																fontSize: '12px',
																cursor: 'pointer'
															}}
														>
															Cancelar
														</button>
													</div>
												) : (
													<p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
														Presupuesto: {getCurrencyName(selectedCurrency)} {budget.amount.toLocaleString()}
													</p>
												)}
											</div>
											<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
												{editingBudget?.id !== budget.id && (
													<button
														onClick={() => handleEditBudget(budget)}
														style={{
															backgroundColor: '#2196f3',
															color: 'white',
															border: 'none',
															padding: '6px 12px',
															borderRadius: '4px',
															fontSize: '12px',
															cursor: 'pointer',
															display: 'flex',
															alignItems: 'center',
															gap: '4px'
														}}
													>
														<span>✏️</span>
														<span>Editar</span>
													</button>
												)}
												<div style={{
													backgroundColor: status.color,
													color: 'white',
													padding: '4px 12px',
													borderRadius: '16px',
													fontSize: '12px',
													fontWeight: 'bold'
												}}>
													{status.text}
												</div>
											</div>
										</div>

										<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
											<div style={{ textAlign: 'center' }}>
												<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>
													{getCurrencyName(selectedCurrency)} {stats.totalExpenses.toLocaleString()}
												</div>
												<div style={{ fontSize: '14px', color: '#666' }}>
													Gastos ({stats.expenseCount})
												</div>
											</div>
											<div style={{ textAlign: 'center' }}>
												<div style={{ 
													fontSize: '24px', 
													fontWeight: 'bold', 
													color: stats.remaining >= 0 ? '#4caf50' : '#f44336' 
												}}>
													{getCurrencyName(selectedCurrency)} {stats.remaining.toLocaleString()}
												</div>
												<div style={{ fontSize: '14px', color: '#666' }}>
													Restante
												</div>
											</div>
											<div style={{ textAlign: 'center' }}>
												<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
													{getCurrencyName(selectedCurrency)} {stats.emergencyFund.toLocaleString()}
												</div>
												<div style={{ fontSize: '14px', color: '#666' }}>
													Fondo de emergencia
												</div>
											</div>
											<div style={{ textAlign: 'center' }}>
												<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9c27b0' }}>
													{getCurrencyName(selectedCurrency)} {stats.savings.toLocaleString()}
												</div>
												<div style={{ fontSize: '14px', color: '#666' }}>
													Ahorros
												</div>
											</div>
										</div>

										{stats.expenseCount > 0 && (
											<div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
												<h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Gastos del mes:</h4>
												<div style={{ maxHeight: '150px', overflowY: 'auto' }}>
													{getExpensesForMonth(budget.monthKey).map((expense, index) => (
														<div key={index} style={{ 
															display: 'flex', 
															justifyContent: 'space-between', 
															padding: '4px 0',
															borderBottom: index < getExpensesForMonth(budget.monthKey).length - 1 ? '1px solid #f0f0f0' : 'none'
														}}>
															<span style={{ fontSize: '14px' }}>{expense.description}</span>
															<span style={{ fontSize: '14px', fontWeight: 'bold' }}>
																{getCurrencyName(selectedCurrency)} {expense.amount.toLocaleString()}
															</span>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</main>

				<footer className="app-footer" style={{ paddingTop: '24px' }}>
					<p>Budget Manager App &copy; 2025</p>
				</footer>
			</div>
		</>
	);
}

export default BudgetHistory;
