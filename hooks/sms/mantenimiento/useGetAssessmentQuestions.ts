"use client";

import { useQuery } from "@tanstack/react-query";

import axiosInstance from "@/lib/axios";
import { RiskAssessmentQuestion } from "@/types/sms/mantenimiento";

const fetchAssessmentQuestions = async (
    company?: string
): Promise<RiskAssessmentQuestion[]> => {
    const { data } = await axiosInstance.get(
        `/${company}/sms/aeronautical/assessment-questions`
    );

    return Array.isArray(data) ? data : [];
};

export const useGetAssessmentQuestions = (company?: string) =>
    useQuery<RiskAssessmentQuestion[]>({
        queryKey: ["assessment-questions", company],
        queryFn: () => fetchAssessmentQuestions(company),
        staleTime: 1000 * 60 * 10,
        enabled: !!company,
    });
