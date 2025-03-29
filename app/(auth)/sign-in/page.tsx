import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cyan-100 to-fuchsia-100 dark:from-indigo-900 dark:to-fuchsia-900">
            <div className="w-full max-w-md px-6 py-8">
                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">F</span>
                    </div>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-400 mb-2">
                        Bem-vindo de volta
                    </h1>
                    <p className="text-indigo-600 dark:text-blue-300">
                        Entre na sua conta para gerenciar seus exercícios de fonoaudiologia
                    </p>
                </div>

                <SignIn
                    appearance={{
                        elements: {
                            formButtonPrimary:
                                "bg-gradient-to-r from-pink-500 to-yellow-400 hover:shadow-lg hover:shadow-pink-500/20 transition-all",
                            card: "bg-white dark:bg-indigo-800 shadow-xl shadow-indigo-500/10 rounded-2xl border-0",
                            headerTitle: "text-indigo-600 dark:text-blue-300",
                            headerSubtitle: "text-indigo-600/80 dark:text-blue-300/80",
                            formFieldLabel: "text-indigo-600 dark:text-blue-300",
                            formFieldInput: "border-indigo-200 dark:border-indigo-700 bg-white dark:bg-indigo-800/50 text-indigo-600 dark:text-blue-300 focus:border-pink-400 dark:focus:border-pink-500 focus:ring-pink-400/20 dark:focus:ring-pink-500/20",
                            footerActionLink: "text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300",
                            identityPreview: "bg-indigo-50 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-700",
                            identityPreviewText: "text-indigo-600 dark:text-blue-300",
                            identityPreviewEditButton: "text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300",
                            formFieldAction: "text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300",
                            formFieldErrorText: "text-red-500 dark:text-red-400",
                            formFieldSuccessText: "text-green-500 dark:text-green-400",
                            footer: "text-indigo-600/80 dark:text-blue-300/80",
                            alertText: "text-indigo-600/80 dark:text-blue-300/80",
                            socialButtonsBlockButton: "border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/50",
                            socialButtonsBlockButtonText: "text-indigo-600 dark:text-blue-300",
                            otpCodeFieldInput: "border-indigo-200 dark:border-indigo-700 bg-white dark:bg-indigo-800/50 text-indigo-600 dark:text-blue-300",
                        },
                        variables: {
                            borderRadius: '16px',
                            fontFamily: 'inherit',
                        }
                    }}
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                    redirectUrl="/dashboard"
                />

                <div className="mt-8 text-center">
                    <p className="text-indigo-600/70 dark:text-blue-300/70 text-sm">
                        Não tem uma conta?{" "}
                        <a href="/sign-up" className="text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 font-medium">
                            Cadastre-se agora
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}