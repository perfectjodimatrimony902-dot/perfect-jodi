import { z } from "zod";

export function fieldErrors<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { data?: T; errors: Record<string, string> } {
  const r = schema.safeParse(data);
  if (r.success) return { data: r.data, errors: {} };
  const errors: Record<string, string> = {};
  for (const issue of r.error.issues) {
    const key = issue.path.join(".");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { errors };
}

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .max(255);
export const mobileSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password is too long")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: emailSchema,
  phone: z.union([z.literal(""), mobileSchema]),
  subject: z.string().trim().min(3, "Please add a subject").max(150),
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters")
    .max(2000, "Message is too long"),
});

export const storySchema = z.object({
  couple: z.string().trim().min(3, "Enter both names, e.g. Rahul & Nisha").max(80),
  city: z.string().trim().min(2, "Enter a city").max(60),
  marriedOn: z.string().min(1, "Choose your wedding date"),
  story: z.string().trim().min(30, "Please write at least 30 characters").max(1500),
});

/** Legal minimum marriage age in India: 18 for brides, 21 for grooms. */
export function minimumAge(gender: "female" | "male") {
  return gender === "female" ? 18 : 21;
}

export function makeRegisterSchema(now: Date = new Date()) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(3, "Enter the full name")
        .max(80)
        .regex(/^[A-Za-z .']+$/, "Use letters only"),
      gender: z.enum(["female", "male"], { errorMap: () => ({ message: "Select a gender" }) }),
      dob: z.string().min(1, "Date of birth is required"),
      email: emailSchema,
      mobile: mobileSchema,
      password: passwordSchema,
      confirm: z.string(),
      createdBy: z.enum(["Self", "Parent", "Sibling", "Relative"], {
        errorMap: () => ({ message: "Select who is creating this profile" }),
      }),
      terms: z.literal(true, {
        errorMap: () => ({ message: "Please accept the terms to continue" }),
      }),
    })
    .superRefine((v, ctx) => {
      if (v.password !== v.confirm)
        ctx.addIssue({ code: "custom", path: ["confirm"], message: "Passwords don't match" });
      const d = new Date(v.dob);
      if (v.dob && !Number.isNaN(d.getTime()) && v.gender) {
        let age = now.getFullYear() - d.getFullYear();
        const m = now.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
        const min = minimumAge(v.gender);
        if (age < min)
          ctx.addIssue({
            code: "custom",
            path: ["dob"],
            message: `Must be at least ${min} years old`,
          });
        if (age > 75)
          ctx.addIssue({
            code: "custom",
            path: ["dob"],
            message: "Please check the date of birth",
          });
      }
    });
}
