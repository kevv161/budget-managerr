import { useState, useEffect, useRef } from 'react'
import * as math from 'mathjs'
import functionPlot from 'function-plot'

const PolynomialSimulator = () => {
	const [degree, setDegree] = useState(2)
	const [coefficients, setCoefficients] = useState([1, 0, -1]) // x^2 - 1
	const [domain, setDomain] = useState({ min: -5, max: 5 })
	const [showDerivative, setShowDerivative] = useState(false)
	const [showIntegral, setShowIntegral] = useState(false)
	const [roots, setRoots] = useState([])
	const plotRef = useRef(null)

	useEffect(() => {
		// Update coefficients when degree changes
		const newCoefficients = new Array(degree + 1).fill(0)
		// Copy existing coefficients
		coefficients.forEach((coeff, index) => {
			if (index < newCoefficients.length) {
				newCoefficients[index] = coeff
			}
		})
		setCoefficients(newCoefficients)
	}, [degree])

	useEffect(() => {
		calculateRoots()
	}, [coefficients])

	const generatePolynomialFunction = () => {
		let equation = ''
		for (let i = degree; i >= 0; i--) {
			const coeff = coefficients[i] || 0
			if (coeff !== 0) {
				if (equation && coeff > 0) equation += '+'
				if (i === 0) {
					equation += coeff
				} else if (i === 1) {
					equation += `${coeff}x`
				} else {
					equation += `${coeff}x^${i}`
				}
			}
		}
		return equation || '0'
	}

	const calculateDerivative = () => {
		let derivative = ''
		for (let i = degree; i >= 1; i--) {
			const coeff = coefficients[i] || 0
			if (coeff !== 0) {
				const newCoeff = coeff * i
				if (derivative && newCoeff > 0) derivative += '+'
				if (i === 1) {
					derivative += newCoeff
				} else {
					derivative += `${newCoeff}x^${i-1}`
				}
			}
		}
		return derivative || '0'
	}

	const calculateIntegral = () => {
		let integral = ''
		for (let i = degree; i >= 0; i--) {
			const coeff = coefficients[i] || 0
			if (coeff !== 0) {
				if (integral && coeff > 0) integral += '+'
				const newCoeff = coeff / (i + 1)
				integral += `${newCoeff}x^${i+1}`
			}
		}
		integral += '+C'
		return integral
	}

	const calculateRoots = () => {
		try {
			const equation = generatePolynomialFunction()
			if (equation === '0') {
				setRoots([])
				return
			}

			// For polynomials of degree 2, use quadratic formula
			if (degree === 2) {
				const a = coefficients[2] || 0
				const b = coefficients[1] || 0
				const c = coefficients[0] || 0
				
				if (a === 0) {
					if (b !== 0) {
						setRoots([-c / b])
					} else {
						setRoots([])
					}
					return
				}

				const discriminant = b * b - 4 * a * c
				if (discriminant >= 0) {
					const root1 = (-b + Math.sqrt(discriminant)) / (2 * a)
					const root2 = (-b - Math.sqrt(discriminant)) / (2 * a)
					setRoots([root1, root2])
				} else {
					setRoots([])
				}
			} else {
				// For higher degree polynomials, use numerical methods
				const roots = []
				const step = 0.1
				const tolerance = 0.001
				
				for (let x = domain.min; x <= domain.max; x += step) {
					const y1 = evaluatePolynomial(x)
					const y2 = evaluatePolynomial(x + step)
					
					if (Math.abs(y1) < tolerance) {
						roots.push(x)
					} else if (y1 * y2 < 0) {
						// Sign change, find root by bisection
						let left = x
						let right = x + step
						while (right - left > tolerance) {
							const mid = (left + right) / 2
							const yMid = evaluatePolynomial(mid)
							if (y1 * yMid < 0) {
								right = mid
							} else {
								left = mid
							}
						}
						roots.push((left + right) / 2)
					}
				}
				
				setRoots(roots)
			}
		} catch (error) {
			console.error('Error calculating roots:', error)
			setRoots([])
		}
	}

	const evaluatePolynomial = (x) => {
		let result = 0
		for (let i = 0; i <= degree; i++) {
			result += (coefficients[i] || 0) * Math.pow(x, i)
		}
		return result
	}

	useEffect(() => {
		if (plotRef.current) {
			const data = []
			const equation = generatePolynomialFunction()
			
			// Main polynomial
			data.push({
				fn: equation,
				range: [domain.min, domain.max],
				graphType: 'polyline'
			})

			// Derivative
			if (showDerivative) {
				const derivative = calculateDerivative()
				data.push({
					fn: derivative,
					range: [domain.min, domain.max],
					graphType: 'polyline',
					color: 'red'
				})
			}

			// Integral (approximate)
			if (showIntegral) {
				// For visualization, we'll show the indefinite integral
				const integral = calculateIntegral()
				data.push({
					fn: integral.replace('+C', ''),
					range: [domain.min, domain.max],
					graphType: 'polyline',
					color: 'green'
				})
			}

			// Roots
			if (roots.length > 0) {
				data.push({
					points: roots.map(root => [root, 0]),
					fnType: 'points',
					graphType: 'scatter',
					color: 'blue'
				})
			}

			functionPlot({
				target: plotRef.current,
				width: 600,
				height: 400,
				grid: true,
				xAxis: { label: 'x' },
				yAxis: { label: 'y' },
				data: data
			})
		}
	}, [coefficients, domain, showDerivative, showIntegral, roots])

	const updateCoefficient = (index, value) => {
		const newCoefficients = [...coefficients]
		newCoefficients[index] = parseFloat(value) || 0
		setCoefficients(newCoefficients)
	}

	return (
		<div className="simulator-container">
			<div className="controls-panel">
				<h2>Simulador de Funciones Polinomiales</h2>
				
				<div className="control-group">
					<label>
						Grado del polinomio: 
						<select value={degree} onChange={(e) => setDegree(parseInt(e.target.value))}>
							<option value={1}>Lineal (grado 1)</option>
							<option value={2}>Cuadrático (grado 2)</option>
							<option value={3}>Cúbico (grado 3)</option>
							<option value={4}>Cuártico (grado 4)</option>
							<option value={5}>Quíntico (grado 5)</option>
						</select>
					</label>
				</div>

				<div className="coefficients-section">
					<h3>Coefficientes:</h3>
					<div className="coefficients-grid">
						{coefficients.map((coeff, index) => (
							<div key={index} className="coefficient-input">
								<label>
									x^{index}:
									<input
										type="number"
										value={coeff}
										onChange={(e) => updateCoefficient(index, e.target.value)}
										step="0.1"
									/>
								</label>
							</div>
						))}
					</div>
				</div>

				<div className="domain-controls">
					<div className="control-group">
						<label>
							Dominio mínimo: 
							<input
								type="number"
								value={domain.min}
								onChange={(e) => setDomain(prev => ({ ...prev, min: parseFloat(e.target.value) || -5 }))}
								step="0.1"
							/>
						</label>
					</div>

					<div className="control-group">
						<label>
							Dominio máximo: 
							<input
								type="number"
								value={domain.max}
								onChange={(e) => setDomain(prev => ({ ...prev, max: parseFloat(e.target.value) || 5 }))}
								step="0.1"
							/>
						</label>
					</div>
				</div>

				<div className="display-options">
					<label>
						<input
							type="checkbox"
							checked={showDerivative}
							onChange={(e) => setShowDerivative(e.target.checked)}
						/>
						Mostrar derivada
					</label>
					<label>
						<input
							type="checkbox"
							checked={showIntegral}
							onChange={(e) => setShowIntegral(e.target.checked)}
						/>
						Mostrar integral
					</label>
				</div>

				<div className="function-info">
					<h3>Información del polinomio:</h3>
					<p><strong>Función:</strong> f(x) = {generatePolynomialFunction()}</p>
					
					{showDerivative && (
						<p><strong>Derivada:</strong> f'(x) = {calculateDerivative()}</p>
					)}
					
					{showIntegral && (
						<p><strong>Integral:</strong> ∫f(x)dx = {calculateIntegral()}</p>
					)}
					
					{roots.length > 0 && (
						<div className="roots-info">
							<p><strong>Raíces:</strong></p>
							<ul>
								{roots.map((root, index) => (
									<li key={index}>x = {root.toFixed(3)}</li>
								))}
							</ul>
						</div>
					)}
					
					<div className="calculation">
						<label>
							Calcular f(x) para x = 
							<input
								type="number"
								id="calcX"
								step="0.1"
								placeholder="Ingresa un valor"
							/>
							<button onClick={() => {
								const x = parseFloat(document.getElementById('calcX').value)
								if (!isNaN(x)) {
									const result = evaluatePolynomial(x)
									alert(`f(${x}) = ${result.toFixed(3)}`)
								}
							}}>
								Calcular
							</button>
						</label>
					</div>
				</div>
			</div>

			<div className="plot-container">
				<h3>Gráfica del polinomio</h3>
				<div className="legend">
					{showDerivative && <span className="legend-item">🔴 Derivada</span>}
					{showIntegral && <span className="legend-item">🟢 Integral</span>}
					{roots.length > 0 && <span className="legend-item">🔵 Raíces</span>}
				</div>
				<div ref={plotRef} className="function-plot"></div>
			</div>
		</div>
	)
}

export default PolynomialSimulator
