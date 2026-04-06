import { Outlet } from "react-router";
import { CheckCircle } from "lucide-react";

const AuthLayout = () => {
  return (
    <main className="min-h-screen min-w-screen overflow-hidden flex items-center justify-center bg-slate-200">
      <section className="grid grid-cols-2 w-full max-w-4xl shadow-sm">
        <div className="flex flex-col items-start justify-between gap-8 bg-slate-900 p-8 rounded-l-lg">
          <h1 className="font-bold text-4xl text-gray-300">
            Shop<span className="font-bold text-4xl text-indigo-400">Core</span>
          </h1>
          <div>
            <p className="text-gray-100 text-2xl">
              Everything you need, delivered to your door.
            </p>
            <p className="text-gray-100 text-lg mt-2">
              Join thousands of shoppers discovering great products every day.
            </p>
            <ul className="text-gray-100 text-base mt-6">
              <li className="flex items-center gap-2">
                <span>
                  <CheckCircle />
                </span>
                Fast shipping
              </li>
              <li className="flex items-center gap-2">
                <span>
                  <CheckCircle />
                </span>
                Easy returns
              </li>
              <li className="flex items-center gap-2">
                <span>
                  <CheckCircle />
                </span>
                24/7 Customer support
              </li>
            </ul>
          </div>
        </div>
        <div className="flex items-center justify-center rounded-r-lg">
          <Outlet />
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;
