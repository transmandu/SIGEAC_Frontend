"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Batch, MaintenanceAircraft } from "@/types";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

interface BatchArticle {
  part_number?: string;
  alt_part_number?: string;
  justification: string;
  manual: string;
  reference_cod: string;
  pma?: string;
  quantity: number;
  image?: File;
  unit?: string;
  certificates?: string[];
}

interface AircraftWithArticles {
  aircraft_id: string;
  articles: ArticleBatch[];
}

interface ArticleBatch {
  batch: string;
  batch_name: string;
  category: string;
  batch_articles: BatchArticle[];
}


export default function AircraftsArticlesForm({ aircrafts, batches }: {
  aircrafts: MaintenanceAircraft[],
  batches: Batch[]
}) {
  const { setValue } = useFormContext();
  const [aircraftsData, setAircraftsData] = useState<AircraftWithArticles[]>([]);

  const handleAircraftSelect = (aircraftId: string) => {
    setAircraftsData((prev) => {
      const exists = prev.some((a) => a.aircraft_id === aircraftId);
      if (exists) {
        const updated = prev.filter((a) => a.aircraft_id !== aircraftId);
        setValue("aircrafts", updated);
        return updated;
      }
      const newData = [...prev, { aircraft_id: aircraftId, articles: [] }];
      setValue("aircrafts", newData);
      return newData;
    });
  };

  const handleBatchSelect = (
    aircraftId: string,
    batchName: string,
    batchId: string,
    category: string
  ) => {
    setAircraftsData((prev) =>
      prev.map((a) =>
        a.aircraft_id === aircraftId
          ? {
              ...a,
              articles: a.articles.some((b) => b.batch === batchId)
                ? a.articles.filter((b) => b.batch !== batchId)
                : [
                    ...a.articles,
                    {
                      batch: batchId,
                      batch_name: batchName,
                      category,
                      batch_articles: [
                        {
                          part_number: "",
                          alt_part_number: "",
                          justification: "",
                          manual: "",
                          reference_cod: "",
                          quantity: 0,
                        },
                      ],
                    },
                  ],
            }
          : a
      )
    );
    setValue("aircrafts", aircraftsData);
  };

  const handleArticleChange = (
    aircraftId: string,
    batchId: string,
    articleIndex: number,
    field: keyof BatchArticle,
    value: any
  ) => {
    setAircraftsData((prev) =>
      prev.map((a) =>
        a.aircraft_id === aircraftId
          ? {
              ...a,
              articles: a.articles.map((b) =>
                b.batch === batchId
                  ? {
                      ...b,
                      batch_articles: b.batch_articles.map((art, idx) =>
                        idx === articleIndex ? { ...art, [field]: value } : art
                      ),
                    }
                  : b
              ),
            }
          : a
      )
    );
    setValue("aircrafts", aircraftsData);
  };

  return (
    <div className="space-y-6">
      {/* Selección de aeronaves */}
      <div>
        <h2 className="font-bold mb-2">Seleccionar aeronaves</h2>
        {aircrafts.map((aircraft) => (
          <div key={aircraft.id} className="flex items-center gap-2 mb-2">
            <Checkbox
              checked={aircraftsData.some(
                (a) => a.aircraft_id === aircraft.id.toString()
              )}
              onCheckedChange={() =>
                handleAircraftSelect(aircraft.id.toString())
              }
            />
            <span>{aircraft.acronym}</span>
          </div>
        ))}
      </div>

      {/* Batches por aeronave */}
      {aircraftsData.map((aircraft) => (
        <div key={aircraft.aircraft_id} className="p-4 border rounded-lg">
          <h3 className="font-bold mb-3">
            {aircrafts.find((a) => a.id.toString() === aircraft.aircraft_id)
              ?.acronym || "Aeronave"}
          </h3>

          {/* Selección de batches */}
          <div className="mb-4">
            {batches.map((batch) => (
              <div key={batch.batch_name} className="flex items-center gap-2 mb-2">
                <Checkbox
                  checked={aircraft.articles.some(
                    (b) => b.batch === batch.id.toString()
                  )}
                  onCheckedChange={() =>
                    handleBatchSelect(
                      aircraft.aircraft_id,
                      batch.name,
                      batch.id.toString(),
                      batch.category
                    )
                  }
                />
                <span>{batch.name}</span>
              </div>
            ))}
          </div>

          {/* Artículos */}
          {aircraft.articles.map((batch) => (
            <div key={batch.batch} className="pl-4 border-l-2 border-gray-200 mb-4">
              <h4 className="font-semibold mb-2">{batch.batch_name}</h4>
              {batch.batch_articles.map((article, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                  <Input
                    placeholder="PN"
                    value={article.part_number || ""}
                    onChange={(e) =>
                      handleArticleChange(
                        aircraft.aircraft_id,
                        batch.batch,
                        idx,
                        "part_number",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder="Justificación"
                    value={article.justification || ""}
                    onChange={(e) =>
                      handleArticleChange(
                        aircraft.aircraft_id,
                        batch.batch,
                        idx,
                        "justification",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder="Manual"
                    value={article.manual || ""}
                    onChange={(e) =>
                      handleArticleChange(
                        aircraft.aircraft_id,
                        batch.batch,
                        idx,
                        "manual",
                        e.target.value
                      )
                    }
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
