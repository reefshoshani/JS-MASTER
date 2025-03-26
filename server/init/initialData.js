const CodeBlock = require('../models/CodeBlock');

const initialCodeBlocks = [
    {
        title: "Async Case",
        description: "Practice async/await with a simple API call",
        initialCode: `// Write a function that fetches data from an API
// and returns the first user's name
async function getFirstUserName() {
    // Your code here
}

// Example usage:
// getFirstUserName().then(console.log);`,
        solution: `async function getFirstUserName() {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const users = await response.json();
    return users[0].name;
}`,
        hints: [
            {
                text: "Remember to use the 'await' keyword when calling fetch",
                code: "const response = await fetch(url);"
            },
            {
                text: "Don't forget to parse the JSON response",
                code: "const data = await response.json();"
            }
        ]
    },
    {
        title: "Array Methods",
        description: "Practice array methods with a list of numbers",
        initialCode: `// Write a function that:
// 1. Filters out even numbers
// 2. Multiplies each remaining number by 2
// 3. Sums up all the results
function processNumbers(numbers) {
    // Your code here
}

// Example usage:
// console.log(processNumbers([1, 2, 3, 4, 5]));`,
        solution: `function processNumbers(numbers) {
    return numbers
        .filter(num => num % 2 !== 0)
        .map(num => num * 2)
        .reduce((sum, num) => sum + num, 0);
}`,
        hints: [
            {
                text: "Use filter() to keep only odd numbers",
                code: "numbers.filter(num => num % 2 !== 0)"
            },
            {
                text: "Use map() to multiply each number",
                code: "numbers.map(num => num * 2)"
            },
            {
                text: "Use reduce() to sum up the numbers",
                code: "numbers.reduce((sum, num) => sum + num, 0)"
            }
        ]
    },
    {
        title: "Promise Chain",
        description: "Practice chaining promises",
        initialCode: `// Write a function that:
// 1. Waits 1 second
// 2. Returns "Hello"
// 3. Waits 1 second
// 4. Returns "World"
// 5. Waits 1 second
// 6. Returns "!"
function delayedGreeting() {
    // Your code here
}

// Example usage:
// delayedGreeting().then(console.log);`,
        solution: `function delayedGreeting() {
    return new Promise(resolve => setTimeout(() => resolve("Hello"), 1000))
        .then(result => new Promise(resolve => setTimeout(() => resolve(result + " World"), 1000)))
        .then(result => new Promise(resolve => setTimeout(() => resolve(result + "!"), 1000)));
}`,
        hints: [
            {
                text: "Create a Promise that resolves after a delay",
                code: "new Promise(resolve => setTimeout(() => resolve(value), 1000))"
            },
            {
                text: "Chain promises using .then()",
                code: "promise.then(result => nextPromise)"
            }
        ]
    },
    {
        title: "Object Manipulation",
        description: "Practice object manipulation and destructuring",
        initialCode: `// Write a function that:
// 1. Takes an object with name, age, and hobbies
// 2. Returns a new object with:
//    - fullName (name in uppercase)
//    - isAdult (true if age >= 18)
//    - hobbiesCount (number of hobbies)
function transformPerson(person) {
    // Your code here
}

// Example usage:
// console.log(transformPerson({
//     name: "John Doe",
//     age: 25,
//     hobbies: ["reading", "gaming"]
// }));`,
        solution: `function transformPerson(person) {
    const { name, age, hobbies } = person;
    return {
        fullName: name.toUpperCase(),
        isAdult: age >= 18,
        hobbiesCount: hobbies.length
    };
}`,
        hints: [
            {
                text: "Use object destructuring to extract properties",
                code: "const { name, age, hobbies } = person;"
            },
            {
                text: "Create a new object with computed properties",
                code: "return { fullName: name.toUpperCase(), ... }"
            }
        ]
    },
    {
        title: "Event Handling",
        description: "Practice event handling and DOM manipulation",
        initialCode: `// Write a function that:
// 1. Creates a button element
// 2. Adds a click event listener
// 3. Changes the button's text on click
// 4. Returns the button element
function createInteractiveButton() {
    // Your code here
}

// Example usage:
// document.body.appendChild(createInteractiveButton());`,
        solution: `function createInteractiveButton() {
    const button = document.createElement('button');
    button.textContent = 'Click me!';
    button.addEventListener('click', () => {
        button.textContent = 'Clicked!';
    });
    return button;
}`
    },
    {
        title: "Error Handling",
        description: "Practice try-catch and error handling",
        initialCode: `// Write a function that:
// 1. Takes a number as input
// 2. Returns its square root
// 3. Throws an error if the input is negative
// 4. Handles the error and returns "Invalid input"
function safeSquareRoot(number) {
    // Your code here
}

// Example usage:
// console.log(safeSquareRoot(16)); // 4
// console.log(safeSquareRoot(-1)); // "Invalid input"`,
        solution: `function safeSquareRoot(number) {
    try {
        if (number < 0) {
            throw new Error('Cannot calculate square root of negative number');
        }
        return Math.sqrt(number);
    } catch (error) {
        return "Invalid input";
    }
}`
    },
    {
        title: "Array Sorting",
        description: "Practice array sorting and comparison functions",
        initialCode: `// Write a function that:
// 1. Takes an array of objects with name and age
// 2. Sorts them by age in descending order
// 3. Returns the sorted array
function sortByAge(people) {
    // Your code here
}

// Example usage:
// console.log(sortByAge([
//     { name: "Alice", age: 25 },
//     { name: "Bob", age: 30 },
//     { name: "Charlie", age: 20 }
// ]));`,
        solution: `function sortByAge(people) {
    return [...people].sort((a, b) => b.age - a.age);
}`
    }
];

const initializeDatabase = async () => {
    try {
        // Clear existing data
        await CodeBlock.deleteMany({});
        
        // Insert initial data
        await CodeBlock.insertMany(initialCodeBlocks);
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

module.exports = initializeDatabase; 