import InputBox from "./_components/InputBox";
import Navbar from "./_components/Navbar";
import SwitchComponent from "./_components/SwitchComponent";
import { SwitchProvider } from "./context/SwitchContext";

// Home component - Main page of the application
const Home = () => {
  return (
    <main className="flex w-full flex-col items-center justify-center gap-10">
      <Navbar />
      <SwitchProvider>
        <div className="flex w-full max-w-[560px] flex-col justify-center">
          <SwitchComponent />
          <InputBox />
          <div className="ml-auto mr-1 mt-3 text-sm font-medium text-huskey-primary-200">
            * 1 SAT = 0.00000001 hBTC
          </div>
        </div>
      </SwitchProvider>
    </main>
  );
};

export default Home;
