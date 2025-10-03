export const convertCurrency = (amount, from, to) => {
	const rates = {
		GTQ: { USD: 0.13 }, // 1 Quetzal = 0.13 USD aprox
		USD: { GTQ: 7.8 } // 1 USD = 7.8 Quetzales aprox
	};

	if (from === to) return amount;
	return amount * (rates[from][to] || 1);
};

export const formatCurrency = (amount, currency) => {
	const symbols = {
		GTQ: 'Q',
		USD: '$'
	};

	const symbol = symbols[currency] || 'Q';
	return `${symbol}${amount.toFixed(2)}`;
};

export const CURRENCIES = {
	GTQ: { name: 'Quetzales', symbol: 'Q' },
	USD: { name: 'Dólares', symbol: '$' }
};
