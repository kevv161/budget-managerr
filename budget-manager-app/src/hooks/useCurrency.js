import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../Data/firebase';
import { useAuth } from '../contexts/AuthContext';
import { convertCurrency, formatCurrency, CURRENCIES } from '../utils/currencyConverter';

export const useCurrency = () => {
	const [selectedCurrency, setSelectedCurrency] = useState('GTQ');
	const [loading, setLoading] = useState(true);
	const { currentUser } = useAuth();

	// Cargar preferencia de moneda del usuario
	useEffect(() => {
		if (!currentUser) {
			setLoading(false);
			return;
		}

		const loadCurrencyPreference = async () => {
			try {
				const userRef = doc(db, 'users', currentUser.uid);
				const userSnap = await getDoc(userRef);

				if (userSnap.exists()) {
					const userData = userSnap.data();
					const preferredCurrency = userData.preferredCurrency || 'GTQ';
					setSelectedCurrency(preferredCurrency);
				} else {
					// Crear documento de usuario si no existe
					await setDoc(userRef, {
						preferredCurrency: 'GTQ',
						createdAt: new Date()
					});
					setSelectedCurrency('GTQ');
				}
			} catch (error) {
				console.error('Error loading currency preference:', error);
				setSelectedCurrency('GTQ');
			} finally {
				setLoading(false);
			}
		};

		loadCurrencyPreference();
	}, [currentUser]);

	// Guardar preferencia de moneda
	const saveCurrencyPreference = async (currency) => {
		if (!currentUser) return;

		try {
			const userRef = doc(db, 'users', currentUser.uid);
			await updateDoc(userRef, { preferredCurrency: currency });
			setSelectedCurrency(currency);
		} catch (error) {
			console.error('Error saving currency preference:', error);
		}
	};

	// Convertir cantidad de GTQ a la moneda seleccionada
	const convertAmount = (amount) => {
		if (selectedCurrency === 'GTQ') return amount;
		return convertCurrency(amount, 'GTQ', selectedCurrency);
	};

	// Formatear cantidad con el símbolo de la moneda seleccionada
	const formatAmount = (amount) => {
		const convertedAmount = convertAmount(amount);
		return formatCurrency(convertedAmount, selectedCurrency);
	};

	// Obtener el símbolo de la moneda actual
	const getCurrencySymbol = () => {
		return CURRENCIES[selectedCurrency]?.symbol || 'Q';
	};

	// Obtener el nombre de la moneda actual
	const getCurrencyName = () => {
		return CURRENCIES[selectedCurrency]?.name || 'Quetzales';
	};

	return {
		selectedCurrency,
		loading,
		saveCurrencyPreference,
		convertAmount,
		formatAmount,
		getCurrencySymbol,
		getCurrencyName,
		CURRENCIES
	};
};
