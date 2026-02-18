"use client";

import { useState } from "react";
import { Survey, Question } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
    useUpdateQuestion,
    useDeleteQuestion,
    useCreateQuestion,
    useUpdateSurveyInfo,
} from "@/actions/sms/survey/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Props {
    surveyData: Survey;
    onClose: () => void;
}

interface EditingState {
    questionId: string | null;
    isEditingSurveyInfo: boolean;
}

// ─── ToggleGroup ────────────────────────────────────────────────────────────
// Defined outside the parent to avoid re-creation on every render
function ToggleGroup<T extends string>({
    options,
    value,
    onChange,
}: {
    options: { label: string; value: T }[];
    value: T;
    onChange: (v: T) => void;
}) {
    return (
        <div className="flex gap-1 flex-wrap">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={cn(
                        "px-3 py-1.5 text-sm rounded-md border transition-colors",
                        value === opt.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:bg-muted"
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

// ─── QuestionEditor ──────────────────────────────────────────────────────────
// Defined OUTSIDE SurveyQuestionsManager so React never unmounts it on re-render
interface QuestionEditorProps {
    surveyType: "QUIZ" | "SURVEY";
    questionText: string;
    setQuestionText: (v: string) => void;
    questionType: "SINGLE" | "MULTIPLE" | "OPEN";
    setQuestionType: (v: "SINGLE" | "MULTIPLE" | "OPEN") => void;
    questionRequired: boolean;
    setQuestionRequired: (v: boolean) => void;
    questionOptions: Array<{ text: string; is_correct: boolean }>;
    setQuestionOptions: (v: Array<{ text: string; is_correct: boolean }>) => void;
    onSave: () => void;
    onCancel: () => void;
    saveLabel: string;
    isNew?: boolean;
}

function QuestionEditor({
    surveyType,
    questionText,
    setQuestionText,
    questionType,
    setQuestionType,
    questionRequired,
    setQuestionRequired,
    questionOptions,
    setQuestionOptions,
    onSave,
    onCancel,
    saveLabel,
    isNew = false,
}: QuestionEditorProps) {
    const addOption = () =>
        setQuestionOptions([...questionOptions, { text: "", is_correct: false }]);

    const removeOption = (index: number) => {
        if (questionOptions.length <= 1) return;
        setQuestionOptions(questionOptions.filter((_, i) => i !== index));
    };

    const updateOptionText = (index: number, text: string) => {
        const next = [...questionOptions];
        next[index] = { ...next[index], text };
        setQuestionOptions(next);
    };

    const updateOptionCorrect = (index: number, isCorrect: boolean) => {
        const next = [...questionOptions];
        next[index] = { ...next[index], is_correct: isCorrect };
        setQuestionOptions(next);
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>Pregunta</Label>
                <Input
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Texto de la pregunta"
                />
            </div>

            <div className="space-y-2">
                <Label>Tipo de pregunta</Label>
                <ToggleGroup
                    options={[
                        { label: "Selección única", value: "SINGLE" as const },
                        { label: "Selección múltiple", value: "MULTIPLE" as const },
                        { label: "Abierta", value: "OPEN" as const },
                    ]}
                    value={questionType}
                    onChange={(v) => {
                        setQuestionType(v);
                        if (v === "OPEN") setQuestionOptions([{ text: "", is_correct: false }]);
                    }}
                />
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    id={isNew ? "new-required" : "edit-required"}
                    checked={questionRequired}
                    onCheckedChange={(checked) => setQuestionRequired(checked as boolean)}
                />
                <Label htmlFor={isNew ? "new-required" : "edit-required"}>Requerida</Label>
            </div>

            {questionType !== "OPEN" && (
                <div className="space-y-2">
                    <Label>
                        Opciones{" "}
                        {surveyType === "QUIZ" && (
                            <span className="text-xs text-muted-foreground">(marca ✓ la correcta)</span>
                        )}
                    </Label>
                    {questionOptions.map((option, optIndex) => (
                        <div key={optIndex} className="flex gap-2 items-center">
                            <Input
                                value={option.text}
                                onChange={(e) => updateOptionText(optIndex, e.target.value)}
                                placeholder={`Opción ${optIndex + 1}`}
                            />
                            {surveyType === "QUIZ" && (
                                <div className="flex items-center gap-1 shrink-0" title="Respuesta correcta">
                                    <Checkbox
                                        checked={option.is_correct}
                                        onCheckedChange={(checked) =>
                                            updateOptionCorrect(optIndex, checked as boolean)
                                        }
                                    />
                                    <span className="text-xs">✓</span>
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                onClick={() => removeOption(optIndex)}
                                disabled={questionOptions.length <= 1}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" type="button" onClick={addOption}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar opción
                    </Button>
                </div>
            )}

            <div className="flex gap-2">
                <Button type="button" onClick={onSave} size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    {saveLabel}
                </Button>
                <Button variant="outline" size="sm" type="button" onClick={onCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                </Button>
            </div>
        </div>
    );
}

// ─── SurveyQuestionsManager ──────────────────────────────────────────────────
export function SurveyQuestionsManager({ surveyData, onClose }: Props) {
    const isReadOnly = (surveyData.answers_count ?? 0) > 0;

    const { selectedCompany, selectedStation } = useCompanyStore();
    const { updateQuestion } = useUpdateQuestion();
    const { deleteQuestion } = useDeleteQuestion();
    const { createQuestion } = useCreateQuestion();
    const { updateSurveyInfo } = useUpdateSurveyInfo();

    const [editing, setEditing] = useState<EditingState>({
        questionId: null,
        isEditingSurveyInfo: false,
    });

    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

    // Survey info form state
    const [surveyTitle, setSurveyTitle] = useState(surveyData.title);
    const [surveyDescription, setSurveyDescription] = useState(surveyData.description);
    const [surveyType, setSurveyType] = useState<"QUIZ" | "SURVEY">(surveyData.type);

    // Question form state — lifted here, passed down to QuestionEditor
    const [questionText, setQuestionText] = useState("");
    const [questionType, setQuestionType] = useState<"SINGLE" | "MULTIPLE" | "OPEN">("SINGLE");
    const [questionRequired, setQuestionRequired] = useState(true);
    const [questionOptions, setQuestionOptions] = useState<Array<{ text: string; is_correct: boolean }>>(
        [{ text: "", is_correct: false }]
    );

    const toggleQuestion = (questionId: string) => {
        const next = new Set(expandedQuestions);
        if (next.has(questionId)) next.delete(questionId);
        else next.add(questionId);
        setExpandedQuestions(next);
    };

    const resetQuestionForm = () => {
        setQuestionText("");
        setQuestionType("SINGLE");
        setQuestionRequired(true);
        setQuestionOptions([{ text: "", is_correct: false }]);
    };

    const startEditQuestion = (question: Question) => {
        setEditing({ questionId: question.id, isEditingSurveyInfo: false });
        setQuestionText(question.text);
        setQuestionType(question.type as "SINGLE" | "MULTIPLE" | "OPEN");
        setQuestionRequired(question.is_required);
        setQuestionOptions(
            question.options && question.options.length > 0
                ? question.options.map((opt) => ({ text: opt.text, is_correct: opt.is_correct ?? false }))
                : [{ text: "", is_correct: false }]
        );
        setExpandedQuestions(new Set([question.id]));
    };

    const cancelEdit = () => {
        setEditing({ questionId: null, isEditingSurveyInfo: false });
        resetQuestionForm();
    };

    const handleUpdateQuestion = async (questionId: string) => {
        if (!selectedCompany || !selectedStation || isReadOnly) return;
        const filteredOptions =
            questionType !== "OPEN" ? questionOptions.filter((o) => o.text.trim() !== "") : [];
        try {
            await updateQuestion.mutateAsync({
                company: selectedCompany.slug,
                location_id: selectedStation,
                survey_number: surveyData.survey_number,
                question_id: Number(questionId),
                data: {
                    text: questionText,
                    type: questionType,
                    is_required: questionRequired,
                    options: filteredOptions.length > 0 ? filteredOptions : undefined,
                },
            });
            cancelEdit();
        } catch {
            // Error already handled by onError in the hook (toast shown)
        }
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!selectedCompany || !selectedStation || isReadOnly) return;
        if (confirm("¿Está seguro que desea eliminar esta pregunta?")) {
            try {
                await deleteQuestion.mutateAsync({
                    company: selectedCompany.slug,
                    location_id: selectedStation,
                    survey_number: surveyData.survey_number,
                    question_id: Number(questionId),
                });
            } catch {
                // Error already handled by onError in the hook
            }
        }
    };

    const handleCreateQuestion = async () => {
        if (!selectedCompany || !selectedStation || isReadOnly) return;
        const filteredOptions =
            questionType !== "OPEN" ? questionOptions.filter((o) => o.text.trim() !== "") : [];
        try {
            await createQuestion.mutateAsync({
                company: selectedCompany.slug,
                location_id: selectedStation,
                survey_number: surveyData.survey_number,
                data: {
                    text: questionText,
                    type: questionType,
                    is_required: questionRequired,
                    options: filteredOptions.length > 0 ? filteredOptions : undefined,
                },
            });
            cancelEdit();
        } catch {
            // Error already handled by onError in the hook
        }
    };

    const handleUpdateSurveyInfo = async () => {
        if (!selectedCompany || !selectedStation || isReadOnly) return;
        try {
            await updateSurveyInfo.mutateAsync({
                company: selectedCompany.slug,
                location_id: selectedStation,
                survey_number: surveyData.survey_number,
                data: { title: surveyTitle, description: surveyDescription, type: surveyType },
            });
            setEditing({ ...editing, isEditingSurveyInfo: false });
        } catch {
            // Error already handled by onError in the hook
        }
    };

    // Shared props for QuestionEditor
    const editorProps: Omit<QuestionEditorProps, "onSave" | "onCancel" | "saveLabel" | "isNew"> = {
        surveyType,
        questionText,
        setQuestionText,
        questionType,
        setQuestionType,
        questionRequired,
        setQuestionRequired,
        questionOptions,
        setQuestionOptions,
    };

    return (
        <div className="space-y-6 p-4">
            {/* Read-only warning banner */}
            {isReadOnly && (
                <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                    <div>
                        <p className="font-semibold">Encuesta con respuestas registradas</p>
                        <p className="text-xs mt-0.5 opacity-80">
                            Esta encuesta ya ha sido respondida ({surveyData.answers_count} respuesta{surveyData.answers_count !== 1 ? "s" : ""}). No se puede modificar.
                        </p>
                    </div>
                </div>
            )}

            {/* Survey Info Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Información General</CardTitle>
                    {!editing.isEditingSurveyInfo && !isReadOnly && (
                        <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => setEditing({ questionId: null, isEditingSurveyInfo: true })}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {editing.isEditingSurveyInfo ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Tipo de encuesta</Label>
                                <ToggleGroup
                                    options={[
                                        { label: "ENCUESTA", value: "SURVEY" as const },
                                        { label: "TRIVIA", value: "QUIZ" as const },
                                    ]}
                                    value={surveyType}
                                    onChange={setSurveyType}
                                />
                            </div>
                            <div>
                                <Label>Título</Label>
                                <Input
                                    value={surveyTitle}
                                    onChange={(e) => setSurveyTitle(e.target.value)}
                                    placeholder="Título de la encuesta"
                                />
                            </div>
                            <div>
                                <Label>Descripción</Label>
                                <Textarea
                                    value={surveyDescription}
                                    onChange={(e) => setSurveyDescription(e.target.value)}
                                    placeholder="Descripción de la encuesta"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" onClick={handleUpdateSurveyInfo} size="sm">
                                    <Check className="h-4 w-4 mr-2" />
                                    Guardar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() => {
                                        setSurveyTitle(surveyData.title);
                                        setSurveyDescription(surveyData.description);
                                        setSurveyType(surveyData.type);
                                        setEditing({ ...editing, isEditingSurveyInfo: false });
                                    }}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <p className="font-medium">{surveyData.title}</p>
                            <p className="text-sm text-muted-foreground">{surveyData.description}</p>
                            <p className="text-xs text-muted-foreground">
                                Tipo:{" "}
                                <span className="font-medium">
                                    {surveyData.type === "QUIZ" ? "Trivia" : "Encuesta"}
                                </span>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Questions Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Preguntas ({surveyData.questions?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {surveyData.questions && surveyData.questions.length > 0 ? (
                        surveyData.questions.map((question, index) => (
                            <Card key={question.id} className="border">
                                <CardContent className="pt-4">
                                    {editing.questionId === question.id ? (
                                        <QuestionEditor
                                            {...editorProps}
                                            onSave={() => handleUpdateQuestion(question.id)}
                                            onCancel={cancelEdit}
                                            saveLabel="Guardar cambios"
                                        />
                                    ) : (
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <div
                                                    className="flex-1 cursor-pointer"
                                                    onClick={() => toggleQuestion(question.id)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">
                                                            {index + 1}. {question.text}
                                                        </span>
                                                        {expandedQuestions.has(question.id) ? (
                                                            <ChevronUp className="h-4 w-4 shrink-0" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4 shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {question.type === "SINGLE"
                                                            ? "Selección única"
                                                            : question.type === "MULTIPLE"
                                                                ? "Selección múltiple"
                                                                : "Abierta"}
                                                        {question.is_required && " • Requerida"}
                                                    </p>
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    {!isReadOnly && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                type="button"
                                                                onClick={() => startEditQuestion(question)}
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                type="button"
                                                                onClick={() => handleDeleteQuestion(question.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {expandedQuestions.has(question.id) &&
                                                question.options &&
                                                question.options.length > 0 && (
                                                    <div className="mt-3 ml-4 space-y-1">
                                                        {question.options.map((option, optIndex) => (
                                                            <div
                                                                key={optIndex}
                                                                className="text-sm flex items-center gap-2"
                                                            >
                                                                <span className="text-muted-foreground">•</span>
                                                                <span>{option.text}</span>
                                                                {surveyData.type === "QUIZ" && option.is_correct && (
                                                                    <span className="text-green-600 font-medium text-xs">
                                                                        ✓ Correcta
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No hay preguntas aún.
                        </p>
                    )}

                    {/* Add New Question Button */}
                    {!isReadOnly && editing.questionId === null && !editing.isEditingSurveyInfo && (
                        <Card className="border-dashed">
                            <CardContent className="pt-4">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        resetQuestionForm();
                                        setEditing({ questionId: "-1", isEditingSurveyInfo: false });
                                    }}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar pregunta
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* New Question Form */}
                    {editing.questionId === "-1" && (
                        <Card className="border-2 border-primary">
                            <CardContent className="pt-4">
                                <h4 className="font-medium mb-4">Nueva Pregunta</h4>
                                <QuestionEditor
                                    {...editorProps}
                                    onSave={handleCreateQuestion}
                                    onCancel={cancelEdit}
                                    saveLabel="Crear pregunta"
                                    isNew={true}
                                />
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button variant="outline" type="button" onClick={onClose}>
                    Cerrar
                </Button>
            </div>
        </div>
    );
}
