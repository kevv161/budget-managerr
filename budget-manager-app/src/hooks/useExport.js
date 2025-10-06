import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from './useCurrency';
import { convertCurrency, formatCurrency, CURRENCIES } from '../utils/currencyConverter';

export const useExport = () => {
	const { currentUser } = useAuth();
	const { selectedCurrency, convertAmount, getCurrencySymbol, getCurrencyName } = useCurrency();

	// Función para formatear montos con la moneda preferida
	const formatAmount = (amount) => {
		const convertedAmount = convertAmount(amount);
		const symbol = getCurrencySymbol();
		return `${symbol}${convertedAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
	};

	const exportToExcel = (budget, expenses, totalExpenses, savings, emergencyFund, remaining) => {
		if (!currentUser) {
			alert('Debes estar logueado para exportar los datos');
			return;
		}

		try {
			// Crear un nuevo libro de trabajo
			const workbook = XLSX.utils.book_new();

			// Hoja 1: Información del usuario y resumen
			const userData = [
				['Información del Usuario'],
				['Email:', currentUser.email],
				['Fecha de Exportación:', new Date().toLocaleDateString('es-ES')],
				['Moneda de Exportación:', getCurrencyName()],
				[''],
				['Resumen Financiero'],
				['Presupuesto Total:', formatAmount(budget)],
				['Total de Gastos:', formatAmount(totalExpenses)],
				['Fondo de Emergencia (10%):', formatAmount(emergencyFund)],
				['Ahorros:', formatAmount(savings)],
				['Presupuesto Restante:', formatAmount(remaining)]
			];

			const userSheet = XLSX.utils.aoa_to_sheet(userData);
			XLSX.utils.book_append_sheet(workbook, userSheet, 'Resumen');

			// Hoja 2: Detalle de gastos
			if (expenses.length > 0) {
				const expensesData = [
					['Descripción', 'Monto', 'Categoría', 'Es Fijo', 'Fecha de Creación']
				];

				expenses.forEach(expense => {
					expensesData.push([
						expense.description,
						formatAmount(expense.amount),
						expense.category,
						expense.isFixed ? 'Sí' : 'No',
						expense.createdAt ? new Date(expense.createdAt.seconds * 1000).toLocaleDateString('es-ES') : 'N/A'
					]);
				});

				const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
				XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Gastos');
			}

			// Generar el archivo Excel usando file-saver
			const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
			const blob = new Blob([excelBuffer], { 
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
			});
			
			const fileName = `presupuesto_${currentUser.email}_${new Date().toISOString().split('T')[0]}.xlsx`;
			saveAs(blob, fileName);

		} catch (error) {
			console.error('Error al exportar a Excel:', error);
			alert('Error al exportar el archivo Excel. Por favor, inténtalo de nuevo.');
		}
	};

	const exportToWord = async (budget, expenses, totalExpenses, savings, emergencyFund, remaining) => {
		if (!currentUser) {
			alert('Debes estar logueado para exportar los datos');
			return;
		}

		try {
			// Crear el array de children completo desde el principio
			const documentChildren = [
				// Título principal
				new Paragraph({
					children: [
						new TextRun({
							text: "Reporte de Presupuesto Personal",
							bold: true,
							size: 32,
							color: "366092"
						})
					],
					alignment: AlignmentType.CENTER,
					spacing: { after: 400 }
				}),

				// Información del usuario
				new Paragraph({
					children: [
						new TextRun({
							text: "Información del Usuario",
							bold: true,
							size: 24,
							color: "366092"
						})
					],
					spacing: { before: 200, after: 200 }
				}),

				// Tabla de información del usuario
				new Table({
					width: {
						size: 100,
						type: WidthType.PERCENTAGE,
					},
					rows: [
						new TableRow({
							children: [
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ text: "Email:", bold: true })]
									})],
									width: { size: 30, type: WidthType.PERCENTAGE }
								}),
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ text: currentUser.email })]
									})],
									width: { size: 70, type: WidthType.PERCENTAGE }
								})
							]
						}),
						new TableRow({
							children: [
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ text: "Fecha de Exportación:", bold: true })]
									})],
									width: { size: 30, type: WidthType.PERCENTAGE }
								}),
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ text: new Date().toLocaleDateString('es-ES') })]
									})],
									width: { size: 70, type: WidthType.PERCENTAGE }
								})
							]
						}),
						new TableRow({
							children: [
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ text: "Moneda de Exportación:", bold: true })]
									})],
									width: { size: 30, type: WidthType.PERCENTAGE }
								}),
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ text: getCurrencyName() })]
									})],
									width: { size: 70, type: WidthType.PERCENTAGE }
								})
							]
						})
					]
				}),

				// Espacio
				new Paragraph({
					children: [new TextRun({ text: "" })],
					spacing: { after: 300 }
				}),

				// Resumen financiero
				new Paragraph({
					children: [
						new TextRun({
							text: "Resumen Financiero",
							bold: true,
							size: 24,
							color: "70AD47"
						})
					],
					spacing: { before: 200, after: 200 }
				}),

				// Tabla de resumen financiero
				new Table({
					width: {
						size: 100,
						type: WidthType.PERCENTAGE,
					},
					rows: [
						new TableRow({
							children: [
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ text: "Presupuesto Total:", bold: true })]
									})],
									width: { size: 50, type: WidthType.PERCENTAGE }
								}),
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ 
											text: formatAmount(budget),
											bold: true,
											color: "366092"
										})]
									})],
									width: { size: 50, type: WidthType.PERCENTAGE }
								})
							]
						}),
						new TableRow({
							children: [
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ text: "Total de Gastos:", bold: true })]
									})],
									width: { size: 50, type: WidthType.PERCENTAGE }
								}),
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ 
											text: formatAmount(totalExpenses),
											bold: true,
											color: "D32F2F"
										})]
									})],
									width: { size: 50, type: WidthType.PERCENTAGE }
								})
							]
						}),
						new TableRow({
							children: [
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ text: "Fondo de Emergencia (10%):", bold: true })]
									})],
									width: { size: 50, type: WidthType.PERCENTAGE }
								}),
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ 
											text: formatAmount(emergencyFund),
											bold: true,
											color: "FF9800"
										})]
									})],
									width: { size: 50, type: WidthType.PERCENTAGE }
								})
							]
						}),
						new TableRow({
							children: [
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ text: "Ahorros:", bold: true })]
									})],
									width: { size: 50, type: WidthType.PERCENTAGE }
								}),
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ 
											text: formatAmount(savings),
											bold: true,
											color: "4CAF50"
										})]
									})],
									width: { size: 50, type: WidthType.PERCENTAGE }
								})
							]
						}),
						new TableRow({
							children: [
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ text: "Presupuesto Restante:", bold: true })]
									})],
									width: { size: 50, type: WidthType.PERCENTAGE }
								}),
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ 
											text: formatAmount(remaining),
											bold: true,
											color: remaining >= 0 ? "4CAF50" : "D32F2F"
										})]
									})],
									width: { size: 50, type: WidthType.PERCENTAGE }
								})
							]
						})
					]
				}),

				// Espacio
				new Paragraph({
					children: [new TextRun({ text: "" })],
					spacing: { after: 300 }
				})
			];

			// Agregar sección de gastos si existen
			if (expenses.length > 0) {
				// Título de gastos
				documentChildren.push(
					new Paragraph({
						children: [
							new TextRun({
								text: "Detalle de Gastos",
								bold: true,
								size: 24,
								color: "366092"
							})
						],
						spacing: { before: 200, after: 200 }
					})
				);

				// Crear tabla de gastos
				const expenseRows = [
					// Encabezados
					new TableRow({
						children: [
							new TableCell({
								children: [new Paragraph({
									children: [new TextRun({ text: "Descripción", bold: true, color: "FFFFFF" })]
								})],
								width: { size: 30, type: WidthType.PERCENTAGE },
								shading: { fill: "366092" }
							}),
							new TableCell({
								children: [new Paragraph({
									children: [new TextRun({ text: "Monto", bold: true, color: "FFFFFF" })]
								})],
								width: { size: 15, type: WidthType.PERCENTAGE },
								shading: { fill: "366092" }
							}),
							new TableCell({
								children: [new Paragraph({
									children: [new TextRun({ text: "Categoría", bold: true, color: "FFFFFF" })]
								})],
								width: { size: 20, type: WidthType.PERCENTAGE },
								shading: { fill: "366092" }
							}),
							new TableCell({
								children: [new Paragraph({
									children: [new TextRun({ text: "Es Fijo", bold: true, color: "FFFFFF" })]
								})],
								width: { size: 15, type: WidthType.PERCENTAGE },
								shading: { fill: "366092" }
							}),
							new TableCell({
								children: [new Paragraph({
									children: [new TextRun({ text: "Fecha", bold: true, color: "FFFFFF" })]
								})],
								width: { size: 20, type: WidthType.PERCENTAGE },
								shading: { fill: "366092" }
							})
						]
					})
				];

				// Agregar filas de gastos
				expenses.forEach((expense, index) => {
					const isEven = index % 2 === 0;
					expenseRows.push(
						new TableRow({
							children: [
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ text: expense.description })]
									})],
									width: { size: 30, type: WidthType.PERCENTAGE },
									shading: { fill: isEven ? "F8F9FA" : "FFFFFF" }
								}),
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ 
											text: formatAmount(expense.amount),
											bold: true
										})]
									})],
									width: { size: 15, type: WidthType.PERCENTAGE },
									shading: { fill: isEven ? "F8F9FA" : "FFFFFF" }
								}),
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ text: expense.category })]
									})],
									width: { size: 20, type: WidthType.PERCENTAGE },
									shading: { fill: isEven ? "F8F9FA" : "FFFFFF" }
								}),
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ text: expense.isFixed ? 'Sí' : 'No' })]
									})],
									width: { size: 15, type: WidthType.PERCENTAGE },
									shading: { fill: isEven ? "F8F9FA" : "FFFFFF" }
								}),
								new TableCell({
									children: [new Paragraph({
										children: [new TextRun({ 
											text: expense.createdAt ? 
												new Date(expense.createdAt.seconds * 1000).toLocaleDateString('es-ES') : 
												'N/A'
										})]
									})],
									width: { size: 20, type: WidthType.PERCENTAGE },
									shading: { fill: isEven ? "F8F9FA" : "FFFFFF" }
								})
							]
						})
					);
				});

				// Agregar tabla de gastos al documento
				documentChildren.push(
					new Table({
						width: {
							size: 100,
							type: WidthType.PERCENTAGE,
						},
						rows: expenseRows
					})
				);
			}

			// Crear el documento Word con todos los children
			const doc = new Document({
				sections: [{
					properties: {},
					children: documentChildren
				}]
			});

			// Generar y descargar el archivo
			const blob = await Packer.toBlob(doc);
			
			const fileName = `presupuesto_${currentUser.email}_${new Date().toISOString().split('T')[0]}.docx`;
			saveAs(blob, fileName);

		} catch (error) {
			console.error('Error al exportar a Word:', error);
			alert('Error al exportar el documento. Por favor, inténtalo de nuevo.');
		}
	};

	const exportToPDF = (budget, expenses, totalExpenses, savings, emergencyFund, remaining) => {
		if (!currentUser) {
			alert('Debes estar logueado para exportar los datos');
			return;
		}

		try {
			// Crear nuevo documento PDF
			const doc = new jsPDF();
			
			// Configurar colores (usando arrays RGB)
			const colors = {
				primary: [54, 96, 146],    // Azul principal
				success: [112, 173, 71],   // Verde
				danger: [211, 47, 47],     // Rojo
				warning: [255, 152, 0],    // Naranja
				light: [248, 249, 250],    // Gris claro
				white: [255, 255, 255],    // Blanco
				black: [0, 0, 0]           // Negro
			};

			// Título principal
			doc.setFontSize(24);
			doc.setTextColor(...colors.primary);
			doc.setFont(undefined, 'bold');
			doc.text('Reporte de Presupuesto Personal', 105, 30, { align: 'center' });

			// Información del usuario
			doc.setFontSize(16);
			doc.setTextColor(...colors.primary);
			doc.setFont(undefined, 'bold');
			doc.text('Información del Usuario', 20, 50);

			// Tabla de información del usuario
			autoTable(doc, {
				startY: 60,
				head: [['Campo', 'Valor']],
				body: [
					['Email', currentUser.email],
					['Fecha de Exportación', new Date().toLocaleDateString('es-ES')],
					['Moneda de Exportación', getCurrencyName()]
				],
				theme: 'grid',
				headStyles: {
					fillColor: colors.primary,
					textColor: colors.white,
					fontStyle: 'bold'
				},
				bodyStyles: {
					fontSize: 10
				},
				columnStyles: {
					0: { cellWidth: 40 },
					1: { cellWidth: 60 }
				}
			});

			// Resumen financiero
			doc.setFontSize(16);
			doc.setTextColor(...colors.success);
			doc.setFont(undefined, 'bold');
			doc.text('Resumen Financiero', 20, 100);

			// Tabla de resumen financiero
			const summaryData = [
				['Presupuesto Total', formatAmount(budget)],
				['Total de Gastos', formatAmount(totalExpenses)],
				['Fondo de Emergencia (10%)', formatAmount(emergencyFund)],
				['Ahorros', formatAmount(savings)],
				['Presupuesto Restante', formatAmount(remaining)]
			];

			autoTable(doc, {
				startY: 110,
				head: [['Concepto', 'Monto']],
				body: summaryData,
				theme: 'grid',
				headStyles: {
					fillColor: colors.success,
					textColor: colors.white,
					fontStyle: 'bold'
				},
				bodyStyles: {
					fontSize: 10
				},
				columnStyles: {
					0: { cellWidth: 60, fontStyle: 'bold' },
					1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
				}
			});

			// Detalle de gastos
			if (expenses.length > 0) {
				doc.setFontSize(16);
				doc.setTextColor(...colors.primary);
				doc.setFont(undefined, 'bold');
				doc.text('Detalle de Gastos', 20, 180);

				// Preparar datos de gastos
				const expensesData = expenses.map(expense => [
					expense.description,
					formatAmount(expense.amount),
					expense.category,
					expense.isFixed ? 'Sí' : 'No',
					expense.createdAt ? new Date(expense.createdAt.seconds * 1000).toLocaleDateString('es-ES') : 'N/A'
				]);

				autoTable(doc, {
					startY: 190,
					head: [['Descripción', 'Monto', 'Categoría', 'Es Fijo', 'Fecha']],
					body: expensesData,
					theme: 'grid',
					headStyles: {
						fillColor: colors.primary,
						textColor: colors.white,
						fontStyle: 'bold'
					},
					bodyStyles: {
						fontSize: 9
					},
					columnStyles: {
						0: { cellWidth: 50 },
						1: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
						2: { cellWidth: 30 },
						3: { cellWidth: 20, halign: 'center' },
						4: { cellWidth: 25, halign: 'center' }
					},
					alternateRowStyles: {
						fillColor: colors.light
					}
				});
			}

			// Pie de página
			const pageCount = doc.internal.getNumberOfPages();
			for (let i = 1; i <= pageCount; i++) {
				doc.setPage(i);
				doc.setFontSize(8);
				doc.setTextColor(128, 128, 128);
				doc.text(`Página ${i} de ${pageCount}`, 20, doc.internal.pageSize.height - 10);
				doc.text('Budget Manager App © 2025', doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10);
			}

			// Descargar el archivo
			const fileName = `presupuesto_${currentUser.email}_${new Date().toISOString().split('T')[0]}.pdf`;
			doc.save(fileName);

		} catch (error) {
			console.error('Error al exportar a PDF:', error);
			alert('Error al exportar el documento PDF. Por favor, inténtalo de nuevo.');
		}
	};

	return { exportToExcel, exportToWord, exportToPDF };
};
