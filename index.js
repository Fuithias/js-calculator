// Array mapping numbers to their corresponding string representation
const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

// DOM element references for the number display and the calculation display
const numberElem = document.getElementById('number');
const calculationElem = document.getElementById('calculation');

// Add an event listener to the button container that listens for any button clicks
document.querySelector('.btns').addEventListener('click', handleClick);
numberElem.addEventListener('change', () => console.log('FU'));

// State variables to track if the answer is displayed and the currently selected number
let isAnswered = false;
let selectedNumber = null;

/**
 * Adjusts the font size of numberElem to fit within its parent container.
 */
function adjustFontSize() {
  const parentWidth = numberElem.parentElement.parentElement.clientWidth * 0.9;
  let fontSize = parseFloat(window.getComputedStyle(numberElem).fontSize);

  // Decrease font size until it fits within the parent width
  while (numberElem.scrollWidth > parentWidth && fontSize > 1) {
    fontSize -= 1;
    numberElem.style.fontSize = `${fontSize}px`;
  }

  // Increase font size if there's still room, but stop if it doesn't fit
  while (numberElem.scrollWidth < parentWidth && fontSize < 42) { // 42 is an arbitrary max font size
    fontSize += 1;
    numberElem.style.fontSize = `${fontSize}px`;
    if (numberElem.scrollWidth > parentWidth) {
      fontSize -= 1; // Step back to the last fitting size
      numberElem.style.fontSize = `${fontSize}px`;
      break;
    }
  }
}

/**
 * Display the calculation based on the operand provided.
 * 
 * @param {string} operand - The operation to perform (+, −, ×, ÷)
 */
function displayCalculation(operand) {
  const currentNumber = numberElem.textContent;

  if (!calculationElem.textContent || isAnswered) {
    // Start a new calculation or reset if answer was displayed
    isAnswered = false;
    calculationElem.textContent = `${currentNumber} ${operand} `;
    selectedNumber = currentNumber;
  } else if (currentNumber === selectedNumber) {
    // Update the operation if the same number is selected again
    calculationElem.textContent = `${calculationElem.textContent.split(' ')[0]} ${operand} `;
  } else {
    // Evaluate the expression and continue the calculation with the new operand
    calculationElem.textContent = `${evaluateExpression(calculationElem.textContent + currentNumber)} ${operand} `;
    selectedNumber = currentNumber;
  }
}

/**
 * Handle button clicks and delegate tasks based on the button's ID.
 * 
 * @param {Object} event - The click event object
 */
function handleClick({ target }) {
  const { id: targetID } = target;

  if (targetID === 'clear') {
    clearAll();
  } else if (targetID === 'clear-element') {
    clearElement();
  } else if (targetID === 'backspace') {
    handleBackspace();
  } else if (numbers.includes(targetID)) {
    handleNumber(targetID);
  } else if (targetID === 'point') {
    handlePoint();
  } else if (targetID === 'negation') {
    toggleNegation();
  } else {
    handleOperation(targetID);
  }
  adjustFontSize();
}

/**
 * Clear all the content in the calculator.
 */
function clearAll() {
  calculationElem.textContent = '';
  selectedNumber = null;
  numberElem.textContent = '0';
}

/**
 * Clear the current number or the whole calculation if an answer is displayed.
 */
function clearElement() {
  if (isAnswered) calculationElem.textContent = '';
  numberElem.textContent = '0';
}

/**
 * Remove the last character from the displayed number.
 */
function handleBackspace() {
  const currentText = numberElem.textContent;
  numberElem.textContent = currentText.length > 1 ? currentText.slice(0, -1) : '0';
}

/**
 * Handle number button clicks and update the display accordingly.
 * 
 * @param {string} targetID - The ID of the clicked number button
 */
function handleNumber(targetID) {
  const currentIndex = numbers.indexOf(targetID);

  if (numberElem.textContent === '0' || isAnswered) {
    // Start a new number entry
    if (isAnswered) {
      isAnswered = false;
      calculationElem.textContent = '';
    }
    numberElem.textContent = currentIndex;
  } else if (calculationElem.textContent && currentIndex === selectedNumber) {
    // Reset the selected number if it's clicked again
    selectedNumber = null;
  } else if (selectedNumber) {
    // Update the displayed number with the new selected number
    numberElem.textContent = currentIndex;
    selectedNumber = null;
  } else {
    // Append the number to the current entry
    numberElem.textContent += currentIndex;
  }
}

