'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Image from 'next/image'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Icons
import {
    Check,
    CreditCard,
    Download,
    Edit2,
    Bell,
    Lock,
    LogOut,
    Mail,
    Phone,
    Save,
    Settings,
    Smartphone,
    User,
    UserCog,
    Calendar,
    Globe,
    FileText,
    Briefcase,
    Palette
} from 'lucide-react'

// Profile form schema
const profileSchema = z.object({
    fullName: z.string().min(2, "Nome completo é obrigatório"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    title: z.string().optional(),
    bio: z.string().max(300, "Bio não pode exceder 300 caracteres").optional(),
    website: z.string().url("URL inválida").optional().or(z.literal('')),
    specialties: z.array(z.string()).default([]),
})

// Notification settings schema
const notificationSchema = z.object({
    emailNotifications: z.boolean().default(true),
    smsNotifications: z.boolean().default(false),
    appNotifications: z.boolean().default(true),
    marketingEmails: z.boolean().default(false),
    sessionReminders: z.boolean().default(true),
    patientUpdates: z.boolean().default(true),
    billingAlerts: z.boolean().default(true),
    weeklyDigest: z.boolean().default(false),
})

// Appearance settings schema
const appearanceSchema = z.object({
    theme: z.enum(["light", "dark", "system"]).default("system"),
    accentColor: z.enum(["blue", "purple", "green", "pink", "orange"]).default("blue"),
    compactMode: z.boolean().default(false),
    fontSize: z.enum(["small", "medium", "large"]).default("medium"),
})

export default function SettingsPage() {
    // State for active view
    const [activeView, setActiveView] = useState("profile")

    // Sample user data - would come from your API
    const userData = {
        fullName: "Carolina Mendes",
        email: "carolina.mendes@fonospeech.com.br",
        phone: "+55 (11) 98765-4321",
        title: "Fonoaudióloga",
        bio: "Especialista em distúrbios da fala com 8 anos de experiência clínica. Foco em atendimento infantil e adolescente.",
        website: "carolinamendes.com.br",
        specialties: ["Dislexia", "Apraxia", "Gagueira"],
        avatarUrl: "https://i.pravatar.cc/300?img=47",
    }

    // Subscription data
    const subscriptionData = {
        plan: "Plano Profissional",
        status: "Ativo",
        price: "R$ 197,00",
        billingCycle: "Mensal",
        nextBillingDate: "15/05/2025",
        paymentMethod: "Mastercard •••• 5678",
        invoices: [
            { id: "INV-2023-005", date: "15/04/2025", amount: "R$ 197,00", status: "Pago" },
            { id: "INV-2023-004", date: "15/03/2025", amount: "R$ 197,00", status: "Pago" },
            { id: "INV-2023-003", date: "15/02/2025", amount: "R$ 197,00", status: "Pago" },
        ]
    }

    // Profile form
    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            title: userData.title,
            bio: userData.bio,
            website: userData.website,
            specialties: userData.specialties,
        }
    })

    // Notification form
    const notificationForm = useForm({
        resolver: zodResolver(notificationSchema),
        defaultValues: {
            emailNotifications: true,
            smsNotifications: false,
            appNotifications: true,
            marketingEmails: false,
            sessionReminders: true,
            patientUpdates: true,
            billingAlerts: true,
            weeklyDigest: false,
        }
    })

    // Appearance form
    const appearanceForm = useForm({
        resolver: zodResolver(appearanceSchema),
        defaultValues: {
            theme: "system",
            accentColor: "blue",
            compactMode: false,
            fontSize: "medium",
        }
    })

    // Form handlers
    const onProfileSubmit = (data: any) => {
        console.log("Profile data:", data)
        toast.success("Perfil atualizado com sucesso", {
            description: "Suas informações foram salvas.",
            action: {
                label: "Desfazer",
                onClick: () => console.log("Undo profile changes"),
            },
        })
    }

    const onNotificationSubmit = (data: any) => {
        console.log("Notification data:", data)
        toast.success("Preferências de notificação atualizadas", {
            description: "Suas mudanças foram aplicadas.",
        })
    }

    const onAppearanceSubmit = (data: any) => {
        console.log("Appearance data:", data)
        toast.success("Aparência atualizada", {
            description: "Suas preferências visuais foram salvas.",
        })
    }

    // Navigation items
    const navigationItems = [
        { id: "profile", label: "Perfil", icon: User },
        { id: "notifications", label: "Notificações", icon: Bell },
        { id: "security", label: "Segurança", icon: Lock },
        { id: "subscription", label: "Assinatura", icon: CreditCard },
        { id: "appearance", label: "Aparência", icon: Palette },
        { id: "integrations", label: "Integrações", icon: Globe },
    ]

    return (
        <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
            {/* Sidebar */}
            <div className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
                <div className="p-6">
                    <div className="flex items-center space-x-3">
                        <div className="font-bold text-xl bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                            FonoSaaS
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 pt-4">
                    <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Configurações
                    </p>

                    {navigationItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <button
                                key={item.id}
                                className={`flex items-center px-3 py-2.5 rounded-lg w-full mb-1 text-sm
                  ${activeView === item.id
                                    ? 'bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                }`}
                                onClick={() => setActiveView(item.id)}
                            >
                                <Icon size={18} className="mr-3" />
                                {item.label}
                            </button>
                        )
                    })}
                </nav>

                <div className="p-4 mt-auto">
                    <button className="flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm px-3 py-2 w-full">
                        <LogOut size={18} className="mr-3" />
                        Sair
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-2 pb-2">
                <div className="flex justify-around pt-2">
                    {navigationItems.slice(0, 5).map((item) => {
                        const Icon = item.icon
                        return (
                            <button
                                key={item.id}
                                className={`flex flex-col items-center justify-center p-2 rounded-md ${
                                    activeView === item.id
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-500 dark:text-gray-400'
                                }`}
                                onClick={() => setActiveView(item.id)}
                            >
                                <Icon size={20} />
                                <span className="text-xs mt-1">{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 md:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {navigationItems.find(item => item.id === activeView)?.label || 'Configurações'}
                        </h1>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" className="hidden md:flex">
                                <Settings className="h-4 w-4 mr-2" />
                                Ajuda
                            </Button>

                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={userData.avatarUrl} />
                                    <AvatarFallback>CM</AvatarFallback>
                                </Avatar>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium">{userData.fullName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{userData.title}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="p-4 md:p-8">
                    {/* Profile Settings */}
                    {activeView === "profile" && (
                        <div className="space-y-6">
                            <Card className="overflow-hidden border-none shadow-lg">
                                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-teal-500">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-3 right-3 bg-white/20 text-white hover:bg-white/30 rounded-full"
                                    >
                                        <Edit2 size={16} />
                                    </Button>
                                </div>

                                <div className="px-6 pb-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="-mt-12 flex-shrink-0">
                                            <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-900 shadow-md">
                                                <AvatarImage src={userData.avatarUrl} />
                                                <AvatarFallback className="text-2xl">CM</AvatarFallback>
                                            </Avatar>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-3 w-full"
                                            >
                                                Alterar foto
                                            </Button>
                                        </div>

                                        <div className="flex-1 pt-4 md:pt-0">
                                            <Form {...profileForm}>
                                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <FormField
                                                            control={profileForm.control}
                                                            name="fullName"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Nome completo</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} className="h-10" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="email"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Email</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} className="h-10" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="phone"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Telefone</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} className="h-10" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="title"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Título profissional</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} className="h-10" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="website"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Website</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} className="h-10" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="specialties"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Especialidades</FormLabel>
                                                                    <FormControl>
                                                                        <Select
                                                                            onValueChange={(value) => field.onChange([...field.value, value])}
                                                                            value={field.value[0] || ""}
                                                                        >
                                                                            <SelectTrigger className="h-10">
                                                                                <SelectValue placeholder="Selecione" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="Dislexia">Dislexia</SelectItem>
                                                                                <SelectItem value="Apraxia">Apraxia</SelectItem>
                                                                                <SelectItem value="Gagueira">Gagueira</SelectItem>
                                                                                <SelectItem value="Disfonia">Disfonia</SelectItem>
                                                                                <SelectItem value="Afasia">Afasia</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </FormControl>
                                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                                        {field.value.map((specialty) => (
                                                                            <Badge
                                                                                key={specialty}
                                                                                variant="secondary"
                                                                                className="px-2 py-1"
                                                                            >
                                                                                {specialty}
                                                                                <button
                                                                                    type="button"
                                                                                    className="ml-1 text-gray-500 hover:text-gray-700"
                                                                                    onClick={() => {
                                                                                        field.onChange(field.value.filter(s => s !== specialty))
                                                                                    }}
                                                                                >
                                                                                    &times;
                                                                                </button>
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <FormField
                                                        control={profileForm.control}
                                                        name="bio"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Bio profissional</FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        {...field}
                                                                        className="resize-none min-h-[100px]"
                                                                        placeholder="Descreva sua experiência e especialidades..."
                                                                    />
                                                                </FormControl>
                                                                <FormDescription className="text-right">
                                                                    {field.value?.length || 0}/300 caracteres
                                                                </FormDescription>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="flex justify-end">
                                                        <Button
                                                            type="submit"
                                                            className="px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                                                        >
                                                            <Save className="mr-2 h-4 w-4" />
                                                            Salvar alterações
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações da Clínica</CardTitle>
                                    <CardDescription>
                                        Configurações da sua clínica ou consultório
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Nome da clínica</label>
                                            <Input defaultValue="Centro de Fonoaudiologia Mendes" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">CNPJ</label>
                                            <Input defaultValue="12.345.678/0001-90" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Endereço</label>
                                            <Input defaultValue="Av. Paulista, 1000 - Sala 301" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Cidade/Estado</label>
                                            <Input defaultValue="São Paulo, SP" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3">
                                        <p className="text-sm text-gray-500">As informações da clínica aparecerão em relatórios e outros documentos.</p>
                                        <Button variant="outline">Atualizar</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeView === "notifications" && (
                        <div className="space-y-6">
                            <Card className="border-none shadow-lg">
                                <CardHeader className="pb-3">
                                    <CardTitle>Preferências de Notificação</CardTitle>
                                    <CardDescription>
                                        Escolha quais notificações você deseja receber e como recebê-las
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...notificationForm}>
                                        <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                                            <div className="space-y-4">
                                                <h3 className="text-base font-medium">Canais de comunicação</h3>

                                                <div className="grid gap-3">
                                                    <FormField
                                                        control={notificationForm.control}
                                                        name="emailNotifications"
                                                        render={({ field }) => (
                                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                                                        <Mail size={18} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-gray-900 dark:text-gray-100">Email</p>
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{userData.email}</p>
                                                                    </div>
                                                                </div>
                                                                <FormControl>
                                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                                </FormControl>
                                                            </div>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={notificationForm.control}
                                                        name="smsNotifications"
                                                        render={({ field }) => (
                                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                                                        <Smartphone size={18} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-gray-900 dark:text-gray-100">SMS</p>
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{userData.phone}</p>
                                                                    </div>
                                                                </div>
                                                                <FormControl>
                                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                                </FormControl>
                                                            </div>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={notificationForm.control}
                                                        name="appNotifications"
                                                        render={({ field }) => (
                                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                                                                        <Bell size={18} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-gray-900 dark:text-gray-100">Notificações no App</p>
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Notificações push no navegador e aplicativo</p>
                                                                    </div>
                                                                </div>
                                                                <FormControl>
                                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                                </FormControl>
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="space-y-4">
                                                <h3 className="text-base font-medium">Tipos de notificação</h3>

                                                <div className="grid gap-3">
                                                    <FormField
                                                        control={notificationForm.control}
                                                        name="sessionReminders"
                                                        render={({ field }) => (
                                                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                                                <div>
                                                                    <p className="font-medium flex items-center">
                                                                        <Calendar size={16} className="mr-2 text-gray-500" />
                                                                        Lembretes de sessão
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        Lembretes para suas sessões agendadas
                                                                    </p>
                                                                </div>
                                                                <FormControl>
                                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                                </FormControl>
                                                            </div>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={notificationForm.control}
                                                        name="patientUpdates"
                                                        render={({ field }) => (
                                                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                                                <div>
                                                                    <p className="font-medium flex items-center">
                                                                        <User size={16} className="mr-2 text-gray-500" />
                                                                        Atualizações de pacientes
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        Notificações sobre atividade de pacientes
                                                                    </p>
                                                                </div>
                                                                <FormControl>
                                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                                </FormControl>
                                                            </div>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={notificationForm.control}
                                                        name="billingAlerts"
                                                        render={({ field }) => (
                                                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                                                <div>
                                                                    <p className="font-medium flex items-center">
                                                                        <CreditCard size={16} className="mr-2 text-gray-500" />
                                                                        Alertas de faturamento
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        Notificações sobre pagamentos e faturas
                                                                    </p>
                                                                </div>
                                                                <FormControl>
                                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                                </FormControl>
                                                            </div>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={notificationForm.control}
                                                        name="weeklyDigest"
                                                        render={({ field }) => (
                                                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                                                <div>
                                                                    <p className="font-medium flex items-center">
                                                                        <FileText size={16} className="mr-2 text-gray-500" />
                                                                        Resumo semanal
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        Receba um resumo semanal das suas atividades
                                                                    </p>
                                                                </div>
                                                                <FormControl>
                                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                                </FormControl>
                                                            </div>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={notificationForm.control}
                                                        name="marketingEmails"
                                                        render={({ field }) => (
                                                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                                                <div>
                                                                    <p className="font-medium flex items-center">
                                                                        <Briefcase size={16} className="mr-2 text-gray-500" />
                                                                        Comunicações de marketing
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        Novidades, dicas e conteúdos exclusivos
                                                                    </p>
                                                                </div>
                                                                <FormControl>
                                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                                </FormControl>
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <Button
                                                    type="submit"
                                                    className="px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                                                >
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Salvar preferências
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeView === "security" && (
                        <div className="space-y-6">
                            <Card className="border-none shadow-lg">
                                <CardHeader>
                                    <CardTitle>Segurança da Conta</CardTitle>
                                    <CardDescription>
                                        Gerencie a segurança da sua conta e configure a autenticação
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Password Section */}
                                    <div>
                                        <h3 className="text-base font-medium mb-4">Senha e Autenticação</h3>

                                        <div className="divide-y border rounded-lg">
                                            <div className="flex items-center justify-between p-4">
                                                <div className="space-y-0.5">
                                                    <div className="font-medium">Senha</div>
                                                    <div className="text-sm text-gray-500">
                                                        Última atualização: 3 meses atrás
                                                    </div>
                                                </div>
                                                <Button variant="outline">Alterar</Button>
                                            </div>

                                            <div className="flex items-center justify-between p-4">
                                                <div className="space-y-0.5">
                                                    <div className="font-medium flex items-center">
                                                        Autenticação de dois fatores
                                                        <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Recomendado</Badge>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Adicione uma camada extra de segurança à sua conta
                                                    </div>
                                                </div>
                                                <Button variant="outline">Configurar</Button>
                                            </div>

                                            <div className="flex items-center justify-between p-4">
                                                <div className="space-y-0.5">
                                                    <div className="font-medium">Métodos de recuperação</div>
                                                    <div className="text-sm text-gray-500">
                                                        Email: c****@fonospeech.com.br
                                                    </div>
                                                </div>
                                                <Button variant="outline">Gerenciar</Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sessions Section */}
                                    <div className="pt-4">
                                        <h3 className="text-base font-medium mb-4">Sessões ativas</h3>

                                        <div className="border rounded-lg divide-y">
                                            <div className="p-4 flex items-center">
                                                <div className="mr-4 p-2 bg-blue-50 rounded-full text-blue-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect width="16" height="20" x="4" y="2" rx="2" />
                                                        <circle cx="12" cy="18" r="1" />
                                                        <path d="M10 6h4" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium flex items-center">
                                                        iPhone 13
                                                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Atual</Badge>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        São Paulo, Brasil • Último acesso: Agora
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm">Detalhes</Button>
                                            </div>

                                            <div className="p-4 flex items-center">
                                                <div className="mr-4 p-2 bg-blue-50 rounded-full text-blue-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect width="20" height="14" x="2" y="3" rx="2" />
                                                        <line x1="8" x2="16" y1="21" y2="21" />
                                                        <line x1="12" x2="12" y1="17" y2="21" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">MacBook Pro</div>
                                                    <div className="text-sm text-gray-500">
                                                        São Paulo, Brasil • Último acesso: 2 horas atrás
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm">Detalhes</Button>
                                            </div>
                                        </div>

                                        <div className="flex justify-end mt-4">
                                            <Button variant="outline" className="text-red-600">Encerrar todas as outras sessões</Button>
                                        </div>
                                    </div>

                                    {/* Activity Log */}
                                    <div className="pt-4">
                                        <h3 className="text-base font-medium mb-4">Histórico de atividades</h3>

                                        <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                                            <div className="p-4">
                                                <div className="flex items-center">
                                                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                                    <div className="font-medium">Login bem-sucedido</div>
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    09 de abril, 2025 às 14:32 • São Paulo, Brasil • iPhone 13
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <div className="flex items-center">
                                                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                                    <div className="font-medium">Senha alterada</div>
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    02 de março, 2025 às 10:15 • São Paulo, Brasil • MacBook Pro
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <div className="flex items-center">
                                                    <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                                                    <div className="font-medium">Tentativa de login bloqueada</div>
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    15 de fevereiro, 2025 às 22:45 • Rio de Janeiro, Brasil • Dispositivo desconhecido
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end mt-4">
                                            <Button variant="outline">Ver histórico completo</Button>
                                        </div>
                                    </div>

                                    {/* Advanced Security */}
                                    <div className="pt-4">
                                        <h3 className="text-base font-medium mb-4">Segurança avançada</h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">Verificação de login</p>
                                                    <p className="text-sm text-gray-500">
                                                        Exigir confirmação para logins em novos dispositivos
                                                    </p>
                                                </div>
                                                <Switch defaultChecked={true} />
                                            </div>

                                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">Notificações de segurança</p>
                                                    <p className="text-sm text-gray-500">
                                                        Receba alertas sobre atividades suspeitas
                                                    </p>
                                                </div>
                                                <Switch defaultChecked={true} />
                                            </div>

                                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">Bloqueio de países</p>
                                                    <p className="text-sm text-gray-500">
                                                        Bloquear tentativas de login de países específicos
                                                    </p>
                                                </div>
                                                <Button variant="outline">Configurar</Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Data Management */}
                                    <div className="pt-4">
                                        <h3 className="text-base font-medium mb-4 text-red-600">Ações de conta</h3>

                                        <div className="grid gap-4">
                                            <Button variant="outline" className="justify-start text-amber-600 border-amber-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                </svg>
                                                Exportar dados pessoais
                                            </Button>

                                            <Button variant="outline" className="justify-start text-red-600 border-red-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                    <path d="M3 6h18" />
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                    <line x1="10" x2="10" y1="11" y2="17" />
                                                    <line x1="14" x2="14" y1="11" y2="17" />
                                                </svg>
                                                Excluir minha conta
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}