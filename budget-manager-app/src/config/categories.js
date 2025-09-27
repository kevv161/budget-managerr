// Configuración centralizada de categorías
export const CATEGORIES = [
	{ id: 'streaming', name: 'Streaming', isFixed: true, icon: '📺' },
	{ id: 'compras', name: 'Compras', isFixed: true, icon: '🛒' },
	{ id: 'agua', name: 'Agua', isFixed: true, icon: '💧' },
	{ id: 'internet', name: 'Internet', isFixed: true, icon: '🌐' },
	{ id: 'luz', name: 'Electricidad/Luz', isFixed: true, icon: '⚡' },
	{ id: 'otros', name: 'Otros', isFixed: false, icon: '📝' }
];

// Helper functions para obtener información de categorías
export const getCategoryById = (categoryId) => {
	return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES.find(cat => cat.id === 'otros');
};

export const getCategoryIcon = (categoryId) => {
	return getCategoryById(categoryId).icon;
};

export const getCategoryName = (categoryId) => {
	return getCategoryById(categoryId).name;
};

export const getCategoryIsFixed = (categoryId) => {
	return getCategoryById(categoryId).isFixed;
};
