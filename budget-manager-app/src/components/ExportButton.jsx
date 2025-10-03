import { useExport } from '../hooks/useExport';
import { useFirestoreBudget } from '../hooks/useFirestoreBudget';

const ExportButton = () => {
	const { exportToExcel, exportToWord, exportToPDF } = useExport();
	const { budget, expenses, totalExpenses, savings, emergencyFund, remaining } = useFirestoreBudget();

	const handleExportExcel = () => {
		exportToExcel(budget, expenses, totalExpenses, savings, emergencyFund, remaining);
	};

	const handleExportWord = () => {
		exportToWord(budget, expenses, totalExpenses, savings, emergencyFund, remaining);
	};

	const handleExportPDF = () => {
		exportToPDF(budget, expenses, totalExpenses, savings, emergencyFund, remaining);
	};

	return (
		<div className="export-buttons">
			<div className="export-header">
				<h3>Exportar Datos</h3>
				<div className="export-info">
					{!budget || expenses.length === 0 ? 'Agrega un presupuesto y gastos para exportar' : 'Descarga tus datos en diferentes formatos'}
				</div>
			</div>
			<div className="export-actions">
				<button 
					onClick={handleExportExcel}
					className="export-button excel-button"
					disabled={!budget || expenses.length === 0}
					title="Exportar a Excel"
				>
					<span className="btn-icon">📊</span>
					<span className="btn-text">Excel</span>
				</button>
				<button 
					onClick={handleExportWord}
					className="export-button word-button"
					disabled={!budget || expenses.length === 0}
					title="Exportar a Word"
				>
					<span className="btn-icon">📄</span>
					<span className="btn-text">Word</span>
				</button>
				<button 
					onClick={handleExportPDF}
					className="export-button pdf-button"
					disabled={!budget || expenses.length === 0}
					title="Exportar a PDF"
				>
					<span className="btn-icon">📋</span>
					<span className="btn-text">PDF</span>
				</button>
			</div>
		</div>
	);
};

export default ExportButton;
