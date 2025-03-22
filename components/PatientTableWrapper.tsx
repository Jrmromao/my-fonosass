// components/PatientTableWrapper.tsx (Server Component)
import { PatientTableClient } from "./PatientTableClient"
import { Suspense } from "react"
import {getPatients} from "@/lib/actions/patient.action";

export async function PatientTableWrapper() {
    const response = await getPatients()

    return (
        <Suspense fallback={<div>Loading...</div>}>
            {/*<PatientTableClient initialData={response.success ? response.data : []} />*/}
        </Suspense>
    )
}