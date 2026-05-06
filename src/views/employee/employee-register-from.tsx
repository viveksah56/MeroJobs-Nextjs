"use client"

import * as React from "react"
import {memo, useActionState} from "react"
import {Controller, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Loader2, UserPlus, Eye, EyeOff, ChevronDown, Check} from "lucide-react"
import {cn} from "@/lib/utils"
import {AccountStatus} from "@/models/enum/account-status.enum"
import {type EmployeeRegisterForm, employeeRegisterSchema, useEmployeeStore} from "@/models/employee/employee.model"

const statusOptions = Object.values(AccountStatus).map((s) => ({
    label: s,
    value: s,
}))

type FormState = {
    success: boolean
    message: string | null
}

const initialState: FormState = {
    success: false,
    message: null,
}

interface EmployeeRegisterFormProps {
    onSuccess?: () => void
    className?: string
}

function FieldLabel({children, required}: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1.5">
            {children}
            {required && <span className="ml-1 text-amber-400">*</span>}
        </label>
    )
}

function FieldError({message}: { message?: string }) {
    if (!message) return null
    return <p className="mt-1.5 text-[11px] text-rose-400 font-medium">{message}</p>
}

const inputBase =
    "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-amber-400/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-amber-400/10 disabled:opacity-40 disabled:cursor-not-allowed"

const TextInput = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & {error?: string; label?: string; required?: boolean}
>(({label, required, error, className, ...props}, ref) => (
    <div>
        {label && <FieldLabel required={required}>{label}</FieldLabel>}
        <input ref={ref} className={cn(inputBase, error && "border-rose-500/50 focus:border-rose-400/60 focus:ring-rose-400/10", className)} {...props} />
        <FieldError message={error} />
    </div>
))
TextInput.displayName = "TextInput"

const TextareaInput = React.forwardRef<
    HTMLTextAreaElement,
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & {error?: string; label?: string; required?: boolean}
>(({label, required, error, className, ...props}, ref) => (
    <div>
        {label && <FieldLabel required={required}>{label}</FieldLabel>}
        <textarea
            ref={ref}
            rows={3}
            className={cn(inputBase, "resize-none", error && "border-rose-500/50 focus:border-rose-400/60 focus:ring-rose-400/10", className)}
            {...props}
        />
        <FieldError message={error} />
    </div>
))
TextareaInput.displayName = "TextareaInput"

function PasswordInput({label, required, error, disabled, ...props}: React.InputHTMLAttributes<HTMLInputElement> & {error?: string; label?: string; required?: boolean}) {
    const [show, setShow] = React.useState(false)
    return (
        <div>
            {label && <FieldLabel required={required}>{label}</FieldLabel>}
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    disabled={disabled}
                    className={cn(inputBase, "pr-11", error && "border-rose-500/50 focus:border-rose-400/60 focus:ring-rose-400/10")}
                    {...props}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    disabled={disabled}
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
                >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
            <FieldError message={error} />
        </div>
    )
}

function StatusSelect({value, onChange, error, disabled}: {value: string; onChange: (v: string) => void; error?: string; disabled?: boolean}) {
    const [open, setOpen] = React.useState(false)
    const ref = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        function handle(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handle)
        return () => document.removeEventListener("mousedown", handle)
    }, [])

    const selected = statusOptions.find((o) => o.value === value)

    return (
        <div ref={ref} className="relative">
            <FieldLabel required>Account status</FieldLabel>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    inputBase,
                    "flex items-center justify-between text-left",
                    !selected && "text-slate-600",
                    error && "border-rose-500/50",
                    open && "border-amber-400/60 bg-white/[0.06] ring-2 ring-amber-400/10"
                )}
            >
                <span>{selected?.label ?? "Select status"}</span>
                <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform duration-200", open && "rotate-180")} />
            </button>
            {open && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/[0.08] bg-[#13141a] shadow-2xl shadow-black/50 overflow-hidden">
                    {statusOptions.map((o) => (
                        <button
                            key={o.value}
                            type="button"
                            onClick={() => {onChange(o.value); setOpen(false)}}
                            className="flex w-full items-center justify-between px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                        >
                            {o.label}
                            {value === o.value && <Check className="h-3.5 w-3.5 text-amber-400" />}
                        </button>
                    ))}
                </div>
            )}
            <FieldError message={error} />
        </div>
    )
}

function SectionDivider({label}: {label: string}) {
    return (
        <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">{label}</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
        </div>
    )
}

