import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import React from "react";
import { Outlet } from "react-router";

const RootLayout = () => {
  return (
    <main className="overflow-hidden w-screen min-h-screen bg-[#F6F6F6] px-8">
      <Navbar />
      <div className="mt-16">
        <Outlet />
      </div>
      <Footer />
    </main>
  );
};

export default RootLayout;
