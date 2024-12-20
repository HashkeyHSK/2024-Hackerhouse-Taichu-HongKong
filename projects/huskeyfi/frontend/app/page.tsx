import ArrowRightIcon from "@/public/svgs/ArrowRightIcon";
import InputBox from "./_components/InputBox";
import Navbar from "./_components/Navbar";

const Home = () => {
  return (
    <main className="flex w-full flex-col items-center justify-center gap-10">
      <Navbar />
      <div className="flex w-full max-w-[560px] flex-col justify-center gap-10">
        <div className="flex w-full items-center gap-2 text-2xl">
          <span className="text-huskey-gray-400">LN</span>
          <ArrowRightIcon />
          <span className="text-huskey-primary-400">HashKey</span>
        </div>
        <InputBox />
      </div>
    </main>
  );
};

export default Home;
