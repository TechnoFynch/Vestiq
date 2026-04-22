import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import React from "react";
import { Outlet } from "react-router";

const RootLayout = () => {
  return (
    <main className="overflow-hidden flex-col w-screen min-h-screen bg-[#F6F6F6]">
      <Navbar />
      <main className="mt-16 flex-1">
        <Outlet />
      </main>
      <Footer />
    </main>
  );
};

export default RootLayout;
