// components/quiz-results-dialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, PartyPopper, Lightbulb } from "lucide-react";
import Confetti from "react-confetti";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

export type QuizDetail = {
  question_id: number;
  question_text: string;
  user_answer: string;
  is_correct: boolean;
  type: string;
  correct_answer?: string;
  feedback?: string;
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
                <div className="text-3xl font-extrabold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  ¡Perfecto! 100%
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
                  ? "p-8 border-4 border-amber-400 shadow-inner shadow-amber-200 shadow-xl rounded-lg"
                  : ""
              }
            `}
            >
              {!isPerfectScore && (
                <div className="text-3xl font-bold mb-2 text-blue-700">
                  Puntuación: {results.score}%
                </div>
              )}
              <div className="flex justify-center gap-6 mt-3 text-sm">
                <span className="text-green-600 font-bold">
                  ✓ {results.correct_answers} correctas
                </span>
                <span className="text-red-600 font-bold">
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
                  className={`p-4 border rounded-lg`}
                >
                  <div className="flex items-start gap-3">
                    {detail.is_correct ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 space-y-2">
                      <p className="font-medium ">
                        {index + 1}. {detail.question_text}
                      </p>

                      {/* Respuesta del usuario */}
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium min-w-24">
                          Tu respuesta:
                        </span>
                        <span
                          className={`text-sm ${
                            detail.is_correct
                              ? "text-green-700 dark:text-green-300"
                              : "text-red-600 dark:text-red-500"
                          } font-bold`}
                        >
                          {detail.user_answer}
                        </span>
                      </div>

                      {/* Respuesta correcta (solo se muestra cuando es incorrecta) */}
                      {!detail.is_correct && detail.correct_answer && (
                        <div className="flex items-start gap-2 bg-green-50/25 dark:bg-green-500/25 p-2 rounded border border-green-200">
                          <Lightbulb className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-green-800 dark:text-white">
                              Respuesta correcta:{" "}
                            </span>
                            <span className="text-sm text-green-700 dark:text-green-300 font-bold">
                              {detail.correct_answer}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón de cierre */}
            <div className="flex justify-center pt-4">
              <Button
                variant="default"
                onClick={() => onOpenChange(false)}
                className={`
                  px-6 py-2 rounded-lg transition-colors border font-medium
                  ${
                    isPerfectScore
                      ? "hover:border-yellow-500"
                      : "text-white hover:bg-blue-700 border-transparent"
                  }
                `}
              >
                {isPerfectScore ? "Cerrar" : "Cerrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
