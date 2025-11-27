
interface MessageProps {
    title: string;
    description: string;
}

export const Message = ({ title, description }: MessageProps) => {
    return (
        <div className="flex flex-col items-center justify-center h-48">
            <h2 className="text-sm sm:text-base font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
};