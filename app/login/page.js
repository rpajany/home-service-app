import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-72px)] bg-[#faf9fc] px-4 py-10">
          <div className="mx-auto w-full max-w-[540px] rounded-xl bg-white p-7 shadow-xl sm:p-10">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7045e8] text-white shadow-sm">
                <span className="text-2xl">↪</span>
              </div>
            </div>

            <h1 className="mt-6 text-center text-3xl font-black">
              Login
            </h1>

            <p className="mx-auto mt-3 max-w-md text-center text-sm text-[#66616f]">
              Loading login...
            </p>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}