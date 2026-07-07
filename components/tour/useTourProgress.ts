"use client"

import { useCallback } from "react"
import { StepType } from "@reactour/tour"
import { useTourContext } from "./TourProvider"

export function useTourProgress(tourKey: string){
    const { startTour } = useTourContext();

    const isCompleted = useCallback((): boolean => {
        if(typeof window === "undefined"){
            return true;
        }

        return (
            localStorage.getItem(`tour-${tourKey}-completed`) === "true"
        );
    }, [tourKey]);

    const start = useCallback (
        (steps: StepType[]) => {
            if(!steps.length) return;

            startTour(steps, tourKey);
        },
        [startTour, tourKey],
    )

    return {
        start,
        isCompleted,
    };
}