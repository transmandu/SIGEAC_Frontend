// components/RiskMatrix.tsx
"use client";

import React, { FC, useEffect, useState } from "react";

interface RiskMatrixProps {
  onCellClick: (probability: string, severity: string) => void;
  selectedProbability?: string;
  selectedSeverity?: string;
}

interface Severity {
  code: string;
  name: string;
}

interface Probability {
  value: number;
  name: string;
}

const RiskMatrix: FC<RiskMatrixProps> = ({
  onCellClick,
  selectedProbability,
  selectedSeverity,
}) => {
  const severities: Severity[] = [
    { code: "A", name: "Catastrófico" },
    { code: "B", name: "Peligroso" },
    { code: "C", name: "Mayor" },
    { code: "D", name: "Menor" },
    { code: "E", name: "Insignificante" },
  ];

  const probabilities: Probability[] = [
    { value: 5, name: "Frecuente" },
    { value: 4, name: "Ocasional" },
    { value: 3, name: "Remoto" },
    { value: 2, name: "Improbable" },
    { value: 1, name: "Extremadamente Improbable" },
  ];

  const [selectedCell, setSelectedCell] = useState<string>("");

  // Actualizar la celda seleccionada cuando cambian los valores
  useEffect(() => {
    if (selectedProbability && selectedSeverity) {
      setSelectedCell(`${selectedProbability}${selectedSeverity}`);
    }
  }, [selectedProbability, selectedSeverity]);

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

  const getHoverColor = (severity: string, probability: number): string => {
    const riskCode = `${probability}${severity}`;

    if (["5A", "5B", "5C", "4A", "4B", "3A"].includes(riskCode)) {
      return "hover:bg-red-800";
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
      return "hover:bg-yellow-700";
    } else {
      return "hover:bg-green-800";
    }
  };

  const getActiveColor = (severity: string, probability: number): string => {
    const riskCode = `${probability}${severity}`;

    if (["5A", "5B", "5C", "4A", "4B", "3A"].includes(riskCode)) {
      return "active:bg-red-900";
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
      return "active:bg-yellow-800";
    } else {
      return "active:bg-green-900";
    }
  };

  const handleCellClick = (severityCode: string, probabilityValue: number) => {
    const riskCode = `${probabilityValue}${severityCode}`;
    setSelectedCell(riskCode);
    onCellClick(probabilityValue.toString(), severityCode);
  };

  const isCellSelected = (severityCode: string, probabilityValue: number) => {
    return selectedCell === `${probabilityValue}${severityCode}`;
  };

  return (
    <div className="flex flex-col items-center p-4 mt-4 border rounded-lg bg-gray-50">
      <table className="table-auto border-collapse border border-gray-400 shadow-sm text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 p-1"></th>
            <th
              colSpan={5}
              className="border border-gray-400 p-2 text-center bg-blue-50 text-xs"
            >
              Severidad del Riesgo
            </th>
          </tr>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 p-1 text-center text-xs">
              Probabilidad
            </th>
            {severities.map((severity) => (
              <th
                key={severity.code}
                className="border border-gray-400 p-1 text-center font-semibold bg-blue-100 text-xs"
              >
                <div className="flex flex-col">
                  <span className="text-xs">{severity.name}</span>
                  <span className="text-blue-800 text-xs">
                    ({severity.code})
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {probabilities.map((probability) => (
            <tr key={probability.value}>
              <td className="border border-gray-400 p-1 text-center font-semibold bg-blue-50 text-xs">
                <div className="flex flex-col">
                  <p className="font-medium text-xs">{probability.name}</p>
                  <p className="text-blue-800 font-bold text-xs">
                    ({probability.value})
                  </p>
                </div>
              </td>
              {severities.map((severity) => (
                <td
                  key={`${severity.code}-${probability.value}`}
                  className="border border-gray-400 p-0.5 text-center"
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleCellClick(severity.code, probability.value)
                    }
                    className={`w-full h-full p-2 text-white font-bold rounded transition-all duration-200 text-xs ${getRiskColor(
                      severity.code,
                      probability.value
                    )} ${getHoverColor(
                      severity.code,
                      probability.value
                    )} ${getActiveColor(
                      severity.code,
                      probability.value
                    )} ${isCellSelected(severity.code, probability.value) ? "ring-2 ring-blue-400 ring-offset-1" : ""}`}
                    aria-label={`Seleccionar probabilidad ${probability.value} y severidad ${severity.code}`}
                  >
                    {probability.value}
                    {severity.code}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>w

      {/* Leyenda */}
      <div className="mt-4 p-2 bg-gray-100 rounded-lg w-full max-w-md text-xs">
        <div className="flex flex-wrap justify-center gap-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 mr-1"></div>
            <span>Alto</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 mr-1"></div>
            <span>Medio</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-600 mr-1"></div>
            <span>Bajo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMatrix;
