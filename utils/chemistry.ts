// Utility for parsing and balancing chemical equations using Matrix method (Gaussian Elimination)

type MoleculeMap = Record<string, number>;

function parseMolecule(formula: string): MoleculeMap {
  const map: MoleculeMap = {};
  const regex = /([A-Z][a-z]?)(\d*)|(\()|(\))(\d*)/g;
  const stack: MoleculeMap[] = [map];
  let match;

  while ((match = regex.exec(formula)) !== null) {
    if (match.index === regex.lastIndex) {
      regex.lastIndex++; 
    }
    
    if (match[1]) { // Element
      const element = match[1];
      const count = parseInt(match[2] || '1', 10);
      const currentMap = stack[stack.length - 1];
      currentMap[element] = (currentMap[element] || 0) + count;
    } else if (match[3]) { // (
      stack.push({});
    } else if (match[4]) { // )
      const multiplier = parseInt(match[5] || '1', 10);
      const group = stack.pop();
      const currentMap = stack[stack.length - 1];
      if (group) {
        for (const [el, count] of Object.entries(group)) {
          currentMap[el] = (currentMap[el] || 0) + count * multiplier;
        }
      }
    }
  }
  return map;
}

// Greatest Common Divisor
function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

// Least Common Multiple
function lcm(a: number, b: number): number {
    return (a * b) / gcd(a, b);
}

export function balanceChemicalEquation(equationString: string): string {
  try {
    const cleanEq = equationString.replace(/\s+/g, '');
    const separatorMatch = cleanEq.match(/->|→|=/);
    if (!separatorMatch) return "Invalid format. Use 'Reactants -> Products'";
    
    const [leftStr, rightStr] = cleanEq.split(separatorMatch[0]);
    if (!leftStr || !rightStr) return "Invalid format.";

    const reactantFormulas = leftStr.split('+').filter(Boolean);
    const productFormulas = rightStr.split('+').filter(Boolean);
    
    const reactants = reactantFormulas.map(parseMolecule);
    const products = productFormulas.map(parseMolecule);

    // Collect all unique elements
    const allElements = Array.from(new Set([
        ...reactants.flatMap(m => Object.keys(m)),
        ...products.flatMap(m => Object.keys(m))
    ]));

    const numRows = allElements.length;
    const numCols = reactants.length + products.length;

    // Build the matrix
    // Each column corresponds to a molecule (reactants positive, products negative)
    // Each row corresponds to an element count
    const matrix: number[][] = allElements.map(el => {
        const row: number[] = [];
        reactants.forEach(m => row.push(m[el] || 0));
        products.forEach(m => row.push(-(m[el] || 0)));
        return row;
    });

    // Gaussian Elimination
    let lead = 0;
    for (let r = 0; r < numRows; r++) {
        if (numCols <= lead) break;
        
        let i = r;
        while (matrix[i][lead] === 0) {
            i++;
            if (numRows === i) {
                i = r;
                lead++;
                if (numCols === lead) return "Could not balance";
            }
        }

        // Swap rows
        const temp = matrix[i];
        matrix[i] = matrix[r];
        matrix[r] = temp;

        // Normalize row
        let val = matrix[r][lead];
        for (let j = 0; j < numCols; j++) {
            matrix[r][j] /= val;
        }

        // Eliminate other rows
        for (let i = 0; i < numRows; i++) {
            if (i === r) continue;
            val = matrix[i][lead];
            for (let j = 0; j < numCols; j++) {
                matrix[i][j] -= val * matrix[r][j];
            }
        }
        lead++;
    }

    // Solve for coefficients
    // We have free variables. Assume the last variable is 1, determine others.
    
    const coeffs = new Array(numCols).fill(0);
    // Identify pivot columns
    const pivots: number[] = [];
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
             // Find the first 1 (approx)
             if (Math.abs(matrix[r][c] - 1) < 1e-6) {
                 pivots.push(c);
                 break;
             }
        }
    }

    // Set free variable (last one) to 1
    coeffs[numCols - 1] = 1;

    // Back substitute
    for (let i = 0; i < pivots.length; i++) {
        const pivotCol = pivots[i];
        // The value in the last column for this row
        const val = matrix[i][numCols - 1];
        coeffs[pivotCol] = -val; 
    }
    
    // Normalize to integers
    // Find LCM of denominators
    let maxDenom = 1;
    for (const c of coeffs) {
        if (Math.abs(c) < 1e-6) { coeffs[numCols-1] = 0; break; } // Failed
        let den = 1;
        while (Math.abs(c * den - Math.round(c * den)) > 1e-4 && den < 1000) {
            den++;
        }
        maxDenom = lcm(maxDenom, den);
    }
    
    const finalCoeffs = coeffs.map(c => Math.round(c * maxDenom));

    // Validation
    if (finalCoeffs.some(c => c <= 0)) return "Could not balance (Check equation)";

    // Construct string
    let result = "";
    reactantFormulas.forEach((form, i) => {
        const c = finalCoeffs[i];
        result += (i > 0 ? " + " : "") + (c > 1 ? c : "") + form;
    });
    result += " \\rightarrow ";
    productFormulas.forEach((form, i) => {
        const c = finalCoeffs[reactants.length + i];
        result += (i > 0 ? " + " : "") + (c > 1 ? c : "") + form;
    });
    
    return result;

  } catch (e) {
    return "Error parsing equation";
  }
}