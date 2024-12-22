// Import necessary components and utilities
import Link from "next/link";
import Image from "next/image";
import ConnectButton from "./ConnectButton";

// Navigation bar component that displays logo and connect wallet button
const Navbar = () => {
  return (
    // Main navigation container with full width and padding
    <nav className="flex w-full items-center p-8">
      {/* Logo link that pushes connect button to right */}
      <Link className="mr-auto" href="/">
        <Image
          src="/images/huskeyfi-logo.png"
          width={150}
          height={30}
          alt="HuskeyFi"
        />
      </Link>
      {/* Wallet connection button component */}
      <ConnectButton />
    </nav>
  );
};

export default Navbar;
