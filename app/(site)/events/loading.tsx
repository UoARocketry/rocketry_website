import React from "react";
import { PuffLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-opacity-60 min-h-[60vh]">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 mb-4 flex items-center justify-center">
          <PuffLoader
            color="#F97316"
            loading={true}
            size={60}
            cssOverride={{ display: "block" }}
          />
        </div>
        <span className="text-orange-400 text-lg mt-2 font-semibold tracking-wide drop-shadow">
          Loading...
        </span>
      </div>
    </div>
  );
}
