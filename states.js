const fs = require('fs');
const path = require('path');

const statesDirectory = path.join(__dirname, 'states');

// Ensure the states directory exists
if (!fs.existsSync(statesDirectory)) {
    fs.mkdirSync(statesDirectory);
}

/**
 * Saves the state to a JSON file in the ./states directory.
 * @param {string} stateName - The name of the state.
 * @param {*} value - The value to save.
 */
function saveState(stateName, value) {
    const filePath = path.join(statesDirectory, `${stateName}.json`);
    const jsonData = JSON.stringify(value, null, 2);
    fs.writeFileSync(filePath, jsonData, 'utf-8');
}

/**
 * Reads and parses the state from a JSON file in the ./states directory.
 * @param {string} stateName - The name of the state to read.
 * @returns {*} The parsed value of the state, or undefined if the state file is not found.
 */
function readState(stateName) {
    const filePath = path.join(statesDirectory, `${stateName}.json`);
    if (!fs.existsSync(filePath)) {
        return undefined;
    }
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(jsonData);
}

module.exports = { saveState, readState };

// Example usage
// saveState('exampleState', { foo: 'bar' });
// const state = readState('exampleState');
// console.log(state);
