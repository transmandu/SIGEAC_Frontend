import SurveyResponseForm from "@/components/forms/aerolinea/sms/survey/SurveyResponseForm";
import { GuestContentLayout } from "@/components/layout/GuestContentLayout";

const SurveyPage = () => {
  return (
    <GuestContentLayout title="Encuesta">
      <div className="flex flex-col justify-center items-center">
        <SurveyResponseForm />
      </div>
    </GuestContentLayout>
  );
};

export default SurveyPage;
