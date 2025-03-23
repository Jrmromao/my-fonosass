import {Suspense} from "react"

export async function PatientTableWrapper() {

    return (
        <Suspense fallback={<div>Loading...</div>}>
            {/*<PatientTableClient initialData={response.success ? response.data : []} />*/}
        </Suspense>
    )
}