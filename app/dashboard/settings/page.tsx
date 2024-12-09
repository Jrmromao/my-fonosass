'use client'

import React from 'react'
// import {FormBuilder} from "@/components/form/formBuilder/FormBuilder";
// import {FormField} from "@/types/types";
// import RemoteControl from "@/components/RemoteControl";
import PhonemeTree from "@/components/tree/PhonemeTree";
import EnhancedAppleTree from "@/components/tree/PhonemeTree";
import SpiralAppleTree from "@/components/tree/PhonemeTree";
import NaturalAppleTree from "@/components/tree/PhonemeTree";
import OutlinedTree from "@/components/tree/PhonemeTree";
import SVGRender from "@/components/SVGRender";
import dynamic from "next/dynamic";

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


// Load SVG only on client side
// const DynamicSVG = dynamic(
//     () => import('@/components/SVGRender'),
//     {
//         ssr: false,
//         loading: () => <div>Loading...</div>
//     }
// )



const Page = () => {

    const messages = [
        "Welcome to our family tree!",
        "Click the apples to learn more",
        // ... more messages
    ];

    const handleAppleClick = (apple: any) => {
        console.log(`Clicked apple: ${apple.id}`);
    };

    return (
        <div className="p-6">
            {/*<RemoteControl/>*/}


{/*<SVGRender />*/}



        </div>
    )
}
export default Page

