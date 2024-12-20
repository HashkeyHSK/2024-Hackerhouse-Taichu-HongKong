import Link from "next/link";
import Image from "next/image";
import ConnectButton from "./ConnectButton";

const Navbar = () => {
  return (
    <nav className="flex w-full items-center p-8">
      <Link className="mr-auto" href="/">
        <Image
          src="/images/huskeyfi-logo.png"
          width={150}
          height={30}
          alt="HuskeyFi"
        />
      </Link>
      <ConnectButton />
    </nav>
  );
};

export default Navbar;
