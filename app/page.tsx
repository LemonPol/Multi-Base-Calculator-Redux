"use client"

import { useState } from "react";
import EquationContainer from "./components/EquationContainer";
import HelpModal from "./components/HelpModal";

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-center items-center">
      <h1 className="text-4xl">RadixCalc</h1>
    </header>
  );
};

const Footer: React.FC<{ onHelpClick: () => void }> = ({ onHelpClick }) => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <p>
        Made with love by{" "}
        <a
          href="https://LemonPollock.com"
          className="text-blue-400 hover:underline"
        >
          Lemon Pollock
        </a>{" "}
        |{" "}
        <button
          onClick={onHelpClick}
          className="text-blue-400 hover:underline"
        >
          Help
        </button>
      </p>
    </footer>
  );
};

export default function Home() {
  const [isHelpVisible, setHelpVisible] = useState(false);

  const openHelp = () => setHelpVisible(true);
  const closeHelp = () => setHelpVisible(false);

  return (
    <div className="h-screen w-screen flex flex-col">
      <Header />
      <main className="flex-grow flex justify-center items-center">
        <EquationContainer />
      </main>
      <Footer onHelpClick={openHelp} />
      {isHelpVisible && <HelpModal onClose={closeHelp} />}
    </div>
  );
}
