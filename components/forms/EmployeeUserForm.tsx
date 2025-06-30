'use client';

import { useCreateEmployee } from '@/actions/general/empleados/actions';
import { useCreateUser } from '@/actions/general/usuarios/actions';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { CreateEmployeeForm } from './CreateEmployeeForm';
import { CreateUserFromEmployeeForm } from './CreateUserFromEmployeeForm';

export function EmployeeUserForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [createUserState, setCreateUserState] = useState(false);
  const {createEmployee} = useCreateEmployee();
  const {createUser} = useCreateUser();

  const handleEmployeeSubmit = async (data: any) => {
    setEmployeeData(data);

    if (!data.createUser) {
      // Submit only employee data
      await createEmployee.mutateAsync(data);
      return;
    }

    setCreateUserState(true);
    setStep(2);
  };

  const handleUserSubmit = async (userData: any) => {
    if (!employeeData) return;

    try {
      // First create employee
      const employee = await createEmployee.mutateAsync(employeeData);

      // Then create user with employee ID
      await createUser.mutateAsync({
        ...userData,
      });

      // Handle success (show toast, redirect, etc.)
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div className="space-y-6">
      <Stepper steps={['Información del Empleado', 'Crear Usuario']} currentStep={step} />

      {step === 1 && (
        <CreateEmployeeForm />
      )}

      {step === 2 && createUserState && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setStep(1)}
            >
              ←
            </Button>
            <h3 className="text-lg font-medium">Crear Usuario</h3>
          </div>

          <CreateUserFromEmployeeForm
            defaultValues={{
              first_name: employeeData.first_name,
              last_name: employeeData.last_name,
              // Add other fields you want to pre-populate
            }}
            onSubmit={handleUserSubmit}
          />
        </div>
      )}
    </div>
  );
}

// Stepper component (create this separately)
function Stepper({ steps, currentStep }: { steps: string[], currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className={`rounded-full w-8 h-8 flex items-center justify-center
            ${currentStep > index + 1 ? 'bg-green-500 text-white' :
              currentStep === index + 1 ? 'bg-primary text-white' : 'bg-muted'}`}>
            {currentStep > index + 1 ? (
              <Check className="w-4 h-4" />
            ) : (
              index + 1
            )}
          </div>
          <span className={`ml-2 ${currentStep === index + 1 ? 'font-medium' : ''}`}>
            {step}
          </span>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-2 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-muted'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
