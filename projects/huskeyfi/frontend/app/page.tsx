import InputBox from "./_components/InputBox";
import Navbar from "./_components/Navbar";
import SwitchComponent from "./_components/SwitchComponent";
import { SwitchProvider } from "./context/SwitchContext";

const Home = () => {
  return (
    <main className="flex w-full flex-col items-center justify-center gap-10">
      <Navbar />
      <SwitchProvider>
        <div className="flex w-full max-w-[560px] flex-col justify-center gap-10">
          <SwitchComponent />
          <InputBox />
        </div>
      </SwitchProvider>
    </main>
  );
};

export default Home;
