"use client"

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { result, error, EquationBoxProps } from "../types/common";
import { useVariableMap } from "./EquationContainer";

const EquationBox = forwardRef(({ evaluate }: EquationBoxProps, ref) => {

    const { variableMap, setVariableMap } = useVariableMap();
    const [display, setDisplay] = useState<string>("");

    const value = useRef("");


    useImperativeHandle(ref, () => ({
        evaluate() {
            const result = evaluateEquation(value.current);
            console.log(result);
            if (result.status) {
                setDisplay((result.data as result).dec as string);
            } else {
                setDisplay(error[(result.data as error)]);
            }
        }
    }));

    function evaluateEquation(input: string) : {status: boolean, data: result} | {status: boolean, data: error} {

        // Check for empty input
        if (input.length == 0) {
            return {status: true, data: {dec: "0", hex: "0", bin: "0"}};
        }
        
        // Check for incomplete parenthesis
        if (!evaluateParenthesis(input)) {
            return {status: false, data: error.MALFORMED_PARENTHESES};
        }
    
        const valueStack : (number | string) [] = [];
        const operatorStack : string[] = [];
    
        for (let index = 0; index < input.length; index++) {
    
            let radix = 10;
    
            // Ignore whitespace
            if (input.charAt(index) == " ") {
                continue;
            }
    
            // Check if the current token is numeric
            if (input.charCodeAt(index) >= 48 && input.charCodeAt(index) <= 57) {
    
                // Check if the current token is a radix specifier ("0x" or "0b")
                if (index < input.length - 2 && input.charAt(index) == "0") {
                    if (input.charAt(index + 1) == "x") {
                        radix = 16;
                        index += 2;
                    } else if (input.charAt(index + 1) == "b") {
                        radix = 2;
                        index += 2;
                    } 
                }
    
                let currentVal = 0; // Used for numeric processing
    
                // Process the remaining token
                while (index < input.length &&
                    (
                      (input.charCodeAt(index) >= 48 && input.charCodeAt(index) <= 57) ||  // 0-9
                      (input.charCodeAt(index) >= 97 && input.charCodeAt(index) <= 102) || // a-f
                      (input.charCodeAt(index) >= 65 && input.charCodeAt(index) <= 70)     // A-F
                    )
                ) {
                    currentVal = radix*currentVal + parseInt(input.charAt(index), radix);
                    index++;
                }
    
                // Check if number is implicitly multiplying parenthesis 
                if (input.charAt(index) == "(") {
                    input = input.slice(0, index + 1) + "*" + input.slice(index + 1);
                }
    
                // Add value to stack
                valueStack.push(currentVal);
    
            }
    
            // Check if the token is text (variable)
            if (
                (input.charCodeAt(index) >= 65 && input.charCodeAt(index) <= 90) ||
                (input.charCodeAt(index) >= 97 && input.charCodeAt(index) <= 122)
            ) {
    
                let currentToken = ""; // Used for text processing
    
                // Handle multi-character variables
                while (index < input.length && 
                    (
                        (input.charCodeAt(index) >= 65 && input.charCodeAt(index) <= 90) || 
                        (input.charCodeAt(index) >= 97 && input.charCodeAt(index) <= 122)
                    )
                ) {
                    currentToken += input.charAt(index);
                    index++;
                }
    
                // Check if number is implicitly multiplying parenthesis 
                if (input.charAt(index) == "(") {
                    input = input.slice(0, index + 1) + "*" + input.slice(index + 1);
                }
    
                valueStack.push(currentToken);
    
            }
    
            const currentChar = input.charAt(index);
    
            // Handle operators
    
            if (currentChar == "(") {
                operatorStack.push(currentChar);
            }
    
            if (currentChar == ")") {
    
                // Check for parenthesis multiplication
                if (index < input.length - 1 && input.charAt(index + 1) == "(") {
                    input = input.slice(0, index + 1) + "*" + input.slice(index + 1);
                }
    
                while (operatorStack[operatorStack.length - 1] != "(") {
                    const arg1 = valueStack.pop();
                    const arg2 = valueStack.pop();
                    const op = operatorStack.pop();
    
                    if (!arg1 || !arg2 || !op) {
                        return {status: false, data: error.MALFORMED_EXPRESSION};
                    }
    
                    const value = performOperation(arg1, arg2, op)
    
                    if (value == null) {
                        return {status: false, data: error.UNDEFINED_VARIABLE};
                    }
    
                    valueStack.push(value);
    
                }
                operatorStack.pop();
            }
    
            if (
                input.charAt(index) == "+" ||
                input.charAt(index) == "-" ||
                input.charAt(index) == "*" ||
                input.charAt(index) == "/" ||
                input.charAt(index) == "^" ||
                input.charAt(index) == "="
            ) {
                while (operatorStack.length > 0 && getPrecedence(operatorStack[operatorStack.length-1])! >= getPrecedence(input.charAt(index))!) {
                    const arg1 = valueStack.pop();
                    const arg2 = valueStack.pop();
                    const op = operatorStack.pop();
    
                    if (!arg1 || !arg2 || !op) {
                        return {status: false, data: error.MALFORMED_EXPRESSION};
                    }
    
                    const value = performOperation(arg1, arg2, op)
    
                    if (value == null) {
                        return {status: false, data: error.UNDEFINED_VARIABLE};
                    }
    
                    valueStack.push(value);
                }
                operatorStack.push(input.charAt(index));
            }
    
        }
    
        while (operatorStack.length > 0) {
            const arg1 = valueStack.pop();
            const arg2 = valueStack.pop();
            const op = operatorStack.pop();
    
            if (!arg1 || !arg2 || !op) {
                return {status: false, data: error.MALFORMED_EXPRESSION};
            }
    
            const value = performOperation(arg1, arg2, op)
    
            if (value == null) {
                return {status: false, data: error.UNDEFINED_VARIABLE};
            }
    
            valueStack.push(value);
        }
    
        var resultValue = valueStack[0];

        if (typeof(resultValue) == "string") {
            resultValue = variableMap.get(resultValue);

            if (!resultValue) {
                return {status: false, data: error.UNDEFINED_VARIABLE};
            }

        }
    
        return {status: true, data: {dec: resultValue.toString(10), hex: resultValue.toString(16), bin: resultValue.toString(2)}};
    
    }
    
    // Helper functions for math processing
    
    function performOperation (t1: number | string, t2: number | string, op: string) {
        
        if (typeof(t1) == "string") {
            const t1val = variableMap.get(t1);
            if (!t1val) {
                // ERROR: Undefined variable
                return null;
            }
            t1 = t1val as number; // Explicit declare as number
        }
    
        if (typeof(t2) == "string" && op != "=") {
            const t2val = variableMap.get(t2);
            if (!t2val) {
                // ERROR: Undefined variable
                return null;
            }
            t2 = t2val as number; // Explicit declare as number
        }
        
        switch(op) {
            case "+" : return t2 as number + t1;
            case "-" : return t2 as number - t1;
            case "*" : return t2 as number * t1;
            case "/" : return t1 == 0 ? 0 : Math.floor(t2 as number / t1); 
            case "^" : return Math.pow(t2 as number, t1);
            case "=" : {
                if (typeof t2 == "string") {
                    variableMap.set(t2, t1);
                    setVariableMap(new Map(variableMap));
                    return t1;
                }
            }
        }
    }
    
    function getPrecedence(op: string) {
        switch(op) {
            case "=" : return -1;
            case "+" : return 0;
            case "-" : return 0;
            case "*" : return 1;
            case "/" : return 1;
            case "^" : return 2;
        }
    }
    
    function evaluateParenthesis(input: string) {
        
        let result = 0;
    
        for (let index = 0; index < input.length; index++) {
            if (input.charAt(index) == "(") {
                result++;
            } else if (input.charAt(index) == ")") {
                result--;
            }
        }
    
        return result == 0;
    
    }
    

    return (
        <div
            style={{
                backgroundColor: 'red'
            }}
        >
            <input
                onChange={(e) => {
                    value.current = e.target.value;
                    evaluate();
                }}
            />
            <p>
                Output: {display}
            </p>
        </div>
    )
});

export default EquationBox;