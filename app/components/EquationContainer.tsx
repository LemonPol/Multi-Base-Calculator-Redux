"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react";
import EquationBox from "./EquationBox";
import React from "react";

const VariableContext = createContext<any>(null);

function EquationContainer() {

    const [variableMap, setVariableMap] = useState(new Map<string, number | string>());
    
    const [equationBoxes, setEquationBoxes] = useState<number[]>([]);
    const refs = useRef(new Map<number, React.RefObject<any>>());

    const addEquationBox = () => {
        setEquationBoxes((prevBoxes) => [...prevBoxes, prevBoxes.length]); // Add a new EquationBox with a unique key
    };

    const removeEquationBox = (index: number) => {
        setEquationBoxes((prev) => prev.filter((_, i) => i !== index)); // Remove by index
        refs.current.delete(index); // Remove the ref when the EquationBox is removed
    };

    useEffect(() => {
        equationBoxes.forEach((_, index) => {
            if (!refs.current.has(index)) {
                refs.current.set(index, React.createRef());
            }
        });
    }, [equationBoxes]);

    const evaluateAll = () => {

        // Reset variablemap to prevent stale variables
        setVariableMap(new Map());

        setTimeout(() => {
            equationBoxes.forEach((_, index) => {
                const equationBoxRef = refs.current.get(index);
                if (equationBoxRef && equationBoxRef.current) {
                    equationBoxRef.current.evaluate();
                }
            });
        }, 0);
    };

    const updateMap = (key: string, value: number) => {
      const newMap = new Map(variableMap);
      newMap.set(key, value);
      setVariableMap(newMap);
    };
  
    return (
        <div>
            <button
                onClick={() => {
                    addEquationBox();
                }}
            >
                Add equation box
            </button>
            <VariableContext.Provider value={{ variableMap, setVariableMap }}>
                {equationBoxes.map((index) => {
                    if (!refs.current.has(index)) {
                        refs.current.set(index, React.createRef());
                    }
                    return (
                        <EquationBox 
                            key={index} 
                            ref={refs.current.get(index)}
                            evaluate={evaluateAll}
                        />
                    );
                })}
            </VariableContext.Provider>
        </div>
    )
}

export const useVariableMap = () => {
    return useContext(VariableContext);
};

export default EquationContainer;