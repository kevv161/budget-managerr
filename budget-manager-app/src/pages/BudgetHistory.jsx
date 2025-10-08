import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreBudget } from '../hooks/useFirestoreBudget';
import { useCurrency } from '../hooks/useCurrency';
import { useExport } from '../hooks/useExport';
import { format, parseISO, isAfter, startOfMonth, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { DotSpinner } from 'ldrs/react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
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

	const { exportToPDF } = useExport(selectedCurrency);

	const [filteredBudgets, setFilteredBudgets] = useState([]);
	const [selectedMonth, setSelectedMonth] = useState('');
	const [editingBudget, setEditingBudget] = useState(null);
	const [editAmount, setEditAmount] = useState('');
	const [simulatedCurrentMonth, setSimulatedCurrentMonth] = useState(null);
	const [showCharts, setShowCharts] = useState(false);

	// Construir dataset para comparativa mensual (Presupuesto vs Gastos)
	const buildMonthlyComparisonData = () => {
		// Tomamos meses únicos a partir de presupuestos
		const months = budgets
			.map(b => b.monthKey)
			.filter((value, index, self) => self.indexOf(value) === index)
			.sort();

		return months.map(monthKey => {
			const monthBudget = budgets.find(b => b.monthKey === monthKey);
			const monthExpenses = getExpensesForMonth(monthKey);
			const totalExpenses = monthExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
			return {
				monthKey,
				mes: format(parseISO(monthKey + '-01'), 'MMM yyyy', { locale: es }),
				presupuesto: monthBudget ? monthBudget.amount : 0,
				gasto: totalExpenses
			};
		});
	};

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

	// Determinar si un presupuesto puede ser exportado (cuando el mes haya terminado)
	const canExportBudget = (budgetMonthKey) => {
		// Usar el mes simulado si está disponible, sino usar el mes actual real
		const currentMonth = simulatedCurrentMonth || format(new Date(), 'yyyy-MM');
		const budgetDate = parseISO(budgetMonthKey + '-01');
		
		// El presupuesto puede ser exportado si el mes actual es posterior al mes del presupuesto
		const monthHasEnded = isAfter(parseISO(currentMonth + '-01'), budgetDate);
		
		// Considerar el ciclo de 4 meses para reposición de presupuestos
		// Los presupuestos se reponen cada 4 meses, así que solo permitir exportación
		// si el presupuesto no ha sido "reemplazado" por un nuevo ciclo
		const monthsDifference = Math.floor((parseISO(currentMonth + '-01').getTime() - budgetDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
		const withinFourMonthCycle = monthsDifference < 4;
		
		return monthHasEnded && withinFourMonthCycle;
	};

	const handleLogout = async () => {
		try {
			await logout();
		} finally {
			navigate('/login');
		}
	};

	const getCurrentMonthName = () => {
		if (simulatedCurrentMonth) {
			const simulatedDate = parseISO(simulatedCurrentMonth + '-01');
			return format(simulatedDate, 'MMMM yyyy', { locale: es }) + ' (Simulado)';
		}
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

	// Función para exportar un presupuesto específico a PDF
	const handleExportBudgetPDF = (budget) => {
		const monthExpenses = getExpensesForMonth(budget.monthKey);
		const stats = calculateBudgetStats(budget);
		
		exportToPDF(
			budget.amount,
			monthExpenses,
			stats.totalExpenses,
			stats.savings,
			stats.emergencyFund,
			stats.remaining
		);
	};

	// Función para simular el cambio de mes
	const handleSimulateMonth = (monthKey) => {
		setSimulatedCurrentMonth(monthKey);
	};

	// Función para resetear la simulación
	const handleResetSimulation = () => {
		setSimulatedCurrentMonth(null);
	};

	// Obtener opciones de meses para simulación
	const getSimulationOptions = () => {
		const currentDate = new Date();
		const currentMonth = format(currentDate, 'yyyy-MM');
		const options = [];
		
		// Agregar el mes actual
		options.push({ value: currentMonth, label: format(parseISO(currentMonth + '-01'), 'MMMM yyyy', { locale: es }) + ' (Actual)' });
		
		// Agregar los próximos 6 meses para simulación
		for (let i = 1; i <= 6; i++) {
			const futureDate = addMonths(parseISO(currentMonth + '-01'), i);
			const futureMonth = format(futureDate, 'yyyy-MM');
			options.push({ 
				value: futureMonth, 
				label: format(futureDate, 'MMMM yyyy', { locale: es }) + ' (Simulado)' 
			});
		}
		
		return options;
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
					{/* Información sobre edición y exportación */}
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
						<button
							onClick={() => setShowCharts(prev => !prev)}
							style={{
								marginLeft: '12px',
								backgroundColor: showCharts ? '#6c757d' : '#2196f3',
								color: 'white',
								border: 'none',
								padding: '8px 12px',
								borderRadius: '4px',
								fontSize: '14px',
								cursor: 'pointer'
							}}
						>
							{showCharts ? 'Ocultar gráficas' : 'Mostrar gráficas'}
						</button>
					</div>

					{/* Comparativa de gráficas: Presupuesto vs Gastos por mes */}
					{showCharts && (
						<div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
							<h3 style={{ margin: '0 0 12px 0' }}>Comparativa mensual: Presupuesto vs Gastos</h3>
							<div style={{ width: '100%', height: 360 }}>
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={(selectedMonth ? buildMonthlyComparisonData().filter(d => d.monthKey === selectedMonth) : buildMonthlyComparisonData())}
										margin={{ top: 16, right: 24, left: 8, bottom: 8 }}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="mes" />
										<YAxis />
										<Tooltip formatter={(value) => [`${getCurrencyName(selectedCurrency)} ${Number(value).toLocaleString()}`, '']} />
										<Legend />
										<Bar dataKey="presupuesto" name="Presupuesto" fill="#8884d8" />
										<Bar dataKey="gasto" name="Gasto" fill="#82ca9d" />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
					)}

					{/* Simulación de mes para pruebas */}
					<div style={{ 
						backgroundColor: '#fff3cd', 
						border: '1px solid #ffeaa7', 
						borderRadius: '8px', 
						padding: '16px', 
						marginBottom: '20px' 
					}}>
						<h4 style={{ margin: '0 0 12px 0', color: '#856404' }}>
							🧪 Simulación de Mes (Para Pruebas)
						</h4>
						<div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
							<label htmlFor="simulation-month" style={{ fontWeight: 'bold', color: '#856404' }}>
								Simular mes actual:
							</label>
							<select
								id="simulation-month"
								value={simulatedCurrentMonth || ''}
								onChange={(e) => handleSimulateMonth(e.target.value || null)}
								style={{
									padding: '6px 10px',
									border: '1px solid #ddd',
									borderRadius: '4px',
									fontSize: '14px',
									minWidth: '180px'
								}}
							>
								<option value="">Mes real actual</option>
								{getSimulationOptions().map(option => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
							{simulatedCurrentMonth && (
								<button
									onClick={handleResetSimulation}
									style={{
										backgroundColor: '#6c757d',
										color: 'white',
										border: 'none',
										padding: '6px 12px',
										borderRadius: '4px',
										fontSize: '12px',
										cursor: 'pointer'
									}}
								>
									Resetear
								</button>
							)}
						</div>
						<p style={{ margin: '8px 0 0 0', color: '#856404', fontSize: '12px' }}>
							Usa esta herramienta para simular diferentes meses y probar cuándo aparecen los botones de exportación PDF.
						</p>
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
												{canExportBudget(budget.monthKey) && (
													<button
														onClick={() => handleExportBudgetPDF(budget)}
														style={{
															backgroundColor: '#f44336',
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
														title={`Exportar presupuesto de ${formatMonthName(budget.monthKey)} a PDF`}
													>
														<span>📋</span>
														<span>Exportar PDF</span>
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
