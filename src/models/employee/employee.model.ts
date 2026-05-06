import {create} from "zustand"
import {z} from "zod"
import {AccountStatus} from "@/models/enum/account-status.enum"

export const employeeRegisterSchema = z.object({
    firstName: z.string().min(2, {message: "First name must be at least 2 characters"}),
    lastName: z.string().min(1, {message: "Last name is required"}),
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(8, {message: "Password must be at least 8 characters"}),
    phone: z.string().optional(),
    profilePicture: z.instanceof(File, {message: "Profile picture must be a file"}).optional(),
    bio: z.string().optional(),
    status: z.nativeEnum(AccountStatus, {message: "Invalid account status"}),
    companyName: z.string().min(1, {message: "Company name is required"}),
    jobTitle: z.string().min(1, {message: "Job title is required"}),
    department: z.string().optional(),
    workLocation: z.string().optional(),
    salary: z.number().positive({message: "Salary must be greater than 0"}),
    image: z.instanceof(File, {message: "Image must be a file"}).optional(),
})

export const employeeUpdateSchema = employeeRegisterSchema.partial()

export type EmployeeRegisterForm = z.infer<typeof employeeRegisterSchema>
export type EmployeeUpdateForm = z.infer<typeof employeeUpdateSchema>

interface EmployeeState {
    employee: Partial<EmployeeRegisterForm>
    setEmployee: (data: Partial<EmployeeRegisterForm>) => void
    resetEmployee: () => void
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
    employee: {},
    setEmployee: (data) =>
        set((state) => ({
            employee: {...state.employee, ...data},
        })),
    resetEmployee: () => set({employee: {}}),
}))