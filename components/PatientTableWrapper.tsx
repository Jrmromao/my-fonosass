// components/PatientTableWrapper.tsx (Server Component)
import { getPatients } from "@/lib/actions/activity.action"
import { PatientTableClient } from "./PatientTableClient"
import { Suspense } from "react"

export async function PatientTableWrapper() {
    const response = await getPatients()

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PatientTableClient initialData={response.success ? response.data : []} />
        </Suspense>
    )
}