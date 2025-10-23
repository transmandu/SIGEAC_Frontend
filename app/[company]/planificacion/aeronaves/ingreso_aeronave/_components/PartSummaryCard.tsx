import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent
} from "@/components/ui/card";
import {
    ChevronDown,
    FileText,
    Folder
} from "lucide-react";
import { useState } from "react";
import { InfoItem } from "./InfoItem";


export function PartSummaryCard({ part, index, level }: {
    part: any;
    index: number;
    level: number;
}) {
    const [expanded, setExpanded] = useState(false); // Todas las partes comienzan colapsadas

    return (
        <Card className={`overflow-hidden ${level > 0 ? 'ml-6' : ''}`}>
            <div
                className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2">
                    <ChevronDown
                        className={`h-4 w-4 transition-transform ${expanded ? '' : '-rotate-90'}`}
                    />
                    <div className="flex items-center gap-2">
                        {part.is_father ? (
                            <Folder className="h-4 w-4 text-blue-500" />
                        ) : (
                            <FileText className="h-4 w-4 text-green-500" />
                        )}
                        <span className="font-medium">
                            {part.part_name || `Parte ${index + 1}`}
                        </span>
                        {part.part_number && (
                            <Badge variant="outline" className="ml-2">
                                {part.part_number}
                            </Badge>
                        )}
                    </div>
                </div>

                {part.is_father && part.sub_parts && (
                    <Badge variant="secondary">
                        {part.sub_parts.length} subparte{part.sub_parts.length !== 1 ? 's' : ''}
                    </Badge>
                )}
            </div>

            {expanded && (
                <CardContent className="p-4 space-y-3 border-t">
                    <div className="grid grid-cols-2 gap-3">
                        <InfoItem label="Nombre" value={part.part_name} />
                        <InfoItem label="Número de Parte" value={part.part_number} />
                        <InfoItem label="Serial" value={part.serial} />
                        <InfoItem label="Marca" value={part.brand} />
                        <InfoItem 
                            label="TSN (Time Since New)" 
                            value={part.time_since_new ? `${part.time_since_new.toLocaleString()} hrs` : "No especificado"} 
                        />
                        <InfoItem 
                            label="TSO (Time Since Overhaul)" 
                            value={part.time_since_overhaul ? `${part.time_since_overhaul.toLocaleString()} hrs` : "No especificado"} 
                        />
                        <InfoItem 
                            label="CSN (Cycles Since New)" 
                            value={part.cycles_since_new ? part.cycles_since_new.toLocaleString() : "No especificado"} 
                        />
                        <InfoItem 
                            label="CSO (Cycles Since Overhaul)" 
                            value={part.cycles_since_overhaul ? part.cycles_since_overhaul.toLocaleString() : "No especificado"} 
                        />
                    </div>

                    {/* Subpartes */}
                    {part.is_father && part.sub_parts && part.sub_parts.length > 0 && (
                        <div className="pt-3 border-t">
                            <h4 className="font-medium mb-2 text-sm">Subpartes</h4>
                            <div className="space-y-2">
                                {part.sub_parts.map((subPart: any, subIndex: number) => (
                                    <PartSummaryCard
                                        key={subIndex}
                                        part={subPart}
                                        index={subIndex}
                                        level={level + 1}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}