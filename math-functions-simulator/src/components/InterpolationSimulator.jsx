import { useState, useEffect, useRef } from 'react'
import * as math from 'mathjs'
import functionPlot from 'function-plot'

const InterpolationSimulator = () => {
	const [interpolationType, setInterpolationType] = useState('linear')
	const [points, setPoints] = useState([
		{ x: 0, y: 1 },
		{ x: 1, y: 2 },
		{ x: 2, y: 4 },
		{ x: 3, y: 3 }
	])
	const [newPoint, setNewPoint] = useState({ x: '', y: '' })
	const [interpolatedFunction, setInterpolatedFunction] = useState('')
	const plotRef = useRef(null)

	const addPoint = () => {
		if (newPoint.x !== '' && newPoint.y !== '') {
			setPoints([...points, { x: parseFloat(newPoint.x), y: parseFloat(newPoint.y) }])
			setNewPoint({ x: '', y: '' })
		}
	}

	const removePoint = (index) => {
		setPoints(points.filter((_, i) => i !== index))
	}

	const linearInterpolation = (x1, y1, x2, y2) => {
		const slope = (y2 - y1) / (x2 - x1)
		const intercept = y1 - slope * x1
		return { slope, intercept, equation: `${slope.toFixed(3)}x + ${intercept.toFixed(3)}` }
	}

	const polynomialInterpolation = (points) => {
		if (points.length < 2) return null
		
		try {
			// Use mathjs to solve the system of equations for polynomial interpolation
			const n = points.length
			const A = []
			const b = []
			
			for (let i = 0; i < n; i++) {
				const row = []
				for (let j = 0; j < n; j++) {
					row.push(Math.pow(points[i].x, j))
				}
				A.push(row)
				b.push(points[i].y)
			}
			
			const coefficients = math.lusolve(A, b)
			return coefficients
		} catch (error) {
			console.error('Error in polynomial interpolation:', error)
			return null
		}
	}

	const generateInterpolatedFunction = () => {
		if (points.length < 2) return

		const sortedPoints = [...points].sort((a, b) => a.x - b.x)
		
		if (interpolationType === 'linear') {
			// Piecewise linear interpolation
			const segments = []
			for (let i = 0; i < sortedPoints.length - 1; i++) {
				const segment = linearInterpolation(
					sortedPoints[i].x, sortedPoints[i].y,
					sortedPoints[i + 1].x, sortedPoints[i + 1].y
				)
				segments.push({
					...segment,
					domain: [sortedPoints[i].x, sortedPoints[i + 1].x]
				})
			}
			setInterpolatedFunction(segments)
		} else if (interpolationType === 'polynomial') {
			const coefficients = polynomialInterpolation(sortedPoints)
			if (coefficients) {
				let equation = ''
				for (let i = 0; i < coefficients.length; i++) {
					const coeff = coefficients[i]
					if (i === 0) {
						equation += coeff.toFixed(3)
					} else {
						const sign = coeff >= 0 ? '+' : ''
						equation += `${sign}${coeff.toFixed(3)}x^${i}`
					}
				}
				setInterpolatedFunction({ equation, coefficients })
			}
		}
	}

	useEffect(() => {
		generateInterpolatedFunction()
	}, [points, interpolationType])

	useEffect(() => {
		if (plotRef.current && points.length >= 2) {
			const data = []
			
			// Add data points
			data.push({
				points: points.map(p => [p.x, p.y]),
				fnType: 'points',
				graphType: 'scatter'
			})

			// Add interpolated function
			if (interpolationType === 'linear' && Array.isArray(interpolatedFunction)) {
				interpolatedFunction.forEach(segment => {
					data.push({
						fn: `${segment.slope.toFixed(3)} * x + ${segment.intercept.toFixed(3)}`,
						range: segment.domain,
						graphType: 'polyline'
					})
				})
			} else if (interpolationType === 'polynomial' && interpolatedFunction.equation) {
				data.push({
					fn: interpolatedFunction.equation,
					range: [Math.min(...points.map(p => p.x)) - 1, Math.max(...points.map(p => p.x)) + 1],
					graphType: 'polyline'
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
	}, [points, interpolatedFunction, interpolationType])

	const calculateInterpolatedValue = (x) => {
		if (interpolationType === 'linear' && Array.isArray(interpolatedFunction)) {
			for (const segment of interpolatedFunction) {
				if (x >= segment.domain[0] && x <= segment.domain[1]) {
					return segment.slope * x + segment.intercept
				}
			}
		} else if (interpolationType === 'polynomial' && interpolatedFunction.coefficients) {
			try {
				const func = math.parse(interpolatedFunction.equation)
				const compiled = func.compile()
				return compiled.evaluate({ x })
			} catch (error) {
				return 'Error'
			}
		}
		return 'Fuera del rango'
	}

	return (
		<div className="simulator-container">
			<div className="controls-panel">
				<h2>Simulador de Interpolación</h2>
				
				<div className="control-group">
					<label>
						Tipo de interpolación: 
						<select value={interpolationType} onChange={(e) => setInterpolationType(e.target.value)}>
							<option value="linear">Lineal (por segmentos)</option>
							<option value="polynomial">Polinomial</option>
						</select>
					</label>
				</div>

				<div className="points-section">
					<h3>Puntos de datos:</h3>
					<div className="points-list">
						{points.map((point, index) => (
							<div key={index} className="point-item">
								<span>Punto {index + 1}: ({point.x}, {point.y})</span>
								<button onClick={() => removePoint(index)} className="remove-btn">
									Eliminar
								</button>
							</div>
						))}
					</div>

					<div className="add-point">
						<label>
							Agregar punto:
							<input
								type="number"
								placeholder="x"
								value={newPoint.x}
								onChange={(e) => setNewPoint(prev => ({ ...prev, x: e.target.value }))}
								step="0.1"
							/>
							<input
								type="number"
								placeholder="y"
								value={newPoint.y}
								onChange={(e) => setNewPoint(prev => ({ ...prev, y: e.target.value }))}
								step="0.1"
							/>
							<button onClick={addPoint}>Agregar</button>
						</label>
					</div>
				</div>

				{interpolatedFunction && (
					<div className="function-info">
						<h3>Función interpolada:</h3>
						{interpolationType === 'linear' && Array.isArray(interpolatedFunction) ? (
							<div>
								<p>Interpolación lineal por segmentos:</p>
								{interpolatedFunction.map((segment, index) => (
									<p key={index}>
										Segmento {index + 1}: f(x) = {segment.equation} 
										para x ∈ [{segment.domain[0]}, {segment.domain[1]}]
									</p>
								))}
							</div>
						) : (
							<p>f(x) = {interpolatedFunction.equation}</p>
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
										const result = calculateInterpolatedValue(x)
										alert(`f(${x}) = ${result}`)
									}
								}}>
									Calcular
								</button>
							</label>
						</div>
					</div>
				)}
			</div>

			<div className="plot-container">
				<h3>Gráfica de interpolación</h3>
				<div ref={plotRef} className="function-plot"></div>
			</div>
		</div>
	)
}

export default InterpolationSimulator
