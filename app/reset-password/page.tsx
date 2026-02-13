import { ResetPasswordForm } from "@/components/forms/ajustes/ResetPasswordForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string; email?: string };
}) {
  const token = searchParams.token || "";
  const email = searchParams.email || "";

  if (!token || !email) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center text-red-600">
              Enlace inválido
            </h1>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              El enlace de restablecimiento de contraseña no es valido o ha expirado. Por favor, solicite uno nuevo.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg border-none shadow-none dark:bg-transparent">
        <CardContent>
          <ResetPasswordForm token={token} email={email} />
        </CardContent>
      </Card>
    </main>
  );
}
