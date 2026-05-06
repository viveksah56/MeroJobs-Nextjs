"use client"

import * as React from "react"
import {memo, useActionState, useCallback, useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Loader2, UserPlus, X} from "lucide-react"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {AccountStatus} from "@/models/enum/account-status.enum"
import {PasswordInputField} from "@/components/form-field/password-input"
import {TextInputField} from "@/components/form-field/text-input"
import {type EmployeeRegisterForm, employeeRegisterSchema, useEmployeeStore} from "@/models/employee/employee.model"
import SelectInputField from "@/components/form-field/select-input"

const statusOptions = Object.values(AccountStatus).map((s) => ({label: s, value: s}))

type FormState = {success: boolean; message: string | null}
const initialState: FormState = {success: false, message: null}

interface EmployeeRegisterFormProps {
    onSuccess?: () => void
    className?: string
}

function SectionLabel({children}: {children: React.ReactNode}) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60 whitespace-nowrap">
                {children}
            </span>
            <div className="h-px flex-1 bg-border/60" />
        </div>
    )
}

interface ProfileImageUploadProps {
    value?: File
    onChange: (f: File | undefined) => void
    error?: string
    disabled?: boolean
}

function ProfileImageUpload({value, onChange, error, disabled}: ProfileImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        if (!value) {setPreview(null); return}
        const url = URL.createObjectURL(value)
        setPreview(url)
        return () => URL.revokeObjectURL(url)
    }, [value])

    const handleFile = useCallback((file: File | null) => {
        if (!file || !file.type.startsWith("image/")) return
        onChange(file)
    }, [onChange])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        handleFile(e.dataTransfer.files[0] ?? null)
    }, [handleFile])

    const handleClear = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(undefined)
        if (inputRef.current) inputRef.current.value = ""
    }, [onChange])

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className={cn(
                        "relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed transition-all duration-200 overflow-hidden",
                        "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
                        disabled && "cursor-not-allowed opacity-50",
                        !disabled && "cursor-pointer",
                        error && "border-destructive/60"
                    )}
                >
                    {preview ? (
                        <img src={preview} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <UserPlus className="h-7 w-7 text-muted-foreground/50" strokeWidth={1.5} />
                    )}
                </button>

                {preview && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-opacity hover:opacity-90"
                        aria-label="Remove profile picture"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                disabled={disabled}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />

            <div className="text-center">
                <p className="text-xs font-medium text-foreground">
                    {preview ? value?.name ?? "Image selected" : (
                        <>Drop or <span className="text-primary underline underline-offset-2 cursor-pointer" onClick={() => inputRef.current?.click()}>browse</span></>
                    )}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WEBP · max 10MB</p>
            </div>

            {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
        </div>
    )
}

