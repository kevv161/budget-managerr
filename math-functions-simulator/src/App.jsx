import { useState } from 'react'
import './App.css'
import LogarithmicSimulator from './components/LogarithmicSimulator'
import TrigonometricSimulator from './components/TrigonometricSimulator'
import InterpolationSimulator from './components/InterpolationSimulator'
import EquationSystemSolver from './components/EquationSystemSolver'
import PolynomialSimulator from './components/PolynomialSimulator'

function App() {
	const [activeTab, setActiveTab] = useState('logarithmic')

	const tabs = [
		{ id: 'logarithmic', label: 'Logaritmos', component: LogarithmicSimulator },
		{ id: 'trigonometric', label: 'Trigonométricas', component: TrigonometricSimulator },
		{ id: 'interpolation', label: 'Interpolación', component: InterpolationSimulator },
		{ id: 'equations', label: 'Sistemas de Ecuaciones', component: EquationSystemSolver },
		{ id: 'polynomial', label: 'Polinomios', component: PolynomialSimulator }
	]

	const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

	return (
		<div className="app">
			<header className="app-header">
				<h1>Simulador de Funciones Matemáticas</h1>
				<p>Explora gráficas interactivas de funciones matemáticas</p>
			</header>
			
			<nav className="tab-navigation">
				{tabs.map(tab => (
					<button
						key={tab.id}
						className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
						onClick={() => setActiveTab(tab.id)}
					>
						{tab.label}
					</button>
				))}
			</nav>

			<main className="main-content">
				{ActiveComponent && <ActiveComponent />}
			</main>
		</div>
	)
}

export default App
