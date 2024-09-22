import EquationContainer from "./components/EquationContainer";

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-center items-center">
      <h1 className="text-4xl">RadixCalc</h1>
    </header>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <p>
        Made with love by <a href="https://LemonPollock.com" className="text-blue-400 hover:underline">Lemon Pollock</a> | <a href="/help" className="text-blue-400 hover:underline">Help</a>
      </p>
    </footer>
  );
};

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <Header/>
      <main className="flex-grow flex justify-center items-center">
        <EquationContainer />
      </main>
      <Footer/>
    </div>
  );
}