/**
 * Add a decimal point to the current number if it doesn't already have one.
 */
function handlePoint() {
  if (!numberElem.textContent.includes('.')) {
    numberElem.textContent += '.';
  }
}

/**
 * Toggle the sign of the current number between positive and negative.
 */
function toggleNegation() {
  numberElem.textContent = !numberElem.textContent.includes('-') && (numberElem.textContent !== '0')
    ? `-${numberElem.textContent}`
    : numberElem.textContent.replace('-', '');
}

/**
 * Handle arithmetic operations and evaluate expressions as needed.
 * 
 * @param {string} targetID - The ID of the clicked operation button
 */
function handleOperation(targetID) {
  switch (targetID) {
    case 'addition':
      displayCalculation('+');
      break;
    case 'subtraction':
      displayCalculation('−');
      break;
    case 'multiplication':
      displayCalculation('×');
      break;
    case 'division':
      displayCalculation('÷');
      break;
    case 'answer':
      if (!isAnswered) {
        // Display the final answer
        calculationElem.textContent += `${numberElem.textContent} =`;
        numberElem.textContent = evaluateExpression(calculationElem.textContent.replace(' =', ''));
        isAnswered = true;
      }
      break;
  }
}

/**
 * Parse the given mathematical expression into an array of tokens.
 * 
 * @param {string} expression - The mathematical expression as a string.
 * @returns {Array} An array of numbers and operators.
 * @throws Will throw an error if an invalid character is encountered.
 */
function parse(expression) {
  const tokens = [];
  let currentNumber = '';
  
  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];
    
    if (/\d/.test(char) || char === '.') {
      // Append digit or decimal point to the current number
      currentNumber += char;
    } else if ('+-*/'.includes(char)) {
      // If we have a current number, push it to tokens
      if (currentNumber) {
        tokens.push(parseFloat(currentNumber));
        currentNumber = '';
      }
      // Handle case where '-' might indicate a negative number
      if (char === '-' && (tokens.length === 0 || '+-*/'.includes(tokens[tokens.length - 1]))) {
        // Start building the next number as negative
        currentNumber = '-';
      } else {
        tokens.push(char);
      }
    } else if (char.trim() === '') {
      // Ignore spaces
      continue;
    } else {
      // Handle invalid characters by throwing an error
      throw new Error(`Invalid character in expression: ${char}`);
    }
  }
  
  // Push the last number if any
  if (currentNumber) {
    tokens.push(parseFloat(currentNumber));
  }
  
  return tokens;
}

/**
 * Evaluate the mathematical expression after parsing it.
 * 
 * @param {string} expression - The mathematical expression as a string.
 * @returns {number} The result of the evaluated expression.
 * @throws Will throw an error if an invalid operation is encountered.
 */
function evaluateExpression(expression) {
  // Replace custom symbols with standard operators and parse the expression
  const parts = parse(expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-'));

  const processed = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    switch (part) {
      case '+': {
        // Ignore the '+' sign as addition is implicit
        break;
      }
      case '-': {
        // Subtraction or negation
        const nextPart = parts[i + 1];
        if (typeof nextPart === 'number') {
          if (processed.length > 0 && typeof processed[processed.length - 1] === 'number') {
            processed.push(-nextPart);  // apply negation for subtraction
            i++;  // skip the next part since it's already been processed
          } else {
            processed.push(nextPart);  // apply negation for the first operand
            i++;
          }
        } else {
          throw new Error('Invalid expression: Expected a number after "-"');
        }
        break;
      }
      case '*': {
        // Perform multiplication on the last processed value and the next number
        const leftValue = processed.pop();
        const rightValue = parts[++i];
        if (typeof leftValue === 'number' && typeof rightValue === 'number') {
          processed.push(leftValue * rightValue);
        } else {
          throw new Error('Invalid expression: Expected numbers around "*"');
        }
        break;
      }
      case '/': {
        // Perform division on the last processed value and the next number
        const leftValue = processed.pop();
        const rightValue = parts[++i];
        if (typeof leftValue === 'number' && typeof rightValue === 'number') {
          processed.push(leftValue / rightValue);
        } else {
          throw new Error('Invalid expression: Expected numbers around "/"');
        }
        break;
      }
      default: {
        // Default case is expected to be a number, push it to the processed array
        if (typeof part === 'number') {
          processed.push(part);
        } else {
          throw new Error('Invalid expression: Unexpected token');
        }
      }
    }
  }

  // Add all processed numbers and return the final result
  return processed.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}