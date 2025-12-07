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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
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
