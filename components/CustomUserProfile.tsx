// import { useUser, useOrganization, useAuth } from "@clerk/nextjs";
// import { useState } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
//
// export default function CustomUserProfile() {
//     const { user, isLoaded: isUserLoaded } = useUser();
//     const [username, setUsername] = useState(user?.username || "");
//     const [isUpdating, setIsUpdating] = useState(false);
//
//     const handleUpdateProfile = async (e: any) => {
//         e.preventDefault();
//         setIsUpdating(true);
//
//         try {
//             await user?.update({
//                 username: username,
//             });
//             // Show success notification
//         } catch (error) {
//             console.error("Error updating profile:", error);
//             // Show error notification
//         } finally {
//             setIsUpdating(false);
//         }
//     };
//
//     if (!isUserLoaded) {
//         return <div>Loading...</div>;
//     }
//
//     return (
//         <div className="container mx-auto py-6">
//             <h1 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-300">
//                 Conta
//             </h1>
//
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                 {/* Left sidebar */}
//                 <Card className="bg-gradient-to-b from-cyan-50 to-blue-50 dark:from-indigo-900 dark:to-blue-900 border-blue-200 dark:border-blue-800 col-span-1">
//                     <CardContent className="p-4">
//                         <Tabs defaultValue="profile" orientation="vertical" className="w-full">
//                             <TabsList className="flex flex-col items-start w-full space-y-1 bg-transparent">
//                                 <TabsTrigger
//                                     value="profile"
//                                     className="text-left w-full justify-start px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-300 rounded-lg"
//                                 >
//                                     Perfil
//                                 </TabsTrigger>
//                                 <TabsTrigger
//                                     value="security"
//                                     className="text-left w-full justify-start px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-300 rounded-lg"
//                                 >
//                                     Segurança
//                                 </TabsTrigger>
//                             </TabsList>
//                         </Tabs>
//                     </CardContent>
//                 </Card>
//
//                 {/* Main content */}
//                 <Card className="col-span-1 md:col-span-3 bg-white dark:bg-indigo-800/10 border-blue-200 dark:border-blue-800">
//                     <CardHeader>
//                         <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300">Perfil</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="flex items-center gap-4 mb-6">
//                             <Avatar className="h-16 w-16">
//                                 <AvatarImage src={user?.imageUrl} />
//                                 <AvatarFallback className="bg-gradient-to-br from-pink-500 to-yellow-400 text-white">
//                                     {user?.firstName?.[0]}{user?.lastName?.[0]}
//                                 </AvatarFallback>
//                             </Avatar>
//                             <div>
//                                 <h3 className="text-lg font-medium">{user?.firstName} {user?.lastName}</h3>
//                                 <Button variant="link" className="p-0 h-auto text-sm text-indigo-500 hover:text-pink-500">
//                                     Atualizar perfil
//                                 </Button>
//                             </div>
//                         </div>
//
//                         <form onSubmit={handleUpdateProfile} className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-indigo-600 dark:text-indigo-300 mb-1">
//                                     Nome de usuário
//                                 </label>
//                                 <div className="flex items-center gap-4">
//                                     <Input
//                                         value={username}
//                                         onChange={(e) => setUsername(e.target.value)}
//                                         className="border-blue-200 dark:border-blue-800 focus:border-pink-400 focus:ring focus:ring-pink-400/20"
//                                     />
//                                     <Button
//                                         type="button"
//                                         variant="link"
//                                         className="text-sm whitespace-nowrap text-indigo-500 hover:text-pink-500"
//                                     >
//                                         Trocar nome de usuário
//                                     </Button>
//                                 </div>
//                             </div>
//
//                             <div>
//                                 <label className="block text-sm font-medium text-indigo-600 dark:text-indigo-300 mb-1">
//                                     Endereços de e-mail
//                                 </label>
//                                 {user?.emailAddresses.map((email) => (
//                                     <div key={email.id} className="flex items-center justify-between py-2">
//                                         <div className="flex items-center gap-2">
//                                             <span>{email.emailAddress}</span>
//                                             {email.id === user?.primaryEmailAddressId && (
//                                                 <span className="text-xs text-gray-500">Principal</span>
//                                             )}
//                                         </div>
//                                     </div>
//                                 ))}
//                                 <Button
//                                     type="button"
//                                     variant="link"
//                                     className="mt-2 text-sm text-indigo-500 hover:text-pink-500"
//                                 >
//                                     + Adicionar um e-mail
//                                 </Button>
//                             </div>
//
//                             <div>
//                                 <label className="block text-sm font-medium text-indigo-600 dark:text-indigo-300 mb-1">
//                                     Contas conectadas
//                                 </label>
//                                 <div className="flex items-center gap-2 py-2">
//                                     <svg viewBox="0 0 24 24" className="h-5 w-5">
//                                         <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
//                                         <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
//                                         <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
//                                         <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
//                                     </svg>
//                                     <span>Google • {user?.primaryEmailAddress?.emailAddress}</span>
//                                 </div>
//                                 <Button
//                                     type="button"
//                                     variant="link"
//                                     className="mt-2 text-sm text-indigo-500 hover:text-pink-500"
//                                 >
//                                     + Conectar conta
//                                 </Button>
//                             </div>
//                         </form>
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     );
// }

import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <h1 className="text-2xl font-bold mb-6 text-violet-600">Conta</h1>

            <UserProfile
                path="/dashboard/settings"
                appearance={{
                    elements: {
                        // The card contains the entire UI
                        card: "shadow-none border-blue-100",
                        // The navbar contains the tabs
                        navbar: "bg-blue-50",
                        navbarButton: "text-indigo-600 hover:text-indigo-800",
                        navbarButtonActive: "bg-white text-indigo-600 border-indigo-600",
                        // Main action button
                        button: "bg-violet-600 hover:bg-violet-700",
                        // Form inputs
                        formFieldInput: "border-blue-200 focus:border-violet-500 focus:ring-violet-500"
                    }
                }}
            />
        </div>
    );
}