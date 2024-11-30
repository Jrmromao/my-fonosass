import React from "react";
import {LoadingOverlay} from "@/components/LoadingOverlay";

export default function NewPatientPage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Cadastrar Novo Paciente</h1>


            <LoadingOverlay />
            {/*<NewPatientForm />*/}

        </div>
    )
}

