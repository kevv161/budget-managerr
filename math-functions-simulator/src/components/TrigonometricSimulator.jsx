import { useState, useEffect, useRef } from 'react'
import * as math from 'mathjs'
import functionPlot from 'function-plot'

const TrigonometricSimulator = () => {
	const [functionType, setFunctionType] = useState('sin')
	const [amplitude, setAmplitude] = useState(1)
	const [frequency, setFrequency] = useState(1)
	const [phase, setPhase] = useState(0)
	const [verticalShift, setVerticalShift] = useState(0)
	const [domain, setDomain] = useState({ min: -2 * Math.PI, max: 2 * Math.PI })
	const plotRef = useRef(null)

	const generateTrigonometricFunction = () => {
		const funcString = `${amplitude} * ${functionType}(${frequency} * x + ${phase}) + ${verticalShift}`
		return funcString
	}

	useEffect(() => {
		if (plotRef.current) {
			const funcString = generateTrigonometricFunction()
			
			functionPlot({
				target: plotRef.current,
				width: 600,
				height: 400,
				grid: true,
				xAxis: { 
					label: 'x',
					domain: [domain.min, domain.max]
				},
				yAxis: { 
					label: 'y',
					domain: [-Math.abs(amplitude) * 2 - Math.abs(verticalShift) - 1, 
							Math.abs(amplitude) * 2 + Math.abs(verticalShift) + 1]
				},
				data: [
					{
						fn: funcString,
						range: [domain.min, domain.max],
						graphType: 'polyline'
					}
				]
			})
		}
	}, [functionType, amplitude, frequency, phase, verticalShift, domain])

	const calculateValue = (x) => {
		try {
			const func = math.parse(generateTrigonometricFunction())
			const compiled = func.compile()
			return compiled.evaluate({ x })
		} catch (error) {
			return 'Error'
		}
	}

	const getFunctionInfo = () => {
		const period = 2 * Math.PI / frequency
		const maxValue = amplitude + verticalShift
		const minValue = -amplitude + verticalShift
		
		return {
			period: period.toFixed(3),
			amplitude: Math.abs(amplitude).toFixed(3),
			maxValue: maxValue.toFixed(3),
			minValue: minValue.toFixed(3)
		}
	}

	const info = getFunctionInfo()

	return (
		<div className="simulator-container">
			<div className="controls-panel">
				<h2>Simulador de Funciones Trigonométricas</h2>
				<p>f(x) = A · {functionType}(ωx + φ) + C</p>
				
				<div className="control-group">
					<label>
						Función: 
						<select value={functionType} onChange={(e) => setFunctionType(e.target.value)}>
							<option value="sin">Seno (sin)</option>
							<option value="cos">Coseno (cos)</option>
							<option value="tan">Tangente (tan)</option>
						</select>
					</label>
				</div>

				<div className="control-group">
					<label>
						Amplitud (A): 
						<input
							type="number"
							value={amplitude}
							onChange={(e) => setAmplitude(parseFloat(e.target.value) || 1)}
							step="0.1"
						/>
					</label>
				</div>

				<div className="control-group">
					<label>
						Frecuencia (ω): 
						<input
							type="number"
							value={frequency}
							onChange={(e) => setFrequency(parseFloat(e.target.value) || 1)}
							step="0.1"
							min="0.1"
						/>
					</label>
				</div>

				<div className="control-group">
					<label>
						Desplazamiento de fase (φ): 
						<input
							type="number"
							value={phase}
							onChange={(e) => setPhase(parseFloat(e.target.value) || 0)}
							step="0.1"
						/>
					</label>
				</div>

				<div className="control-group">
					<label>
						Desplazamiento vertical (C): 
						<input
							type="number"
							value={verticalShift}
							onChange={(e) => setVerticalShift(parseFloat(e.target.value) || 0)}
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
							onChange={(e) => setDomain(prev => ({ ...prev, min: parseFloat(e.target.value) || -2 * Math.PI }))}
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
							onChange={(e) => setDomain(prev => ({ ...prev, max: parseFloat(e.target.value) || 2 * Math.PI }))}
							step="0.1"
						/>
					</label>
				</div>

				<div className="function-info">
					<h3>Función actual:</h3>
					<p>f(x) = {amplitude} · {functionType}({frequency}x + {phase}) + {verticalShift}</p>
					
					<div className="properties">
						<h4>Propiedades:</h4>
						<p>Período: {info.period}</p>
						<p>Amplitud: {info.amplitude}</p>
						<p>Valor máximo: {info.maxValue}</p>
						<p>Valor mínimo: {info.minValue}</p>
					</div>
					
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

export default TrigonometricSimulator
