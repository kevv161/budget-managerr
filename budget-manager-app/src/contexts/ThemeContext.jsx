import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState(() => {
		// Check localStorage for saved theme preference
		const savedTheme = localStorage.getItem('budget-manager-theme');
		return savedTheme || 'light';
	});

	const toggleTheme = () => {
		setTheme((prevTheme) => {
			const newTheme = prevTheme === 'light' ? 'dark' : 'light';
			localStorage.setItem('budget-manager-theme', newTheme);
			return newTheme;
		});
	};

	// Apply theme to document body
	useEffect(() => {
		document.body.className = theme;
	}, [theme]);

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};
