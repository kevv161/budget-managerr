import { useState, useEffect, useRef } from 'react'
import * as math from 'mathjs'
import functionPlot from 'function-plot'

const LogarithmicSimulator = () => {
	const [base, setBase] = useState(10)
	const [coefficient, setCoefficient] = useState(1)
	const [constant, setConstant] = useState(0)
	const [domain, setDomain] = useState({ min: -10, max: 10 })
	const [plotData, setPlotData] = useState([])
	const plotRef = useRef(null)

	const generateLogarithmicFunction = () => {
		try {
			const func = math.parse(`${coefficient} * log(${base}, x) + ${constant}`)
			const compiled = func.compile()
			
			const points = []
			const step = (domain.max - domain.min) / 200
			
			for (let x = Math.max(domain.min, 0.01); x <= domain.max; x += step) {
				try {
					const y = compiled.evaluate({ x })
					if (isFinite(y)) {
						points.push([x, y])
					}
				} catch (e) {
					// Skip invalid points
				}
			}
			
			setPlotData(points)
		} catch (error) {
			console.error('Error generating function:', error)
		}
	}

	useEffect(() => {
		generateLogarithmicFunction()
	}, [base, coefficient, constant, domain])

	useEffect(() => {
		if (plotRef.current && plotData.length > 0) {
			functionPlot({
				target: plotRef.current,
				width: 600,
				height: 400,
				grid: true,
				xAxis: { label: 'x' },
				yAxis: { label: 'y' },
				data: [
					{
						fn: `(${coefficient}) * log(${base}, x) + (${constant})`,
						range: [Math.max(domain.min, 0.01), domain.max],
						graphType: 'polyline'
					}
				]
			})
		}
	}, [plotData, base, coefficient, constant, domain])

	const calculateValue = (x) => {
		try {
			const func = math.parse(`${coefficient} * log(${base}, x) + ${constant}`)
			const compiled = func.compile()
			return compiled.evaluate({ x })
		} catch (error) {
			return 'Error'
		}
	}

	return (
		<div className="simulator-container">
			<div className="controls-panel">
				<h2>Simulador de Funciones Logarítmicas</h2>
				<p>f(x) = a · log_b(x) + c</p>
				
				<div className="control-group">
					<label>
						Base (b): 
						<input
							type="number"
							value={base}
							onChange={(e) => setBase(parseFloat(e.target.value) || 10)}
							min="0.1"
							max="100"
							step="0.1"
						/>
					</label>
				</div>

				<div className="control-group">
					<label>
						Coefficiente (a): 
						<input
							type="number"
							value={coefficient}
							onChange={(e) => setCoefficient(parseFloat(e.target.value) || 1)}
							step="0.1"
						/>
					</label>
				</div>

				<div className="control-group">
					<label>
						Constante (c): 
						<input
							type="number"
							value={constant}
							onChange={(e) => setConstant(parseFloat(e.target.value) || 0)}
							step="0.1"
						/>
					</label>
				</div>

				<div className="control-group">
					<label>
						Dominio mínimo: 
						<input
							type="number"
							value={domain.min}
							onChange={(e) => setDomain(prev => ({ ...prev, min: parseFloat(e.target.value) || -10 }))}
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
							onChange={(e) => setDomain(prev => ({ ...prev, max: parseFloat(e.target.value) || 10 }))}
							step="0.1"
						/>
					</label>
				</div>

				<div className="function-info">
					<h3>Función actual:</h3>
					<p>f(x) = {coefficient} · log_{base}(x) + {constant}</p>
					
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
									const result = calculateValue(x)
									alert(`f(${x}) = ${result}`)
								}
							}}>
								Calcular
							</button>
						</label>
					</div>
				</div>
			</div>

			<div className="plot-container">
				<h3>Gráfica de la función</h3>
				<div ref={plotRef} className="function-plot"></div>
			</div>
		</div>
	)
}

export default LogarithmicSimulator
