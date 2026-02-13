import { ForgotPasswordForm } from "@/components/forms/ajustes/ForgotPassword";

const ForgotPassword = () => {
  return (
    <div className="flex min-h-screen items-center justify-center gap-4">
      <div className="w-full max-w-md border p-8 rounded-lg shadow-sm bg-card">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPassword;
