"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react";
import EquationBox from "./EquationBox";
import React from "react";

const VariableContext = createContext<any>(null);

function EquationContainer() {
    const [variableMap, setVariableMap] = useState(new Map<string, number | string>());
    const [equationBoxes, setEquationBoxes] = useState<string[]>(["box-0"]);

    const [activeBox, setActiveBox] = useState<string>("box-0");

    const refs = useRef(new Map<string, React.RefObject<any>>());

    const generateUniqueId = () => {
        return `equationBox-${Math.random().toString(36)}`;
    };

    const addEquationBox = (id: string) => {
        const newId = generateUniqueId();
        setEquationBoxes((prevBoxes) => {
            const newIndex = prevBoxes.indexOf(id) + 1;
            return [
                ...prevBoxes.slice(0, newIndex),
                newId,
                ...prevBoxes.slice(newIndex),
            ];
        });

        setTimeout(() => {
            setActiveBox(newId);
        })
    };

    const removeEquationBox = (id: string) => {
        setEquationBoxes((prevBoxes) => {
            const removeIndex = prevBoxes.indexOf(id) + 1;
            return [
                ...prevBoxes.slice(0, removeIndex - 1),
                ...prevBoxes.slice(removeIndex),
            ];
        });
        refs.current.delete(id);
    };

    const processInput = (e: React.KeyboardEvent, id: string) => {
        
        const activeIndex = equationBoxes.indexOf(id);
        const activeRef = refs.current.get(id);

        if (e.key === 'Enter') {
            addEquationBox(id);
        } else if (e.key == 'ArrowUp') {
            if (activeIndex > 0) {
                const previousId = equationBoxes[activeIndex - 1];
                const previousBoxRef = refs.current.get(previousId);
                if (previousBoxRef && previousBoxRef.current) {
                    previousBoxRef.current.focus();
                }
            }
        } else if (e.key == 'ArrowDown') {
            if (activeIndex < equationBoxes.length - 1) {
                const nextId = equationBoxes[activeIndex + 1];
                const nextBoxRef = refs.current.get(nextId);
                if (nextBoxRef && nextBoxRef.current) {
                    nextBoxRef.current.focus();
                }
            }
        } else if (e.key == 'Backspace') {
            if (equationBoxes.length != 1 && activeRef?.current.input() == "") {
                e.preventDefault();
                removeEquationBox(id);
                if (equationBoxes.length > 1) {
                    if (activeIndex < equationBoxes.length - 1) {
                        const nextId = equationBoxes[activeIndex + 1];
                        const nextBoxRef = refs.current.get(nextId);
                        if (nextBoxRef && nextBoxRef.current) {
                            nextBoxRef.current.focus();
                        }
                    } else if (activeIndex > 0) {
                        const previousId = equationBoxes[activeIndex - 1];
                        const previousBoxRef = refs.current.get(previousId);
                        if (previousBoxRef && previousBoxRef.current) {
                            previousBoxRef.current.focus();
                        }
                    }
                }
            }
        }
    }

    useEffect(() => {
        equationBoxes.forEach((id) => {
            if (!refs.current.has(id)) {
                refs.current.set(id, React.createRef());
            }
        });
    }, [equationBoxes]);

    useEffect(() => {
        refs.current.get(activeBox)?.current.focus();
    }, [activeBox])

    const evaluateAll = () => {
        setVariableMap(new Map());

        setTimeout(() => {
            equationBoxes.forEach((id) => {
                const equationBoxRef = refs.current.get(id);
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
        <div className="w-full h-full sm:w-[600px] sm:h-[600px] rounded-none sm:rounded-md border-2 border-slate-600 overflow-auto scrollbar-hide bg-white">
            <VariableContext.Provider value={{ variableMap, setVariableMap }}>
                {equationBoxes.map((id) => {
                    if (!refs.current.has(id)) {
                        refs.current.set(id, React.createRef());
                    }
                    return (
                        <EquationBox
                            key={id}
                            id={id}
                            ref={refs.current.get(id)}
                            evaluate={evaluateAll}
                            activeid={activeBox}
                            setactive={setActiveBox}
                            processinput={processInput}
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
