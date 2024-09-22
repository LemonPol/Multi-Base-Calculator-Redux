import React, { useState } from 'react';

interface SelectorProps {
    containerNum: number;
    setBase: (base: number) => void;
    evaluate: () => void;
}

const Selector: React.FC<SelectorProps> = ({ containerNum, setBase, evaluate }) => {
    const labels = ["Dec", "Hex", "Bin"];
    const [activeIndex, setActiveIndex] = useState(0);

    const handleButtonClick = (index: number) => {
        setActiveIndex(index);
        setBase(index);
        evaluate();
    };

    return (
        <div className="h-10 button-container flex border-2 border-slate-500 rounded-lg overflow-hidden items-center justify-center">
            {labels.map((label, index) => (
                <button
                    key={index}
                    id={`btn_${containerNum}_${index}`}
                    name={`btn_${containerNum}`}
                    className={`toggle-btn flex-1 p-2 transition-colors duration-300 ${activeIndex === index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-blue-100'}`}
                    onClick={() => handleButtonClick(index)}
                    value={index}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

export default Selector;