const EmployeeRegisterFormPage = memo(function EmployeeRegisterFormPage({onSuccess, className}: EmployeeRegisterFormProps) {
    const setEmployee = useEmployeeStore((s) => s.setEmployee)

    const {register, handleSubmit, formState: {errors}, setValue, watch} = useForm<EmployeeRegisterForm>({
        resolver: zodResolver(employeeRegisterSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            phone: "",
            bio: "",
            companyName: "",
            jobTitle: "",
            department: "",
            workLocation: "",
            salary: 0,
            status: AccountStatus.ACTIVE,
        },
        mode: "onTouched",
    })

    const watchStatus = watch("status")
    const watchProfilePicture = watch("profilePicture")

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

    const handleStatusChange = useCallback((status: AccountStatus) => {
        setValue("status", status, {shouldValidate: true})
    }, [setValue])

    const handleProfilePictureChange = useCallback((file: File | undefined) => {
        setValue("profilePicture", file, {shouldValidate: true})
    }, [setValue])

    return (
        <div className={cn("flex min-h-screen w-full items-start justify-center bg-background px-4 py-12 sm:px-6 lg:px-8", className)}>
            <div className="w-full max-w-2xl space-y-8">

                <header className="space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                        <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Register Employee
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Fill in the details to create a new employee account
                    </p>
                </header>

                {state.message && !state.success && (
                    <p className="rounded-md bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
                        {state.message}
                    </p>
                )}

                <div className="rounded-xl border border-border bg-card shadow-sm">
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 sm:p-8 space-y-6">

                        <div>
                            <SectionLabel>Profile picture</SectionLabel>
                            <ProfileImageUpload
                                value={watchProfilePicture}
                                onChange={handleProfilePictureChange}
                                error={errors.profilePicture?.message}
                                disabled={isPending}
                            />
                        </div>

                        <div>
                            <SectionLabel>Personal info</SectionLabel>
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <TextInputField
                                        {...register("firstName")}
                                        label="First name"
                                        autoFocus
                                        required
                                        disabled={isPending}
                                        placeholder="Jane"
                                        error={errors.firstName?.message}
                                    />
                                    <TextInputField
                                        {...register("lastName")}
                                        label="Last name"
                                        required
                                        disabled={isPending}
                                        placeholder="Doe"
                                        error={errors.lastName?.message}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <TextInputField
                                        {...register("email")}
                                        label="Email address"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        disabled={isPending}
                                        placeholder="you@company.com"
                                        error={errors.email?.message}
                                    />
                                    <TextInputField
                                        {...register("phone")}
                                        label="Phone"
                                        type="tel"
                                        disabled={isPending}
                                        placeholder="+1 555 000 0000"
                                        error={errors.phone?.message}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <SectionLabel>Security</SectionLabel>
                            <PasswordInputField
                                {...register("password")}
                                label="Password"
                                required
                                disabled={isPending}
                                autoComplete="new-password"
                                placeholder="••••••••"
                                error={errors.password?.message}
                            />
                        </div>

                        <div>
                            <SectionLabel>Work details</SectionLabel>
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <TextInputField
                                        {...register("companyName")}
                                        label="Company name"
                                        required
                                        disabled={isPending}
                                        placeholder="Acme Corp"
                                        error={errors.companyName?.message}
                                    />
                                    <TextInputField
                                        {...register("jobTitle")}
                                        label="Job title"
                                        required
                                        disabled={isPending}
                                        placeholder="Software Engineer"
                                        error={errors.jobTitle?.message}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <TextInputField
                                        {...register("department")}
                                        label="Department"
                                        disabled={isPending}
                                        placeholder="Engineering"
                                        error={errors.department?.message}
                                    />
                                    <TextInputField
                                        {...register("workLocation")}
                                        label="Work location"
                                        disabled={isPending}
                                        placeholder="Remote / New York"
                                        error={errors.workLocation?.message}
                                    />
                                </div>
                                <TextInputField
                                    {...register("salary", {valueAsNumber: true})}
                                    label="Salary"
                                    type="number"
                                    required
                                    disabled={isPending}
                                    placeholder="60000"
                                    error={errors.salary?.message}
                                />
                            </div>
                        </div>

                        <div>
                            <SectionLabel>Profile</SectionLabel>
                            <div className="space-y-5">
                                <TextInputField
                                    {...register("bio")}
                                    label="Bio"
                                    textarea
                                    disabled={isPending}
                                    placeholder="Short bio..."
                                    error={errors.bio?.message}
                                />
                                <SelectInputField
                                    options={statusOptions}
                                    label="Account status"
                                    placeholder="Select status"
                                    required
                                    disabled={isPending}
                                    value={watchStatus}
                                    onValueChange={handleStatusChange}
                                    error={errors.status?.message}
                                />
                            </div>
                        </div>

                        <div className="pt-1">
                            <Button type="submit" disabled={isPending} className="w-full">
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span>Registering…</span>
                                    </>
                                ) : (
                                    "Register employee"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    <a
                        href="mailto:support@company.com"
                        className="rounded-sm underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
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