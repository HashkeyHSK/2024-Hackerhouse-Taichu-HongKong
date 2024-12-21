import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { headers } from "next/headers";
import AppKitProvider from "./context";
import Navbar from "./_components/Navbar";
import { ToastContainer } from "react-toastify";
import JotaiProvider from "./_providers/JotaiProvider";

// Configure Pretendard font with variable weights
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "100 200 300 400 500 600 700 800 900",
});

// Define metadata for the application
export const metadata: Metadata = {
  title: "Lightning Huskey",
  description: "Lightning Huskey",
};

// Root layout component that wraps the entire application
const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  // Get cookies from request headers
  const cookies = headers().get("cookie");

  return (
    <html lang="en" className={`${pretendard.variable}`}>
      <body
        className={`${pretendard.className} flex h-full w-full justify-center bg-huskey-background text-white`}
      >
        {/* Wrap application with necessary providers */}
        <AppKitProvider cookies={cookies}>
          <JotaiProvider>
            {/* Configure toast notifications */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              pauseOnFocusLoss={false}
              theme="dark"
            />
            {/* Modal container */}
            <div id="modal" />
            {/* Render page content */}
            {children}
          </JotaiProvider>
        </AppKitProvider>
      </body>
    </html>
  );
};

export default RootLayout;
