import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { headers } from "next/headers";
import AppKitProvider from "./context";
import Navbar from "./_components/Navbar";
import { ToastContainer } from "react-toastify";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "100 200 300 400 500 600 700 800 900",
});

export const metadata: Metadata = {
  title: "huskeyfi",
  description: "huekeyfi",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const cookies = headers().get("cookie");

  return (
    <html lang="en" className={`${pretendard.variable}`}>
      <body
        className={`${pretendard.className} flex h-full w-full justify-center bg-huskey-background text-white`}
      >
        <AppKitProvider cookies={cookies}>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            pauseOnFocusLoss={false}
            theme="dark"
          />
          <div id="modal" />
          {children}
        </AppKitProvider>
      </body>
    </html>
  );
};

export default RootLayout;
