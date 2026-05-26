import { NewPatientDialog } from '@/components/dialogs/new-patient-dialog';
import React from 'react';

export default async function PatientsPage() {
  // const response = await getPatients()
  //
  // const patients = response.success ? response.data : []

  return (
    <div className="h-full p-8 bg-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciamento de Pacientes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os seus pacientes em um só lugar
          </p>
        </div>
        <NewPatientDialog />
      </div>

      {/* Remove Suspense temporarily for debugging */}

      {/* Add this to see if data is available */}
      <div className="hidden">{/*{JSON.stringify(patients)}*/}</div>
    </div>
  );
}
