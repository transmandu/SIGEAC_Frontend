"use client";

import { FC, useEffect, useState } from "react";

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
  const [mounted, setMounted] = useState(false);

  // Evitar hidratación incorrecta del tema
  useEffect(() => {
    setMounted(true);
  }, []);

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
      return "bg-red-600 dark:bg-red-700";
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
      return "bg-yellow-500 dark:bg-yellow-600";
    } else {
      return "bg-green-600 dark:bg-green-700";
    }
  };

  const getHoverColor = (severity: string, probability: number): string => {
    const riskCode = `${probability}${severity}`;

    if (["5A", "5B", "5C", "4A", "4B", "3A"].includes(riskCode)) {
      return "hover:bg-red-800 dark:hover:bg-red-900";
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
      return "hover:bg-yellow-700 dark:hover:bg-yellow-800";
    } else {
      return "hover:bg-green-800 dark:hover:bg-green-900";
    }
  };

  const getActiveColor = (severity: string, probability: number): string => {
    const riskCode = `${probability}${severity}`;

    if (["5A", "5B", "5C", "4A", "4B", "3A"].includes(riskCode)) {
      return "active:bg-red-900 dark:active:bg-red-950";
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
      return "active:bg-yellow-800 dark:active:bg-yellow-900";
    } else {
      return "active:bg-green-900 dark:active:bg-green-950";
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

  // Evitar renderizado hasta que el tema esté listo
  if (!mounted) {
    return (
      <div className="flex flex-col items-center p-4 mt-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <div className="h-64 w-full flex items-center justify-center text-gray-500 dark:text-gray-400">
          Cargando matriz...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 mt-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
      <table className="table-auto border-collapse border border-gray-400 dark:border-gray-600 shadow-sm text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border border-gray-400 dark:border-gray-600 p-1"></th>
            <th
              colSpan={5}
              className="border border-gray-400 dark:border-gray-600 p-2 text-center bg-blue-50 dark:bg-blue-900 text-xs dark:text-white"
            >
              Severidad del Riesgo
            </th>
          </tr>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border border-gray-400 dark:border-gray-600 p-1 text-center text-xs dark:text-white">
              Probabilidad
            </th>
            {severities.map((severity) => (
              <th
                key={severity.code}
                className="border border-gray-400 dark:border-gray-600 p-1 text-center font-semibold bg-blue-100 dark:bg-blue-800 text-xs dark:text-white"
              >
                <div className="flex flex-col">
                  <span className="text-xs dark:text-white">
                    {severity.name}
                  </span>
                  <span className="text-blue-800 dark:text-blue-200 text-xs">
                    ({severity.code})
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {probabilities.map((probability) => (
            <tr key={probability.value} className="dark:bg-gray-800">
              <td className="border border-gray-400 dark:border-gray-600 p-1 text-center font-semibold bg-blue-50 dark:bg-blue-900 text-xs dark:text-white">
                <div className="flex flex-col">
                  <p className="font-medium text-xs dark:text-white">
                    {probability.name}
                  </p>
                  <p className="text-blue-800 dark:text-blue-200 font-bold text-xs">
                    ({probability.value})
                  </p>
                </div>
              </td>
              {severities.map((severity) => (
                <td
                  key={`${severity.code}-${probability.value}`}
                  className="border border-gray-400 dark:border-gray-600 p-0.5 text-center"
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleCellClick(severity.code, probability.value)
                    }
                    className={`w-full h-full p-2 text-white dark:text-white font-bold rounded transition-all duration-200 text-xs ${getRiskColor(
                      severity.code,
                      probability.value
                    )} ${getHoverColor(
                      severity.code,
                      probability.value
                    )} ${getActiveColor(
                      severity.code,
                      probability.value
                    )} ${isCellSelected(severity.code, probability.value) ? "ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-1 dark:ring-offset-gray-800" : ""}`}
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
      </table>

      {/* Leyenda */}
      <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg w-full max-w-md text-xs dark:text-white">
        <div className="flex flex-wrap justify-center gap-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 dark:bg-red-700 mr-1"></div>
            <span>Alto</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 dark:bg-yellow-600 mr-1"></div>
            <span>Medio</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-600 dark:bg-green-700 mr-1"></div>
            <span>Bajo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMatrix;
