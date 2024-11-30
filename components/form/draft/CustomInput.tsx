import React, {forwardRef} from 'react'
import {Control} from 'react-hook-form'


export interface CustomInputProps {
    label?: string;
    name: string;
    control: Control<never>;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    tooltip?: string;
    className?: string;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(() => {



    return (
     <></>
    )
});

CustomInput.displayName = 'CustomInput'

export default CustomInput