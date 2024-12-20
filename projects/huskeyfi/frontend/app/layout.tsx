import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { headers } from "next/headers";
import AppKitProvider from "./context";

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
        className={pretendard.className}
      >
        <AppKitProvider cookies={cookies}>
          <div id="modal" />
          {children}
        </AppKitProvider>
      </body>
    </html>
  );
};

export default RootLayout;
