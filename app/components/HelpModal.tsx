const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl relative m-8 max-h-screen overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
          aria-label="Close help modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-semibold mb-4">Help & Guide</h2>
        
        <h3 className="text-lg font-semibold mt-4">Input Formatting</h3>
        <p className="text-gray-700">
          RadixCalc supports three numeral systems:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li><strong>Decimal (Base 10)</strong>: Default number system (e.g. 42)</li>
          <li><strong>Hexadecimal (Base 16)</strong>: Use the prefix <code>0x</code> (e.g. <code>0x2A</code>)</li>
          <li><strong>Binary (Base 2)</strong>: Use the prefix <code>0b</code> (e.g. <code>0b101010</code>)</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4">Equation Fields</h3>
        <p className="text-gray-700">
          Each equation consists of three main components:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li><strong>Input</strong>: Enter your numbers or variables here.</li>
          <li><strong>Output</strong>: Displays the result in your selected numeral system.</li>
          <li><strong>Base Selector</strong>: Choose the base (decimal, hexadecimal, or binary) for the output.</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4">Supported Operations</h3>
        <p className="text-gray-700">
          RadixCalc currently supports the following operations:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li><strong>=</strong>: Assigns a value to a variable (e.g. <code>x = 42</code>).</li>
          <li><strong>-</strong>, <strong>+</strong>, <strong>/</strong>, <strong>*</strong>, <strong>^</strong>: Standard arithmetic operations.</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4">Navigation</h3>
        <p className="text-gray-700">
          Easily navigate between equation fields using the following methods:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li><strong>Enter</strong>: Creates a new input field below the current one.</li>
          <li><strong>Click</strong> or <strong>Arrow Keys</strong>: Move between fields.</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4">Variables</h3>
        <p className="text-gray-700">
          Variables are a key feature of RadixCalc and can be used to store values for later use:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li><strong>Variable Names</strong>: Can contain any alphabetical characters (e.g. <code>x</code>, <code>totalSum</code>).</li>
          <li><strong>Inheritance</strong>: Variables are evaluated from top to bottom in your list of equations.</li>
          <li><strong>Redefinition</strong>: You can redefine variables without issues (e.g. <code>x = 5</code> then later <code>x = 10</code>).</li>
        </ul>
      </div>
    </div>
  );
};

export default HelpModal;
