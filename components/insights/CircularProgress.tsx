"use client";

interface Props {
  value: number;
  color?: string;
}

export default function CircularProgress({
  value,
  color = "#22c55e",
}: Props) {

  const radius = 44;
  const stroke = 8;

  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference -
    (value / 100) * circumference;

  return (
    <div className="relative w-28 h-28">

      <svg
        width="112"
        height="112"
        className="-rotate-90"
      >

        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={stroke}
        />

        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />

      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">

        <span className="text-3xl font-bold">
          {value}
        </span>

        <span className="text-gray-500 text-xs">
          /100
        </span>

      </div>

    </div>
  );
}