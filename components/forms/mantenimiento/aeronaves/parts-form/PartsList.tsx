"use client"

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import PartSection from "./PartSection";

export default function PartsList({ fields, form, append, onRemove, onReactivate, onToggleExpand, expandedParts, onAddSubpart }: any) {
	return (
		<Card>
			<CardContent className="p-0">
				<ScrollArea className="h-auto">
					<div className="p-4 space-y-4">
						{fields.map((field: any, index: number) => (
							<PartSection
								key={field.id}
								form={form}
								index={index}
								path={`parts.${index}`}
								level={0}
								onRemove={onRemove}
								onReactivate={onReactivate}
								onToggleExpand={onToggleExpand}
								isExpanded={expandedParts[`parts.${index}`] || false}
								onAddSubpart={onAddSubpart}
								expandedParts={expandedParts}
							/>
						))}

						<Button type="button" variant="outline" onClick={() => append({ condition_type: "NEW" })} className="w-full border-dashed py-8">
							<PlusCircle className="size-4 mr-2" />
							Agregar Parte Principal
						</Button>
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
