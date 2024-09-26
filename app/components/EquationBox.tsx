"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { result, error, EquationBoxProps, evaluation } from "../types/common";
import { useVariableMap } from "./EquationContainer";
import Selector from "./Selector";

const EquationBox = forwardRef(({ evaluate, id, setactive, activeid, processinput}: EquationBoxProps, ref) => {

    const { variableMap, setVariableMap } = useVariableMap();
    const [evaluation, setEvaluation] = useState<evaluation>();
    const [display, setDisplay] = useState<string>();
    const [base, setBase] = useState<Number>(0);

    const inputRef = useRef<HTMLInputElement>(null);

    const value = useRef("");

    useImperativeHandle(ref, () => ({
        focus() {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
                inputRef.current.focus();
            }
        },
        evaluate() {
            const result = evaluateEquation(value.current);
            setEvaluation(result);
            if (result.status) {
                const data = result.data as result;
                switch(base) {
                    case 0 : setDisplay((data.dec)); break;
                    case 1 : setDisplay((data.hex)); break;
                    case 2 : setDisplay((data.bin)); break;
                }

            } else {
                setDisplay(" ");
            }
        },
        input() {
            if (inputRef.current) {
                return inputRef.current.value;
            }
        }
    }));

    function evaluateEquation(input: string) : evaluation {

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
    
                    if (arg1 == null || arg2 == null || op == null) {
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
                input.charAt(index) == "=" ||
                input.charAt(index) == "&" ||
                input.charAt(index) == "|" ||
                input.charAt(index) == "~"
            ) {
                while (operatorStack.length > 0 && getPrecedence(operatorStack[operatorStack.length-1])! >= getPrecedence(input.charAt(index))!) {
                    const arg1 = valueStack.pop();
                    const arg2 = valueStack.pop();
                    const op = operatorStack.pop();
    
                    if (arg1 == null || arg2 == null || op == null) {
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

            if (input.charAt(index) && !(
                (input.charCodeAt(index) >= 48 && input.charCodeAt(index) <= 57) ||  // 0-9
                (input.charCodeAt(index) >= 65 && input.charCodeAt(index) <= 90) ||  // A-Z
                (input.charCodeAt(index) >= 97 && input.charCodeAt(index) <= 122) || // a-z
                input.charAt(index) == " " ||
                input.charAt(index) == "(" ||
                input.charAt(index) == ")" ||
                input.charAt(index) == "+" ||
                input.charAt(index) == "-" ||
                input.charAt(index) == "*" ||
                input.charAt(index) == "/" ||
                input.charAt(index) == "^" ||
                input.charAt(index) == "=" ||
                input.charAt(index) == "&" ||
                input.charAt(index) == "|" ||
                input.charAt(index) == "~" 
            )) {
                // ERROR: Unexpected character!
                return {status: false, data: error.INVALID_CHARACTER};
            }

        }
    
        while (operatorStack.length > 0) {
            const arg1 = valueStack.pop();
            const arg2 = valueStack.pop();
            const op = operatorStack.pop();
    
            if (arg1 == null || arg2 == null || op == null) {
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

            if (resultValue == null) {
                return {status: false, data: error.UNDEFINED_VARIABLE};
            }

        }
    
        return {status: true, data: {dec: toFixed(resultValue as number), hex: resultValue.toString(16), bin: resultValue.toString(2)}};
    
    }
    
    // Helper functions for math processing
    
    function performOperation (t1: number | string, t2: number | string, op: string) {
        
        if (typeof(t1) == "string") {
            const t1val = variableMap.get(t1);
            if (t1val == null) {
                // ERROR: Undefined variable
                return null;
            }
            t1 = t1val as number; // Explicit declare as number
        }
    
        if (typeof(t2) == "string" && op != "=") {
            const t2val = variableMap.get(t2);
            if (t2val == null) {
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
            case "&" : return (t2 as number) & t1;
            case "|" : return (t2 as number) | t1;
            case "~" : return (t2 as number) ^ t1; 
        }
    }
    
    function getPrecedence(op: string) {
        switch(op) {
            case "=" : return -1;
            case "+" : return 0;
            case "-" : return 0;
            case "*" : return 1;
            case "/" : return 1;
            case "&" : return 1;
            case "|" : return 1;
            case "~" : return 1;
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
    
    function toFixed(x: number): string {
    if (Math.abs(x) < 0 || Math.abs(x) > 1e6) {
        return x.toExponential(6);
    } else {
        return x.toFixed(6).replace(/\.?0+$/, '');
    }
    }
      


    return (
        <div className="h-15 p-2 w-full overflow-hidden">
            <div className="flex overflow-hidden">
                <input
                    className="w-[300px] rounded-md pl-2 outline-none overflow-hidden bg-slate-100	"
                    ref={inputRef}
                    onChange={(e) => {
                        value.current = e.target.value;
                        evaluate();
                    }}
                    onSelect={(e) => {
                        setactive(id);
                    }}
                    onKeyDown={(e) =>{
                        processinput(e, id)
                    }}
                    id={id}
                />
                <p
                    className="w-[148px] rounded-md px-2 mx-2 flex items-center align-center overflow-auto scrollbar-hide bg-slate-100"
                >
                    {display || "0"}
                    {evaluation?.status == false && (
                        <span className="w-full group flex items-center justify-center">
                            <span className="text-red-500 cursor-pointer">⚠️</span>
                            <span className="absolute right-full mr-2 w-max p-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                {error[evaluation.data as error]}
                            </span>
                        </span>
                    )}
                </p>
                <Selector
                    containerNum={1}
                    setBase={setBase}
                    evaluate={evaluate}
                />
            </div>
            <hr className="border-t-2 border-slate-600 w-[600px] mt-2 -mb-2 -mx-2" />
        </div>
    )
});

export default EquationBox;