export type Patient = {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
    contactEmail: string;
    contactPhone: string;
    address: string;
    medicalHistory?: string;
    status: "ACTIVE" | "INACTIVE";
    primaryTherapistId: string;
    practiceId?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Type for creating a new patient
export type CreatePatientParams = Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;

// Type for updating a patient
export type UpdatePatientParams = Partial<Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>>;

// Type for patient with relationships
export type PatientWithRelations = Patient & {
    primaryTherapist: {
        id: string;
        fullName: string;
        email: string;
    };
    practice?: {
        id: string;
        name: string;
    };
    progressNotes?: {
        id: string;
        content: string;
        createdAt: Date;
    }[];
};

// Type for patient list display
export type PatientListItem = Pick<Patient, 'id' | 'firstName' | 'lastName' | 'status'> & {
    fullName: string;
};

export type CreatePatientInput = {
    firstName: string;
    lastName: string;
    dateOfBirth: string; // Format: YYYY-MM-DD
    gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
    contactEmail: string;
    contactPhone: string;
    address: string;
    medicalHistory?: string;
}