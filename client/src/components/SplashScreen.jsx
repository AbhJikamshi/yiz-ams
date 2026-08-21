import { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1800);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-white transition-all duration-500 dark:bg-slate-950 ${
        fadeOut ? "scale-105 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      <div className="flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 animate-[splashLogo_1.5s_ease-out]">
          <img
            src="/yiz-logo.png"
            alt="YIZ-AMS Logo"
            className="h-40 w-40 object-contain drop-shadow-xl sm:h-48 sm:w-48"
          />
        </div>

        <div className="animate-[splashText_1.2s_ease-out]">
          <h1 className="text-3xl font-bold tracking-wide text-slate-900 dark:text-white sm:text-4xl">
            YIZ-AMS
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-300 sm:text-base">
            Ya Isa Zama Association
          </p>
        </div>

        <div className="mt-8 flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600 [animation-delay:200ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600 [animation-delay:400ms]" />
        </div>
      </div>

      <style>{`
        @keyframes splashLogo {
          0% {
            opacity: 0;
            transform: scale(0.75);
          }
          60% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes splashText {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}