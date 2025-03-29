import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md px-6 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Create an Account</h1>
                    <p className="mt-2 text-gray-600">
                        Sign up to start planning your dream vacations
                    </p>
                </div>
                <SignUp
                    appearance={{
                        elements: {
                            formButtonPrimary:
                                "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700",
                            card: "shadow-md rounded-xl border-0",
                        },
                    }}
                    routing="path"
                    path="/sign-up"
                    signInUrl="/sign-in"
                    redirectUrl="/dashboard"
                />
            </div>
        </div>
    );
}