const EmployeeRegisterFormPage = memo(function EmployeeRegisterFormPage({onSuccess, className}: EmployeeRegisterFormProps) {
    const setEmployee = useEmployeeStore((s) => s.setEmployee)

    const {register, handleSubmit, control, formState: {errors}} = useForm<EmployeeRegisterForm>({
        resolver: zodResolver(employeeRegisterSchema),
        defaultValues: {
            firstName: "", lastName: "", email: "", password: "", phone: "", bio: "",
            companyName: "", jobTitle: "", department: "", workLocation: "", salary: 0, status: AccountStatus.ACTIVE,
        },
        mode: "onTouched",
    })

    const registerAction = async (_prev: FormState, data: EmployeeRegisterForm): Promise<FormState> => {
        try {
            setEmployee(data)
            onSuccess?.()
            return {success: true, message: null}
        } catch {
            return {success: false, message: "Registration failed. Please try again."}
        }
    }

    const [state, formAction, isPending] = useActionState(registerAction, initialState)

    const onSubmit = (data: EmployeeRegisterForm) => {
        React.startTransition(() => {formAction(data)})
    }

    return (
        <div className={cn("min-h-screen w-full bg-[#0c0d11] flex items-start justify-center px-4 py-10 sm:py-16", className)}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
                .form-wrap { font-family: 'DM Sans', sans-serif; }
                .form-heading { font-family: 'Syne', sans-serif; }
                .glow-line { background: linear-gradient(90deg, transparent, #f59e0b55, transparent); }
                @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-up { animation: fade-up 0.5s ease both; }
                .stagger-1 { animation-delay: 0.05s; }
                .stagger-2 { animation-delay: 0.10s; }
                .stagger-3 { animation-delay: 0.15s; }
                .stagger-4 { animation-delay: 0.20s; }
                .stagger-5 { animation-delay: 0.25s; }
                .stagger-6 { animation-delay: 0.30s; }
            `}</style>

            <div className="form-wrap w-full max-w-2xl">
                <div className="animate-fade-up mb-10 text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/5 shadow-lg shadow-amber-400/5">
                        <UserPlus className="h-6 w-6 text-amber-400" strokeWidth={1.5} />
                    </div>
                    <h1 className="form-heading text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
                        Register Employee
                    </h1>
                    <p className="text-sm text-slate-500 font-light">
                        Complete the form below to create a new employee account
                    </p>
                    <div className="glow-line h-px w-48 mx-auto mt-6 opacity-60" />
                </div>

                <div className="animate-fade-up stagger-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden">
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

                    <div className="p-6 sm:p-8 lg:p-10">
                        {state.message && !state.success && (
                            <div className="animate-fade-up mb-6 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-center text-sm text-rose-400">
                                {state.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                            <div className="animate-fade-up stagger-2">
                                <SectionDivider label="Personal info" />
                                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <TextInput {...register("firstName")} label="First name" required autoFocus disabled={isPending} placeholder="Jane" error={errors.firstName?.message} />
                                    <TextInput {...register("lastName")} label="Last name" required disabled={isPending} placeholder="Doe" error={errors.lastName?.message} />
                                </div>
                                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <TextInput {...register("email")} label="Email address" type="email" autoComplete="email" required disabled={isPending} placeholder="jane@company.com" error={errors.email?.message} />
                                    <TextInput {...register("phone")} label="Phone" type="tel" disabled={isPending} placeholder="+1 555 000 0000" error={errors.phone?.message} />
                                </div>
                            </div>

                            <div className="animate-fade-up stagger-3">
                                <SectionDivider label="Security" />
                                <div className="mt-5">
                                    <PasswordInput {...register("password")} label="Password" required disabled={isPending} autoComplete="new-password" placeholder="••••••••" error={errors.password?.message} />
                                </div>
                            </div>

                            <div className="animate-fade-up stagger-4">
                                <SectionDivider label="Work details" />
                                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <TextInput {...register("companyName")} label="Company name" required disabled={isPending} placeholder="Acme Corp" error={errors.companyName?.message} />
                                    <TextInput {...register("jobTitle")} label="Job title" required disabled={isPending} placeholder="Software Engineer" error={errors.jobTitle?.message} />
                                </div>
                                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <TextInput {...register("department")} label="Department" disabled={isPending} placeholder="Engineering" error={errors.department?.message} />
                                    <TextInput {...register("workLocation")} label="Work location" disabled={isPending} placeholder="Remote / New York" error={errors.workLocation?.message} />
                                </div>
                                <div className="mt-5">
                                    <TextInput {...register("salary", {valueAsNumber: true})} label="Salary" type="number" required disabled={isPending} placeholder="60000" error={errors.salary?.message} />
                                </div>
                            </div>

                            <div className="animate-fade-up stagger-5">
                                <SectionDivider label="Profile" />
                                <div className="mt-5 space-y-5">
                                    <TextareaInput {...register("bio")} label="Bio" disabled={isPending} placeholder="Short bio about the employee..." error={errors.bio?.message} />
                                    <Controller
                                        control={control}
                                        name="status"
                                        render={({field}) => (
                                            <StatusSelect
                                                value={field.value ?? ""}
                                                onChange={(v) => field.onChange(v)}
                                                error={errors.status?.message}
                                                disabled={isPending}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="animate-fade-up stagger-6 pt-2">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full relative overflow-hidden rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-semibold text-slate-900 tracking-wide transition-all duration-200 hover:bg-amber-300 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-400/20 hover:shadow-amber-400/30"
                                >
                                    {isPending ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Registering…
                                        </span>
                                    ) : (
                                        "Register Employee"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-slate-600">
                    Need help?{" "}
                    <a href="mailto:support@company.com" className="text-slate-500 underline underline-offset-4 hover:text-amber-400 transition-colors">
                        Contact IT support
                    </a>
                </p>
            </div>
        </div>
    )
})

EmployeeRegisterFormPage.displayName = "EmployeeRegisterFormPage"

export {EmployeeRegisterFormPage}
export type {EmployeeRegisterFormProps}