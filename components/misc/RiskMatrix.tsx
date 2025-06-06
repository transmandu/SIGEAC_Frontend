// components/RiskMatrix.tsx
import React, { FC } from "react";

interface Risk {
  severity: string;
  probability: string;
  color: string;
}

const RiskMatrix: FC = () => {
  const severities = [
    { code: "A", name: "Catastrófico" },
    { code: "B", name: "Peligroso" },
    { code: "C", name: "Mayor" },
    { code: "D", name: "Menor" },
    { code: "E", name: "Insignificante" },
  ];
  const probabilities = [
    { value: 5, name: "Frecuente" },
    { value: 4, name: "Ocasional" },
    { value: 3, name: "Remoto" },
    { value: 2, name: "Improbable" },
    { value: 1, name: "Extremadamente Improbable" },
  ];

  const getRiskColor = (severity: string, probability: number): string => {
    const riskCode = `${probability}${severity}`;

    if (["5A", "5B", "5C", "4A", "4B", "3A"].includes(riskCode)) {
      return "bg-red-600";
    } else if (
      [
        "5D",
        "5E",
        "4C",
        "4D",
        "4E",
        "3B",
        "3C",
        "3D",
        "2A",
        "2B",
        "2C",
      ].includes(riskCode)
    ) {
      return "bg-yellow-500";
    } else {
      return "bg-green-600";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <table className="table-auto border-collapse border border-gray-400">
        <thead>
          <tr>
            <th></th>
            <th colSpan={5} className="border border-gray-400 p-2 text-center">
              Severidad del Riesgo
            </th>
          </tr>
          <tr>
            <th className="flex justify-center items-center">Probabilidad</th>
            {severities.map((severity) => (
              <th
                key={severity.code}
                className="border border-gray-400 p-2 text-center font-semibold"
              >
                {severity.name} {severity.code}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {probabilities.map((probability) => (
            <tr key={probability.value}>
              <td className="flex-col border border-gray-400 p-2 text-center font-semibold">
                <p>{probability.name}</p>
                <p>{probability.value}</p>
              </td>
              {severities.map((severity) => (
                <td
                  key={`${severity.code}-${probability.value}`}
                  className={`border border-gray-400 p-4 ${getRiskColor(
                    severity.code,
                    probability.value
                  )} text-center`}
                >
                  {probability.value}
                  {severity.code}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RiskMatrix;
