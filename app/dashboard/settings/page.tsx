'use client'

import React from 'react'
// import {FormBuilder} from "@/components/form/formBuilder/FormBuilder";
// import {FormField} from "@/types/types";
// import RemoteControl from "@/components/RemoteControl";
import PhonemeTree from "@/components/tree/PhonemeTree";

// const handleSubmit = async (formData: {
//     title: string
//     description?: string
//     fields: FormField[]
// }) => {
//     try {
//
//         console.log(formData)
//
//
//         const response = await fetch('/api/forms', {
//             method: 'POST',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify(formData)
//         })
//
//         if (!response.ok) throw new Error('Failed to create form')
//
//         // Handle success
//     } catch (error) {
//         // Handle error
//         console.error('Failed to create form:', error)
//     }
// }


const Page = () => {
    return (
        <div className="p-6">
            {/*<RemoteControl/>*/}
            <PhonemeTree />
        </div>
    )
}
export default Page

