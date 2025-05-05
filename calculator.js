class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear(); // Initialize the calculator
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') {
            this.currentOperand = '0';
        }
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return; // Prevent multiple decimals
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString(); // Replace initial '0'
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '0' && this.previousOperand === '' && !['sin', 'cos', 'tan'].includes(operation)) return; // Don't allow operation if only '0' is displayed, unless it's a trig function

        if (this.previousOperand !== '' && !['sin', 'cos', 'tan'].includes(operation)) {
            this.compute(); // Compute if there's a previous non-trig operation
        }

        if (['sin', 'cos', 'tan'].includes(operation)) {
            this.operation = operation;
            this.previousOperand = this.currentOperand; // Store the number for trig function
            this.currentOperand = '0'; // Reset current for the result or next input
        } else {
            this.operation = operation;
            this.previousOperand = this.currentOperand;
            this.currentOperand = '0'; // Reset current for next input
        }
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        // Handle trigonometric functions first
        if (this.operation === 'sin') {
            if (isNaN(prev)) return;
            computation = Math.sin(prev * Math.PI / 180); // Convert degrees to radians
        } else if (this.operation === 'cos') {
            if (isNaN(prev)) return;
            computation = Math.cos(prev * Math.PI / 180); // Convert degrees to radians
        } else if (this.operation === 'tan') {
            if (isNaN(prev)) return;
             // Handle tan(90) and tan(270) which are undefined
            if (Math.abs(Math.cos(prev * Math.PI / 180)) < 1e-10) { // Check if cosine is close to zero
                 computation = 'Error'; // Or handle this as an error
            } else {
                computation = Math.tan(prev * Math.PI / 180); // Convert degrees to radians
            }
        } else {
            // Handle standard arithmetic operations
            if (isNaN(prev) || isNaN(current)) return; // Handle cases where input is not a number

            switch (this.operation) {
                case '+':
                    computation = prev + current;
                    break;
                case '-':
                    computation = prev - current;
                    break;
                case '×':
                    computation = prev * current;
                    break;
                case '÷':
                    if (current === 0) {
                        computation = 'Error: Division by zero'; // Handle division by zero
                    } else {
                        computation = prev / current;
                    }
                    break;
                default:
                    return; // Do nothing if no valid operation
            }
        }

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
    }

    getDisplayNumber(number) {
        if (number === 'Error' || number === 'Error: Division by zero') {
            return number; // Display error messages directly
        }

        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return ${integerDisplay}.${decimalDigits};
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null && !['sin', 'cos', 'tan'].includes(this.operation)) {
            this.previousOperandTextElement.innerText =
                ${this.getDisplayNumber(this.previousOperand)} ${this.operation};
        } else if (['sin', 'cos', 'tan'].includes(this.operation)) {
             this.previousOperandTextElement.innerText =
                ${this.operation}(${this.getDisplayNumber(this.previousOperand)});
        }
        else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

// Get references to the HTML elements
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.querySelector('[data-operation="equals"]');
const deleteButton = document.querySelector('[data-operation="delete"]');
const allClearButton = document.querySelector('[data-operation="clear"]');
const previousOperandTextElement = document.querySelector('.previous-operand');
const currentOperandTextElement = document.querySelector('.current-operand');

// Create a new Calculator instance
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Add event listeners to buttons

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

operationButtons.forEach(button => {
    const operation = button.dataset.operation;
    if (operation !== 'equals' && operation !== 'delete' && operation !== 'clear') {
        button.addEventListener('click', () => {
            calculator.chooseOperation(button.innerText);
            calculator.updateDisplay();
        });
    }
});

equalsButton.addEventListener('click', button => {
    calculator.compute();
    calculator.updateDisplay();
});

allClearButton.addEventListener('click', button => {
    calculator.clear();
    calculator.updateDisplay();
});

deleteButton.addEventListener('click', button => {
    calculator.delete();
    calculator.updateDisplay();
});

// Handle Keyboard Input

document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key >= '0' && key <= '9') {
        calculator.appendNumber(key);
        calculator.updateDisplay();
    } else if (key === '.') {
        calculator.appendNumber(key);
        calculator.updateDisplay();
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        let operationSymbol;
        switch (key) {
            case '*':
                operationSymbol = '×';
                break;
            case '/':
                operationSymbol = '÷';
                break;
            default:
                operationSymbol = key;
        }
        calculator.chooseOperation(operationSymbol);
        calculator.updateDisplay();
    } else if (key === 'Enter' || key === '=') {
        calculator.compute();
        calculator.updateDisplay();
    } else if (key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    } else if (key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
    // Note: Handling keyboard input for trig functions is more complex
    // as they are typically multi-character inputs (e.g., "sin").
    // For simplicity, we'll only handle button clicks for trig functions in this example.
});