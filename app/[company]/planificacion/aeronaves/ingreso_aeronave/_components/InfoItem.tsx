export function InfoItem({ label, value }: { label: string; value?: string | number }) {
    return (
        <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold">
                {value || <span className="text-muted-foreground italic">No especificado</span>}
            </p>
        </div>
    );
}
