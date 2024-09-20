"use client"

import { createContext, useContext, useState } from "react";
import EquationBox from "./EquationBox";

const VariableContext = createContext<any>(null);

function EquationContainer() {

    const [variableMap, setVariableMap] = useState(new Map<string, number | string>());
    const [equationBoxes, setEquationBoxes] = useState<number[]>([0]);

    // Function to add a new EquationBox to the list
    const addEquationBox = () => {
        setEquationBoxes((prevBoxes) => [...prevBoxes, prevBoxes.length]); // Add a new EquationBox with a unique key
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
                    console.log(variableMap);
                }}
            >
                Hello!
            </button>
            <VariableContext.Provider value={{ variableMap, setVariableMap }}>
                <EquationBox/>
                <EquationBox/>
            </VariableContext.Provider>
        </div>
    )
}

export const useVariableMap = () => {
    return useContext(VariableContext);
};

export default EquationContainer;