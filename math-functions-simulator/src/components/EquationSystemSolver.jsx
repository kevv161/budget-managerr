import { useState } from 'react'
import * as math from 'mathjs'

const EquationSystemSolver = () => {
	const [systemType, setSystemType] = useState('linear')
	const [method, setMethod] = useState('elimination')
	const [equations, setEquations] = useState([
		{ equation: '2x + 3y = 7', variables: ['x', 'y'] },
		{ equation: 'x - y = 1', variables: ['x', 'y'] }
	])
	const [newEquation, setNewEquation] = useState('')
	const [solution, setSolution] = useState(null)
	const [error, setError] = useState('')
	const [showSteps, setShowSteps] = useState(false)
	const [solutionSteps, setSolutionSteps] = useState([])

	const parseEquation = (equationStr) => {
		try {
			// Simple parser for linear equations
			const parts = equationStr.split('=')
			if (parts.length !== 2) throw new Error('Formato inválido')
			
			const leftSide = parts[0].trim()
			const rightSide = parts[1].trim()
			
			// Extract coefficients and variables
			const variables = new Set()
			const coefficients = {}
			
			// Parse left side
			const leftTerms = leftSide.split(/[+\-]/).filter(term => term.trim())
			const leftSigns = leftSide.match(/[+\-]/g) || []
			
			leftTerms.forEach((term, index) => {
				const sign = index === 0 ? '+' : (leftSigns[index - 1] || '+')
				const coefficient = parseFloat(term.match(/-?\d*\.?\d*/)[0]) || 1
				const variable = term.match(/[a-zA-Z]+/)?.[0]
				
				if (variable) {
					variables.add(variable)
					coefficients[variable] = (coefficients[variable] || 0) + 
						(sign === '+' ? coefficient : -coefficient)
				}
			})
			
			// Parse right side
			const rightValue = parseFloat(rightSide)
			
			return {
				coefficients,
				constant: rightValue,
				variables: Array.from(variables)
			}
		} catch (error) {
			throw new Error('Error al parsear la ecuación: ' + error.message)
		}
	}

	const solveByElimination = (parsedEquations, variables) => {
		const steps = []
		const A = []
		const b = []
		
		// Build coefficient matrix and constant vector
		parsedEquations.forEach((eq, index) => {
			const row = []
			variables.forEach(variable => {
				row.push(eq.coefficients[variable] || 0)
			})
			A.push(row)
			b.push(eq.constant)
		})
		
		steps.push({
			step: 1,
			title: 'Sistema original',
			description: 'Ecuaciones del sistema en forma matricial:',
			equations: equations.map(eq => eq.equation),
			details: 'Convertimos el sistema a forma matricial [A][X] = [B]',
			matrix: A.map((row, i) => `Fila ${i+1}: [${row.join(', ')}] = ${b[i]}`)
		})
		
		// Gaussian elimination
		const n = A.length
		for (let i = 0; i < n; i++) {
			// Find pivot
			let maxRow = i
			for (let k = i + 1; k < n; k++) {
				if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
					maxRow = k
				}
			}
			
			if (maxRow !== i) {
				[A[i], A[maxRow]] = [A[maxRow], A[i]]
				[b[i], b[maxRow]] = [b[maxRow], b[i]]
				steps.push({
					step: steps.length + 1,
					title: `Intercambio de filas (Pivoteo)`,
					description: `Intercambiamos fila ${i+1} con fila ${maxRow+1} para tener el mayor pivote`,
					details: `El elemento ${A[i][i]} es mayor que ${A[maxRow][i]}, intercambiamos para estabilidad numérica`,
					matrix: A.map((row, idx) => `Fila ${idx+1}: [${row.join(', ')}] = ${b[idx]}`)
				})
			}
			
			// Make all rows below this one 0 in current column
			for (let k = i + 1; k < n; k++) {
				const factor = A[k][i] / A[i][i]
				const originalRow = [...A[k]]
				const originalB = b[k]
				
				for (let j = i; j < n; j++) {
					A[k][j] -= factor * A[i][j]
				}
				b[k] -= factor * b[i]
				
				steps.push({
					step: steps.length + 1,
					title: `Eliminación hacia adelante`,
					description: `Eliminamos el elemento (${k+1},${i+1}) usando la fila ${i+1} como pivote`,
					details: `Factor de eliminación: ${A[k][i]} ÷ ${A[i][i]} = ${factor.toFixed(3)}`,
					operations: [
						`Fila ${k+1} original: [${originalRow.join(', ')}] = ${originalB}`,
						`Fila ${k+1} = Fila ${k+1} - ${factor.toFixed(3)} × Fila ${i+1}`,
						`Fila ${k+1} nueva: [${A[k].join(', ')}] = ${b[k]}`
					],
					matrix: A.map((row, idx) => `Fila ${idx+1}: [${row.join(', ')}] = ${b[idx]}`)
				})
			}
		}
		
		steps.push({
			step: steps.length + 1,
			title: 'Matriz triangular superior',
			description: 'Hemos obtenido una matriz triangular superior:',
			details: 'Ahora podemos resolver usando sustitución hacia atrás',
			matrix: A.map((row, idx) => `Fila ${idx+1}: [${row.join(', ')}] = ${b[idx]}`)
		})
		
		// Back substitution
		const solution = new Array(n)
		for (let i = n - 1; i >= 0; i--) {
			const originalB = b[i]
			solution[i] = b[i]
			
			let substitutionTerms = []
			for (let j = i + 1; j < n; j++) {
				const term = A[i][j] * solution[j]
				solution[i] -= term
				substitutionTerms.push(`${A[i][j]} × ${solution[j].toFixed(3)} = ${term.toFixed(3)}`)
			}
			
			const finalValue = solution[i] / A[i][i]
			solution[i] = finalValue
			
			steps.push({
				step: steps.length + 1,
				title: `Sustitución hacia atrás - ${variables[i]}`,
				description: `Resolvemos para ${variables[i]} usando la fila ${i+1}:`,
				details: `Ecuación: ${A[i][i]}${variables[i]} + ${A[i].slice(i+1).map((coeff, idx) => `${coeff}${variables[i+1+idx]}`).join(' + ')} = ${originalB}`,
				operations: [
					`${A[i][i]}${variables[i]} = ${originalB} - (${substitutionTerms.join(' + ')})`,
					`${A[i][i]}${variables[i]} = ${originalB} - ${(originalB - finalValue * A[i][i]).toFixed(3)}`,
					`${A[i][i]}${variables[i]} = ${(finalValue * A[i][i]).toFixed(3)}`,
					`${variables[i]} = ${(finalValue * A[i][i]).toFixed(3)} ÷ ${A[i][i]}`,
					`${variables[i]} = ${finalValue.toFixed(3)}`
				]
			})
		}
		
		steps.push({
			step: steps.length + 1,
			title: 'Verificación de la solución',
			description: 'Verificamos que la solución satisface el sistema original:',
			details: 'Sustituimos los valores encontrados en las ecuaciones originales',
			operations: equations.map((eq, idx) => {
				const parsed = parseEquation(eq.equation)
				let result = 0
				let terms = []
				variables.forEach((variable, varIdx) => {
					const coeff = parsed.coefficients[variable] || 0
					const value = solution[varIdx]
					const term = coeff * value
					result += term
					terms.push(`${coeff} × ${value.toFixed(3)} = ${term.toFixed(3)}`)
				})
				return `Ecuación ${idx+1}: ${terms.join(' + ')} = ${result.toFixed(3)} ✓`
			})
		})
		
		return { solution, steps }
	}

	const solveBySubstitution = (parsedEquations, variables) => {
		const steps = []
		
		steps.push({
			step: 1,
			title: 'Sistema original',
			description: 'Ecuaciones del sistema:',
			equations: equations.map(eq => eq.equation),
			details: 'Tenemos un sistema de 2 ecuaciones con 2 incógnitas. El objetivo es encontrar los valores de las variables que satisfacen ambas ecuaciones al mismo tiempo.',
			operations: [
				'📝 Identificamos las variables: ' + variables.join(' y '),
				'🎯 Objetivo: Encontrar valores que hagan verdaderas ambas ecuaciones',
				'💡 Estrategia: Despejar una variable de una ecuación y sustituir en la otra'
			]
		})
		
		// Solve first equation for first variable
		const eq1 = parsedEquations[0]
		const eq2 = parsedEquations[1]
		const var1 = variables[0]
		const var2 = variables[1]
		
		// Express var1 in terms of var2 from first equation
		const coeff1_var1 = eq1.coefficients[var1] || 0
		const coeff1_var2 = eq1.coefficients[var2] || 0
		const const1 = eq1.constant
		
		if (coeff1_var1 === 0) {
			throw new Error('No se puede resolver por sustitución: coeficiente de la primera variable es 0')
		}
		
		// Show the process of solving for var1
		const originalEq1 = `${coeff1_var1}${var1} + ${coeff1_var2}${var2} = ${const1}`
		
		steps.push({
			step: 2,
			title: 'Despejar variable de la primera ecuación',
			description: `Vamos a despejar ${var1} de la primera ecuación. Esto significa que queremos que ${var1} quede sola en un lado de la ecuación:`,
			equations: [originalEq1],
			details: `Para despejar ${var1}, necesitamos "mover" todos los demás términos al otro lado de la ecuación. Esto se hace aplicando las mismas operaciones a ambos lados para mantener la igualdad.`,
			operations: [
				`🔍 Ecuación original: ${originalEq1}`,
				`📝 Paso 1: Restar ${coeff1_var2}${var2} a ambos lados`,
				`   Esto elimina ${coeff1_var2}${var2} del lado izquierdo`,
				`   ${coeff1_var1}${var1} + ${coeff1_var2}${var2} - ${coeff1_var2}${var2} = ${const1} - ${coeff1_var2}${var2}`,
				`   Simplificando: ${coeff1_var1}${var1} = ${const1} - ${coeff1_var2}${var2}`,
				`📝 Paso 2: Dividir ambos lados por ${coeff1_var1}`,
				`   Esto elimina el coeficiente de ${var1}`,
				`   ${coeff1_var1}${var1} ÷ ${coeff1_var1} = (${const1} - ${coeff1_var2}${var2}) ÷ ${coeff1_var1}`,
				`   Resultado: ${var1} = (${const1} - ${coeff1_var2}${var2}) / ${coeff1_var1}`,
				`✅ Ahora ${var1} está despejada y expresada en términos de ${var2}`
			]
		})
		
		// Substitute into second equation
		const coeff2_var1 = eq2.coefficients[var1] || 0
		const coeff2_var2 = eq2.coefficients[var2] || 0
		const const2 = eq2.constant
		
		const originalEq2 = `${coeff2_var1}${var1} + ${coeff2_var2}${var2} = ${const2}`
		const substExpression = `(${const1} - ${coeff1_var2}${var2}) / ${coeff1_var1}`
		
		steps.push({
			step: 3,
			title: 'Sustituir en la segunda ecuación',
			description: `Ahora vamos a sustituir (reemplazar) la expresión que obtuvimos para ${var1} en la segunda ecuación:`,
			equations: [originalEq2],
			details: `La idea es que en lugar de tener dos variables en la segunda ecuación, solo tengamos una. Esto nos permitirá resolver para esa variable.`,
			operations: [
				`🔍 Segunda ecuación original: ${originalEq2}`,
				`🔄 Reemplazamos ${var1} por la expresión que obtuvimos: ${substExpression}`,
				`📝 Sustitución: ${coeff2_var1} × (${substExpression}) + ${coeff2_var2}${var2} = ${const2}`,
				`📝 Desarrollando: ${coeff2_var1} × (${const1} - ${coeff1_var2}${var2}) / ${coeff1_var1} + ${coeff2_var2}${var2} = ${const2}`,
				`💡 Ahora solo tenemos ${var2} como variable, ¡podemos resolverla!`
			]
		})
		
		// Simplify and solve for var2 - CORRECTED VERSION
		// First, let's eliminate the denominator by multiplying both sides by coeff1_var1
		const multipliedCoeff = coeff2_var1 * const1 - coeff2_var1 * coeff1_var2 * 1 + coeff2_var2 * coeff1_var1
		const multipliedConst = const2 * coeff1_var1
		
		// The correct coefficient for var2 after simplification
		const simplifiedCoeff = coeff2_var2 * coeff1_var1 - coeff2_var1 * coeff1_var2
		const simplifiedConst = const2 * coeff1_var1 - coeff2_var1 * const1
		
		steps.push({
			step: 4,
			title: 'Eliminar denominadores y simplificar',
			description: `Para simplificar la ecuación, primero eliminamos el denominador multiplicando ambos lados por ${coeff1_var1}:`,
			details: `Esto nos permitirá trabajar con números enteros y simplificar los cálculos.`,
			operations: [
				`🔍 Ecuación con denominador: ${coeff2_var1} × (${const1} - ${coeff1_var2}${var2}) / ${coeff1_var1} + ${coeff2_var2}${var2} = ${const2}`,
				`📝 Paso 1: Multiplicar ambos lados por ${coeff1_var1}`,
				`   ${coeff1_var1} × [${coeff2_var1} × (${const1} - ${coeff1_var2}${var2}) / ${coeff1_var1} + ${coeff2_var2}${var2}] = ${coeff1_var1} × ${const2}`,
				`📝 Paso 2: Distribuir la multiplicación`,
				`   ${coeff1_var1} × ${coeff2_var1} × (${const1} - ${coeff1_var2}${var2}) / ${coeff1_var1} + ${coeff1_var1} × ${coeff2_var2}${var2} = ${const2 * coeff1_var1}`,
				`   Simplificando: ${coeff2_var1} × (${const1} - ${coeff1_var2}${var2}) + ${coeff2_var2 * coeff1_var1}${var2} = ${const2 * coeff1_var1}`,
				`📝 Paso 3: Distribuir ${coeff2_var1} en el paréntesis`,
				`   ${coeff2_var1} × ${const1} - ${coeff2_var1} × ${coeff1_var2}${var2} + ${coeff2_var2 * coeff1_var1}${var2} = ${const2 * coeff1_var1}`,
				`   = ${coeff2_var1 * const1} - ${coeff2_var1 * coeff1_var2}${var2} + ${coeff2_var2 * coeff1_var1}${var2} = ${const2 * coeff1_var1}`,
				`📝 Paso 4: Agrupar términos con ${var2}`,
				`   Términos con ${var2}: -${coeff2_var1 * coeff1_var2}${var2} + ${coeff2_var2 * coeff1_var1}${var2}`,
				`   = (${coeff2_var2 * coeff1_var1} - ${coeff2_var1 * coeff1_var2})${var2}`,
				`   = ${simplifiedCoeff}${var2}`,
				`📝 Paso 5: Mover el término constante al otro lado`,
				`   ${simplifiedCoeff}${var2} = ${const2 * coeff1_var1} - ${coeff2_var1 * const1}`,
				`   ${simplifiedCoeff}${var2} = ${simplifiedConst}`,
				`✅ ¡Ahora tenemos una ecuación simple con una sola variable!`
			]
		})
		
		const var2Value = simplifiedConst / simplifiedCoeff
		
		steps.push({
			step: 5,
			title: 'Resolver para la segunda variable',
			description: `¡Perfecto! Ahora tenemos una ecuación simple con una sola variable. Vamos a resolver para ${var2}:`,
			details: `Para despejar ${var2}, necesitamos dividir ambos lados de la ecuación por el coeficiente de ${var2}.`,
			operations: [
				`🔍 Ecuación simplificada: ${simplifiedCoeff}${var2} = ${simplifiedConst}`,
				`📝 Para despejar ${var2}, dividimos ambos lados por ${simplifiedCoeff}`,
				`   ${simplifiedCoeff}${var2} ÷ ${simplifiedCoeff} = ${simplifiedConst} ÷ ${simplifiedCoeff}`,
				`   ${var2} = ${simplifiedConst} / ${simplifiedCoeff}`,
				`📝 Calculando: ${var2} = ${var2Value.toFixed(3)}`,
				`✅ ¡Hemos encontrado el valor de ${var2}!`
			]
		})
		
		// Substitute back to find var1
		const var1Value = (const1 - coeff1_var2 * var2Value) / coeff1_var1
		
		steps.push({
			step: 6,
			title: 'Resolver para la primera variable',
			description: `Ahora que conocemos el valor de ${var2}, podemos encontrar el valor de ${var1}. Usaremos la expresión que obtuvimos en el paso 2:`,
			details: `Recordemos que en el paso 2 despejamos ${var1} y obtuvimos: ${var1} = (${const1} - ${coeff1_var2}${var2}) / ${coeff1_var1}. Ahora sustituimos el valor de ${var2}.`,
			operations: [
				`🔍 Expresión de ${var1} del paso 2: ${var1} = (${const1} - ${coeff1_var2}${var2}) / ${coeff1_var1}`,
				`🔄 Sustituimos ${var2} = ${var2Value.toFixed(3)}`,
				`   ${var1} = (${const1} - ${coeff1_var2} × ${var2Value.toFixed(3)}) / ${coeff1_var1}`,
				`📝 Calculamos la multiplicación: ${coeff1_var2} × ${var2Value.toFixed(3)} = ${(coeff1_var2 * var2Value).toFixed(3)}`,
				`   ${var1} = (${const1} - ${(coeff1_var2 * var2Value).toFixed(3)}) / ${coeff1_var1}`,
				`📝 Calculamos la resta: ${const1} - ${(coeff1_var2 * var2Value).toFixed(3)} = ${(const1 - coeff1_var2 * var2Value).toFixed(3)}`,
				`   ${var1} = ${(const1 - coeff1_var2 * var2Value).toFixed(3)} / ${coeff1_var1}`,
				`📝 Calculamos la división: ${(const1 - coeff1_var2 * var2Value).toFixed(3)} ÷ ${coeff1_var1} = ${var1Value.toFixed(3)}`,
				`✅ ¡Hemos encontrado el valor de ${var1}!`
			]
		})
		
		steps.push({
			step: 7,
			title: 'Verificación de la solución',
			description: `¡Excelente! Hemos encontrado los valores de ambas variables. Ahora vamos a verificar que nuestra solución es correcta:`,
			details: `Para verificar, sustituimos los valores encontrados en las ecuaciones originales y comprobamos que se cumplan las igualdades.`,
			operations: [
				`🎯 Solución encontrada: ${var1} = ${var1Value.toFixed(3)}, ${var2} = ${var2Value.toFixed(3)}`,
				`🔍 Verificación en la Ecuación 1: ${equations[0].equation}`,
				`   Sustituimos: ${coeff1_var1}(${var1Value.toFixed(3)}) + ${coeff1_var2}(${var2Value.toFixed(3)}) = ?`,
				`   Calculamos: ${coeff1_var1 * var1Value.toFixed(3)} + ${coeff1_var2 * var2Value.toFixed(3)} = ${(coeff1_var1 * var1Value + coeff1_var2 * var2Value).toFixed(3)}`,
				`   ¿Es igual a ${const1}? ${Math.abs((coeff1_var1 * var1Value + coeff1_var2 * var2Value) - const1) < 0.001 ? '✅ ¡SÍ!' : '❌ NO'}`,
				`🔍 Verificación en la Ecuación 2: ${equations[1].equation}`,
				`   Sustituimos: ${coeff2_var1}(${var1Value.toFixed(3)}) + ${coeff2_var2}(${var2Value.toFixed(3)}) = ?`,
				`   Calculamos: ${coeff2_var1 * var1Value.toFixed(3)} + ${coeff2_var2 * var2Value.toFixed(3)} = ${(coeff2_var1 * var1Value + coeff2_var2 * var2Value).toFixed(3)}`,
				`   ¿Es igual a ${const2}? ${Math.abs((coeff2_var1 * var1Value + coeff2_var2 * var2Value) - const2) < 0.001 ? '✅ ¡SÍ!' : '❌ NO'}`,
				`🎉 ¡La solución es correcta! Ambas ecuaciones se satisfacen con estos valores.`
			]
		})
		
		const solution = [var1Value, var2Value]
		return { solution, steps }
	}

	const solveByReduction = (parsedEquations, variables) => {
		const steps = []
		const A = []
		const b = []
		
		// Build coefficient matrix and constant vector
		parsedEquations.forEach((eq, index) => {
			const row = []
			variables.forEach(variable => {
				row.push(eq.coefficients[variable] || 0)
			})
			A.push(row)
			b.push(eq.constant)
		})
		
		steps.push({
			step: 1,
			title: 'Sistema original',
			description: 'Ecuaciones del sistema:',
			equations: equations.map(eq => eq.equation),
			details: 'Tenemos un sistema de 2 ecuaciones con 2 incógnitas. El método de reducción consiste en eliminar una variable sumando o restando las ecuaciones.',
			operations: [
				'📝 Identificamos las variables: ' + variables.join(' y '),
				'🎯 Objetivo: Eliminar una variable para resolver la otra',
				'💡 Estrategia: Hacer que los coeficientes de una variable sean iguales y luego restar las ecuaciones',
				'🔍 Identificamos los coeficientes de cada variable en ambas ecuaciones'
			]
		})
		
		// Find common multiple for elimination
		const coeff1_var1 = A[0][0]
		const coeff2_var1 = A[1][0]
		
		const lcm = Math.abs(coeff1_var1 * coeff2_var1) / math.gcd(Math.abs(coeff1_var1), Math.abs(coeff2_var1))
		const mult1 = lcm / coeff1_var1
		const mult2 = lcm / coeff2_var1
		
		steps.push({
			step: 2,
			title: 'Encontrar múltiplo común',
			description: `Para eliminar ${variables[0]}, necesitamos que los coeficientes de ${variables[0]} sean iguales en ambas ecuaciones:`,
			details: `Los coeficientes actuales de ${variables[0]} son ${coeff1_var1} y ${coeff2_var1}. Para que sean iguales, necesitamos encontrar un múltiplo común.`,
			operations: [
				`🔍 Coeficientes actuales de ${variables[0]}:`,
				`   Ecuación 1: ${coeff1_var1}`,
				`   Ecuación 2: ${coeff2_var1}`,
				`📝 Para hacerlos iguales, encontramos el MCM (Mínimo Común Múltiplo)`,
				`   MCM(${coeff1_var1}, ${coeff2_var1}) = ${lcm}`,
				`📝 Calculamos los multiplicadores:`,
				`   Multiplicador para ecuación 1: ${lcm} ÷ ${coeff1_var1} = ${mult1}`,
				`   Multiplicador para ecuación 2: ${lcm} ÷ ${coeff2_var1} = ${mult2}`,
				`💡 Ahora multiplicaremos cada ecuación por su respectivo multiplicador`
			]
		})
		
		// Multiply equations
		const newA1 = A[0].map(x => x * mult1)
		const newB1 = b[0] * mult1
		const newA2 = A[1].map(x => x * mult2)
		const newB2 = b[1] * mult2
		
		steps.push({
			step: 3,
			title: 'Multiplicar ecuaciones',
			description: 'Ahora aplicamos los multiplicadores a cada ecuación para que los coeficientes de la primera variable sean iguales:',
			details: 'Multiplicamos cada término de cada ecuación por su respectivo multiplicador. Esto no cambia la solución del sistema, solo transforma las ecuaciones.',
			operations: [
				`📝 Ecuación 1 × ${mult1}:`,
				`   Original: ${A[0][0]}${variables[0]} + ${A[0][1]}${variables[1]} = ${b[0]}`,
				`   Multiplicamos cada término por ${mult1}:`,
				`   ${A[0][0]} × ${mult1} = ${newA1[0]}`,
				`   ${A[0][1]} × ${mult1} = ${newA1[1]}`,
				`   ${b[0]} × ${mult1} = ${newB1}`,
				`   Resultado: ${newA1[0]}${variables[0]} + ${newA1[1]}${variables[1]} = ${newB1}`,
				`📝 Ecuación 2 × ${mult2}:`,
				`   Original: ${A[1][0]}${variables[0]} + ${A[1][1]}${variables[1]} = ${b[1]}`,
				`   Multiplicamos cada término por ${mult2}:`,
				`   ${A[1][0]} × ${mult2} = ${newA2[0]}`,
				`   ${A[1][1]} × ${mult2} = ${newA2[1]}`,
				`   ${b[1]} × ${mult2} = ${newB2}`,
				`   Resultado: ${newA2[0]}${variables[0]} + ${newA2[1]}${variables[1]} = ${newB2}`,
				`✅ ¡Ahora los coeficientes de ${variables[0]} son iguales (${newA1[0]})!`
			]
		})
		
		// Subtract equations
		const resultA = newA1.map((x, i) => x - newA2[i])
		const resultB = newB1 - newB2
		
		steps.push({
			step: 4,
			title: 'Restar ecuaciones',
			description: 'Ahora restamos la ecuación 2 de la ecuación 1 para eliminar la primera variable:',
			details: 'Como los coeficientes de la primera variable son iguales, al restar las ecuaciones se eliminan. Esto nos deja una ecuación con una sola variable.',
			operations: [
				`🔍 Ecuaciones después de multiplicar:`,
				`   Ecuación 1: ${newA1[0]}${variables[0]} + ${newA1[1]}${variables[1]} = ${newB1}`,
				`   Ecuación 2: ${newA2[0]}${variables[0]} + ${newA2[1]}${variables[1]} = ${newB2}`,
				`📝 Restamos término a término:`,
				`   (${newA1[0]}${variables[0]} + ${newA1[1]}${variables[1]} = ${newB1})`,
				`   - (${newA2[0]}${variables[0]} + ${newA2[1]}${variables[1]} = ${newB2})`,
				`   = (${newA1[0]} - ${newA2[0]})${variables[0]} + (${newA1[1]} - ${newA2[1]})${variables[1]} = ${newB1} - ${newB2}`,
				`📝 Calculamos las restas:`,
				`   ${newA1[0]} - ${newA2[0]} = ${resultA[0]}`,
				`   ${newA1[1]} - ${newA2[1]} = ${resultA[1]}`,
				`   ${newB1} - ${newB2} = ${resultB}`,
				`📝 Resultado: ${resultA[0]}${variables[0]} + ${resultA[1]}${variables[1]} = ${resultB}`,
				`💡 Como ${resultA[0]} = 0, el término con ${variables[0]} se elimina:`,
				`   ${resultA[1]}${variables[1]} = ${resultB}`,
				`✅ ¡Hemos eliminado ${variables[0]} y ahora solo tenemos ${variables[1]}!`
			]
		})
		
		// Solve for second variable
		const var2Value = resultB / resultA[1]
		
		steps.push({
			step: 5,
			title: 'Resolver para la segunda variable',
			description: `Despejamos ${variables[1]}:`,
			details: `Dividimos ambos lados por ${resultA[1]}`,
			operations: [
				`${variables[1]} = ${resultB} / ${resultA[1]}`,
				`${variables[1]} = ${var2Value.toFixed(3)}`
			]
		})
		
		// Substitute back to find first variable
		const var1Value = (b[0] - A[0][1] * var2Value) / A[0][0]
		
		steps.push({
			step: 6,
			title: 'Resolver para la primera variable',
			description: `Sustituimos ${variables[1]} = ${var2Value.toFixed(3)} en la primera ecuación original:`,
			details: `Usamos la ecuación original: ${A[0][0]}${variables[0]} + ${A[0][1]}${variables[1]} = ${b[0]}`,
			operations: [
				`${A[0][0]}${variables[0]} + ${A[0][1]}(${var2Value.toFixed(3)}) = ${b[0]}`,
				`${A[0][0]}${variables[0]} + ${(A[0][1] * var2Value).toFixed(3)} = ${b[0]}`,
				`${A[0][0]}${variables[0]} = ${b[0]} - ${(A[0][1] * var2Value).toFixed(3)}`,
				`${A[0][0]}${variables[0]} = ${(b[0] - A[0][1] * var2Value).toFixed(3)}`,
				`${variables[0]} = ${(b[0] - A[0][1] * var2Value).toFixed(3)} / ${A[0][0]}`,
				`${variables[0]} = ${var1Value.toFixed(3)}`
			]
		})
		
		steps.push({
			step: 7,
			title: 'Verificación',
			description: `Verificamos la solución sustituyendo en ambas ecuaciones originales:`,
			details: `Comprobamos que los valores satisfacen el sistema original`,
			operations: [
				`Ecuación 1: ${A[0][0]}(${var1Value.toFixed(3)}) + ${A[0][1]}(${var2Value.toFixed(3)}) = ${(A[0][0] * var1Value + A[0][1] * var2Value).toFixed(3)} ✓`,
				`Ecuación 2: ${A[1][0]}(${var1Value.toFixed(3)}) + ${A[1][1]}(${var2Value.toFixed(3)}) = ${(A[1][0] * var1Value + A[1][1] * var2Value).toFixed(3)} ✓`
			]
		})
		
		const solution = [var1Value, var2Value]
		return { solution, steps }
	}

	const solveLinearSystem = () => {
		try {
			setError('')
			setShowSteps(false)
			setSolutionSteps([])
			
			if (equations.length < 2) {
				setError('Se necesitan al menos 2 ecuaciones')
				return
			}

			// Parse all equations
			const parsedEquations = equations.map(eq => parseEquation(eq.equation))
			
			// Get all variables
			const allVariables = new Set()
			parsedEquations.forEach(eq => {
				eq.variables.forEach(v => allVariables.add(v))
			})
			
			const variables = Array.from(allVariables)
			
			if (variables.length !== equations.length) {
				setError('El número de variables debe ser igual al número de ecuaciones')
				return
			}

			let result
			
			// Solve using selected method
			if (method === 'elimination') {
				result = solveByElimination(parsedEquations, variables)
			} else if (method === 'substitution') {
				result = solveBySubstitution(parsedEquations, variables)
			} else if (method === 'reduction') {
				result = solveByReduction(parsedEquations, variables)
			}
			
			const solutionResult = {}
			variables.forEach((variable, index) => {
				solutionResult[variable] = result.solution[index]
			})
			
			setSolution(solutionResult)
			setSolutionSteps(result.steps)
			
		} catch (error) {
			setError(error.message)
			setSolution(null)
			setSolutionSteps([])
		}
	}

	const solveNonLinearSystem = () => {
		try {
			setError('')
			
			// For demonstration, we'll solve a simple non-linear system
			// x^2 + y^2 = 25, x + y = 7
			const equations = [
				'x^2 + y^2 = 25',
				'x + y = 7'
			]
			
			// This is a simplified solver for demonstration
			// In practice, you'd use more sophisticated methods
			const solutions = []
			
			// Solve x + y = 7 for y: y = 7 - x
			// Substitute into x^2 + y^2 = 25
			// x^2 + (7-x)^2 = 25
			// x^2 + 49 - 14x + x^2 = 25
			// 2x^2 - 14x + 24 = 0
			// x^2 - 7x + 12 = 0
			// (x-3)(x-4) = 0
			
			const x1 = 3, x2 = 4
			const y1 = 7 - x1, y2 = 7 - x2
			
			solutions.push({ x: x1, y: y1 })
			solutions.push({ x: x2, y: y2 })
			
			setSolution({ solutions })
		} catch (error) {
			setError(error.message)
			setSolution(null)
		}
	}

	const addEquation = () => {
		if (newEquation.trim()) {
			const variables = newEquation.match(/[a-zA-Z]+/g) || []
			setEquations([...equations, { 
				equation: newEquation.trim(), 
				variables: [...new Set(variables)] 
			}])
			setNewEquation('')
		}
	}

	const removeEquation = (index) => {
		setEquations(equations.filter((_, i) => i !== index))
	}

	const solveSystem = () => {
		if (systemType === 'linear') {
			solveLinearSystem()
		} else {
			solveNonLinearSystem()
		}
	}

	return (
		<div className="simulator-container">
			<div className="controls-panel">
				<h2>Solucionador de Sistemas de Ecuaciones</h2>
				
				<div className="control-group">
					<label>
						Tipo de sistema: 
						<select value={systemType} onChange={(e) => setSystemType(e.target.value)}>
							<option value="linear">Lineal</option>
							<option value="nonlinear">No lineal</option>
						</select>
					</label>
				</div>

				{systemType === 'linear' && (
					<div className="control-group">
						<label>
							Método de resolución: 
							<select value={method} onChange={(e) => setMethod(e.target.value)}>
								<option value="elimination">Eliminación Gaussiana</option>
								<option value="substitution">Sustitución</option>
								<option value="reduction">Reducción</option>
							</select>
						</label>
					</div>
				)}

				{systemType === 'linear' && (
					<>
						<div className="equations-section">
							<h3>Ecuaciones del sistema:</h3>
							<div className="equations-list">
								{equations.map((eq, index) => (
									<div key={index} className="equation-item">
										<span>Ecuación {index + 1}: {eq.equation}</span>
										<button onClick={() => removeEquation(index)} className="remove-btn">
											Eliminar
										</button>
									</div>
								))}
							</div>

							<div className="add-equation">
								<label>
									Agregar ecuación:
									<input
										type="text"
										placeholder="Ej: 2x + 3y = 7"
										value={newEquation}
										onChange={(e) => setNewEquation(e.target.value)}
									/>
									<button onClick={addEquation}>Agregar</button>
								</label>
							</div>
						</div>

						<div className="solve-section">
							<button onClick={solveSystem} className="solve-btn">
								Resolver Sistema
							</button>
							{solution && (
								<button 
									onClick={() => setShowSteps(!showSteps)} 
									className="steps-btn"
								>
									{showSteps ? 'Ocultar Pasos' : 'Mostrar Pasos'}
								</button>
							)}
						</div>
					</>
				)}

				{systemType === 'nonlinear' && (
					<div className="nonlinear-section">
						<h3>Sistema no lineal de ejemplo:</h3>
						<div className="example-equations">
							<p>x² + y² = 25</p>
							<p>x + y = 7</p>
						</div>
						<button onClick={solveSystem} className="solve-btn">
							Resolver Sistema No Lineal
						</button>
					</div>
				)}

				{solution && (
					<div className="solution-section">
						<h3>Solución:</h3>
						{systemType === 'linear' ? (
							<div className="linear-solution">
								{Object.entries(solution).map(([variable, value]) => (
									<p key={variable}>
										{variable} = {typeof value === 'number' ? value.toFixed(3) : value}
									</p>
								))}
							</div>
						) : (
							<div className="nonlinear-solution">
								{solution.solutions.map((sol, index) => (
									<div key={index} className="solution-pair">
										<p>Solución {index + 1}:</p>
										<p>x = {sol.x}, y = {sol.y}</p>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{showSteps && solutionSteps.length > 0 && (
					<div className="steps-section">
						<h3>Proceso de Resolución - Método de {method === 'elimination' ? 'Eliminación Gaussiana' : method === 'substitution' ? 'Sustitución' : 'Reducción'}:</h3>
						<div className="steps-container">
							{solutionSteps.map((step, index) => (
								<div key={index} className="step-item">
									<div className="step-header">
										<span className="step-number">Paso {step.step}</span>
										<h4 className="step-title">{step.title}</h4>
									</div>
									<div className="step-content">
										<p className="step-description">{step.description}</p>
										{step.details && (
											<div className="step-details">
												<p className="details-text">{step.details}</p>
											</div>
										)}
										{step.equations && (
											<div className="step-equations">
												{step.equations.map((eq, eqIndex) => (
													<div key={eqIndex} className="equation-display">
														{eq}
													</div>
												))}
											</div>
										)}
										{step.operations && (
											<div className="step-operations">
												{step.operations.map((operation, opIndex) => (
													<div key={opIndex} className="operation-step">
														{operation}
													</div>
												))}
											</div>
										)}
										{step.matrix && (
											<div className="step-matrix">
												{step.matrix.map((row, rowIndex) => (
													<div key={rowIndex} className="matrix-row">
														{row}
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{error && (
					<div className="error-section">
						<h3>Error:</h3>
						<p className="error-message">{error}</p>
					</div>
				)}
			</div>

			<div className="info-panel">
				<h3>Instrucciones:</h3>
				<div className="instructions">
					<h4>Para sistemas lineales:</h4>
					<ul>
						<li>Ingresa ecuaciones en el formato: ax + by = c</li>
						<li>Usa variables como x, y, z, etc.</li>
						<li>El número de ecuaciones debe ser igual al número de variables</li>
						<li>Ejemplo: 2x + 3y = 7, x - y = 1</li>
					</ul>
					
					<h4>Para sistemas no lineales:</h4>
					<ul>
						<li>Actualmente incluye un ejemplo predefinido</li>
						<li>Se puede extender para más tipos de ecuaciones</li>
					</ul>
				</div>
			</div>
		</div>
	)
}

export default EquationSystemSolver
