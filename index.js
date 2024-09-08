type Operation = 'add' | 'subtract' | 'multiply' | 'divide' | '>' | '<' | '>=' | '<=' | '=';

const printInstructions = (): void => {
    console.log('Welcome to the CLI Calculator!');
    console.log('Usage:');
    console.log('1. add <number1> <number2> : Adds two numbers');
    console.log('2. subtract <number1> <number2> : Subtracts two numbers');
    console.log('3. multiply <number1> <number2> : Multiplies two numbers');
    console.log('4. divide <number1> <number2> : Divides two numbers');
    console.log('5. > <number1> <number2> : Checks if number1 is greater than number2');
    console.log('6. < <number1> <number2> : Checks if number1 is less than number2');
    console.log('7. >= <number1> <number2> : Checks if number1 is greater than or equal to number2');
    console.log('8. <= <number1> <number2> : Checks if number1 is less than or equal to number2');
    console.log('9. = <number1> <number2> : Checks if number1 equals number2');
    console.log('10. game : Start game mode');
    console.log('11. exit : Exit the calculator');
};

const add = (a: number, b: number): number => {
    return a + b;
};

const subtract = (a: number, b: number): number => {
    return a - b;
};

const multiply = (a: number, b: number): number => {
    return a * b;
};

const divide = (a: number, b: number): number => {
    if (b === 0) {
        console.log('Error: Division by zero is not allowed.');
        return NaN;
    }
    return a / b;
};

const greaterThan = (a: number, b: number): boolean => a > b;
const lessThan = (a: number, b: number): boolean => a < b;
const greaterThanOrEqual = (a: number, b: number): boolean => a >= b;
const lessThanOrEqual = (a: number, b: number): boolean => a <= b;
const equal = (a: number, b: number): boolean => a === b;

const processInput = (input: string): void => {
    const args: string[] = input.split(' ');

    if (args.length < 3) {
        console.log('Error: Invalid input. Please provide an operation and two numbers.');
        return;
    }

    const operation: Operation = args[0] as Operation;
    const num1: number = parseFloat(args[1]);
    const num2: number = parseFloat(args[2]);

    if (isNaN(num1) || isNaN(num2)) {
        console.log('Error: Invalid numbers.');
        return;
    }

    let result: number | boolean;

    switch (operation) {
        case 'add':
            result = add(num1, num2);
            console.log(`Result: ${result}`);
            break;
        case 'subtract':
            result = subtract(num1, num2);
            console.log(`Result: ${result}`);
            break;
        case 'multiply':
            result = multiply(num1, num2);
            console.log(`Result: ${result}`);
            break;
        case 'divide':
            result = divide(num1, num2);
            if (!isNaN(result)) {
                console.log(`Result: ${result}`);
            }
            break;
        case '>':
            result = greaterThan(num1, num2);
            console.log(`Result: ${num1} > ${num2} is ${result}`);
            break;
        case '<':
            result = lessThan(num1, num2);
            console.log(`Result: ${num1} < ${num2} is ${result}`);
            break;
        case '>=':
            result = greaterThanOrEqual(num1, num2);
            console.log(`Result: ${num1} >= ${num2} is ${result}`);
            break;
        case '<=':
            result = lessThanOrEqual(num1, num2);
            console.log(`Result: ${num1} <= ${num2} is ${result}`);
            break;
        case '=':
            result = equal(num1, num2);
            console.log(`Result: ${num1} = ${num2} is ${result}`);
            break;
        default:
            console.log('Error: Unsupported operation. Supported operations are: add, subtract, multiply, divide, >, <, >=, <=, =.');
    }
};

const promptInput = (message: string): string | null => {
    return window.prompt(message);
};

const runAssertions = (): void => {
    console.assert(add(1, 1) === 2, 'Add function failed');
    console.assert(subtract(5, 3) === 2, 'Subtract function failed');
    console.assert(multiply(2, 3) === 6, 'Multiply function failed');
    console.assert(divide(6, 2) === 3, 'Divide function failed');
    
    console.assert(greaterThan(3, 2) === true, 'Greater than function failed');
    console.assert(lessThan(2, 3) === true, 'Less than function failed');
    console.assert(greaterThanOrEqual(3, 3) === true, 'Greater than or equal function failed');
    console.assert(lessThanOrEqual(3, 3) === true, 'Less than or equal function failed');
    console.assert(equal(3, 3) === true, 'Equal function failed');
    
    console.assert(add(0, 0) === 0, 'Add function with zeros failed');
    console.assert(subtract(10, 0) === 10, 'Subtract function with zero failed');
    console.assert(multiply(5, 0) === 0, 'Multiply function with zero failed');
    console.assert(divide(10, 2) === 5, 'Divide function failed');
    console.assert(divide(10, 0) !== divide(10, 0), 'Division by zero should return NaN');
    
    console.assert(greaterThan(100, 99) === true, 'Greater than check failed');
    console.assert(lessThan(99, 100) === true, 'Less than check failed');
    console.assert(greaterThanOrEqual(100, 100) === true, 'Greater than or equal check failed');
    console.assert(lessThanOrEqual(100, 100) === true, 'Less than or equal check failed');
    console.assert(equal(5, 5) === true, 'Equal check failed');
    console.assert(equal(5, 6) === false, 'Non-equal check failed');
};

const getRandomOperation = (): Operation => {
    const operations: Operation[] = ['add', 'subtract', 'multiply', 'divide'];
    return operations[Math.floor(Math.random() * operations.length)];
};

const generateEquation = (): { num1: number, num2: number, operation: Operation } => {
    const num1 = Math.floor(Math.random() * 100);
    const num2 = Math.floor(Math.random() * 100);
    const operation = getRandomOperation();
    return { num1, num2, operation };
};

const gameMode = (): void => {
    console.log('Game mode: Solve equations as quickly as possible!');
    let score = 0;
    let play = true;

    while (play) {
        const { num1, num2, operation } = generateEquation();
        let correctAnswer: number;

        switch (operation) {
            case 'add':
                correctAnswer = add(num1, num2);
                break;
            case 'subtract':
                correctAnswer = subtract(num1, num2);
                break;
            case 'multiply':
                correctAnswer = multiply(num1, num2);
                break;
            case 'divide':
                correctAnswer = divide(num1, num2);
                break;
            default:
                correctAnswer = NaN;
        }

        const startTime = Date.now();
        const userAnswer = promptInput(`Solve: ${num1} ${operation} ${num2}`);
        const timeTaken = (Date.now() - startTime) / 1000;

        if (timeTaken > 10) {
            console.log('Too slow! You have 10 seconds to answer.');
            play = false;
        } else if (parseFloat(userAnswer || '') === correctAnswer) {
            console.log(`Correct! Time taken: ${timeTaken.toFixed(2)} seconds`);
            score++;
        } else {
            console.log(`Wrong answer. Correct answer was ${correctAnswer}.`);
            play = false;
        }
    }

    console.log(`Game over! Your score: ${score}`);
};

const askInput = (): void => {
    let input: string | null = '';

    while (input !== 'exit') {
        input = promptInput('Enter command (or "exit" to quit):');

        if (input === null || input === 'exit') {
            console.log('Goodbye!');
            break;
        } else if (input === 'game') {
            gameMode();
        } else {
            processInput(input);
        }
    }
};

const startCalculator = (): void => {
    printInstructions();
    runAssertions();
    askInput();
};

startCalculator();
