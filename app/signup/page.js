import { Suspense } from "react";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-72px)] bg-[#faf9fc] px-4 py-10">
          <div className="mx-auto w-full max-w-[540px] rounded-xl bg-white p-7 shadow-xl sm:p-10">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7045e8] text-white shadow-sm">
                <span className="text-2xl">+</span>
              </div>
            </div>

            <h1 className="mt-6 text-center text-3xl font-black">
              Signup
            </h1>

            <p className="mt-3 text-center text-sm text-[#66616f]">
              Loading signup...
            </p>
          </div>
        </main>
      }
    >
      <SignupForm />
    </Suspense>
  );
}