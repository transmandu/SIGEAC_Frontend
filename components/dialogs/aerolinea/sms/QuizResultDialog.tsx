// components/quiz-results-dialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, PartyPopper } from "lucide-react";
import Confetti from "react-confetti";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export type QuizDetail = {
  question_id: number;
  question_text: string;
  is_correct: boolean;
  type: string;
};

export type QuizResults = {
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  score: number;
  details: QuizDetail[];
};

interface QuizResultsDialogProps {
  results: QuizResults;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuizResultsDialog({
  results,
  open,
  onOpenChange,
}: QuizResultsDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (open && results.score === 100) {
      setShowConfetti(true);

      // Obtener dimensiones de la ventana
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Detener el confeti después de 5 segundos
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [open, results.score]);

  const isPerfectScore = results.score === 100;

  // Renderizar el confetti usando portal para que esté por encima del dialog
  const confettiElement =
    showConfetti && mounted
      ? createPortal(
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
            style={{ position: "fixed", top: 0, left: 0, zIndex: 9999 }}
          />,
          document.body
        )
      : null;

  return (
    <>
      {/* Confetti renderizado fuera del dialog con alto z-index */}
      {confettiElement}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {isPerfectScore ? (
                <div className="flex items-center justify-center gap-2 text-yellow-600">
                  <PartyPopper className="h-6 w-6" />
                  ¡Perfecto! 100%
                  <PartyPopper className="h-6 w-6" />
                </div>
              ) : (
                "¡Quiz Completado!"
              )}
            </DialogTitle>
            <DialogDescription className="text-center">
              {isPerfectScore
                ? "¡Felicidades! Has respondido todas las preguntas correctamente"
                : "Aquí están tus resultados"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Resumen general con estilo especial para 100% */}
            <div
              className={`
              border rounded-lg p-4 text-center transition-all duration-300
              ${
                isPerfectScore
                  ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-100 shadow-lg"
                  : "bg-blue-50 border-blue-200"
              }
            `}
            >
              <div className="flex justify-center gap-6 mt-3 text-sm">
                <span className="text-green-600">
                  ✓ {results.correct_answers} correctas
                </span>
                <span className="text-red-600">
                  ✗ {results.incorrect_answers} incorrectas
                </span>
              </div>
            </div>

            {/* Detalles por pregunta */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Detalle por pregunta:</h3>
              {results.details.map((detail, index) => (
                <div
                  key={detail.question_id}
                  className={`p-3 border rounded-lg ${
                    detail.is_correct
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {detail.is_correct ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {index + 1}. {detail.question_text}
                      </p>
                      <p
                        className={`text-sm mt-1 ${
                          detail.is_correct ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {detail.is_correct ? "Correcto" : "Incorrecto"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón de cierre */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => onOpenChange(false)}
                className={`
                  px-6 py-2 rounded-lg transition-colors border font-medium
                  ${
                    isPerfectScore
                      ? "border-gray-400 text-gray-700 bg-white hover:border-gray-600 hover:text-gray-900"
                      : "bg-blue-600 text-white hover:bg-blue-700 border-transparent"
                  }
                `}
              >
                {"Cerrar"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
