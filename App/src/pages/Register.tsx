import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Link2Icon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/services/axiosInstance";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { Spinner } from "@/components/ui/spinner";

type RegisterInputs = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

const schema = zod
  .object({
    firstName: zod.string().trim().min(1, "First Name is required").max(64),
    lastName: zod.string().trim().min(1, "Last Name is required").max(64),
    phone: zod
      .string()
      .trim()
      .min(10, "Phone number must be 10 digits")
      .max(10),
    email: zod.string().trim().email("Invalid email address"),
    password: zod
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: zod
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters"),
    terms: zod.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const passwordStrengthMap = {
  0: "Weak",
  1: "Medium",
  2: "Strong",
  3: "Very Strong",
};

const colorMap = {
  0: "bg-red-500",
  1: "bg-orange-500",
  2: "bg-yellow-500",
  3: "bg-green-500",
};

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { mutate, isPending, isIdle, isError, error } = useMutation({
    mutationFn: (data: RegisterInputs) =>
      axiosInstance
        .post("/auth/register", {
          user: {
            email: data.email,
            password: data.password,
          },
          user_profile: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
          },
        })
        .then((r) => r.data),
    onSuccess: (responseData) => {
      toast.success("Account created Succesfully!");
      navigate("/login");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data.message || "Registration failed");
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(schema),
  });

  const password = watch("password");

  const getStrength = (pwd: string) => {
    if (!pwd) return 0;

    let matches = 0;

    // Check length > 8
    if (pwd.length > 8) matches++;

    // Check for at least one number
    if (/\d/.test(pwd)) matches++;

    // Check for at least one symbol
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) matches++;

    // Check for at least one capital letter
    if (/[A-Z]/.test(pwd)) matches++;

    // Return strength based on matches
    if (matches <= 1) return 0;
    if (matches === 2) return 1;
    if (matches === 3) return 2;
    return 3;
  };

  const strength = getStrength(password);

  const onSubmit: SubmitHandler<RegisterInputs> = (data) => mutate(data);

  return (
    <section className="bg-[#f6f6f6] w-full h-full rounded-r-lg p-8">
      <h1 className="md:hidden font-bold text-4xl text-gray-300">
        Shop<span className="font-bold text-4xl text-indigo-400">Core</span>
      </h1>
      <h2 className="text-2xl font-semibold mt-4">Create your account</h2>
      <p className="text-gray-700">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600">
          Sign in
        </Link>
      </p>
      <form noValidate className="mt-4" onSubmit={handleSubmit(onSubmit)}>
        <FieldSet>
          <FieldGroup>
            <div className="grid md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="firstName"
                  required
                  {...register("firstName")}
                  placeholder="Enter First Name"
                  className="rounded-sm"
                />
                <FieldDescription className="text-destructive">
                  {errors.firstName?.message}
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="lastName"
                  required
                  {...register("lastName")}
                  placeholder="Enter Last Name"
                  className="rounded-sm"
                />
                <FieldDescription className="text-destructive">
                  {errors.lastName?.message}
                </FieldDescription>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="phone">
                Contact No. <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="phone"
                required
                {...register("phone")}
                placeholder="Enter Contact No"
                className="rounded-sm"
              />
              <FieldDescription className="text-destructive">
                {errors.phone?.message}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">
                Email <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="email"
                required
                {...register("email")}
                placeholder="Enter Email"
                className="rounded-sm"
              />
              <FieldDescription className="text-destructive">
                {errors.email?.message}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">
                Password <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  required
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter password"
                  className="rounded-sm"
                />
                {showPassword ? (
                  <EyeOff
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                ) : (
                  <Eye
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                )}
              </div>
              <Field>
                <div className="grid grid-cols-4 gap-1">
                  <div
                    className={`h-2 rounded-sm transition-colors ${
                      password && strength >= 0
                        ? colorMap[strength]
                        : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`h-2 rounded-sm transition-colors ${
                      password && strength >= 1
                        ? colorMap[strength]
                        : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`h-2 rounded-sm transition-colors ${
                      password && strength >= 2
                        ? colorMap[strength]
                        : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`h-2 rounded-sm transition-colors ${
                      password && strength >= 3
                        ? colorMap[strength]
                        : "bg-gray-200"
                    }`}
                  />
                </div>
                <FieldLabel>
                  Password Strength:{" "}
                  {password && passwordStrengthMap[strength || 0]}
                </FieldLabel>
              </Field>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm password <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="confirmPassword"
                required
                type="password"
                {...register("confirmPassword")}
                placeholder="Enter password again"
                className="rounded-sm"
              />
            </Field>
            <FieldGroup>
              <Field orientation="horizontal">
                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="terms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <FieldLabel htmlFor="terms">
                  I agree to the terms and conditions
                </FieldLabel>
              </Field>
              <FieldDescription className="text-destructive">
                {errors.terms?.message}
              </FieldDescription>
            </FieldGroup>
            <Button
              variant="outline"
              className="cursor-pointer rounded-sm"
              type="submit"
              disabled={isPending}
            >
              {isPending ? <Spinner /> : "Create Account"}
            </Button>
            <Separator />
            <Button disabled={isPending} className="cursor-pointer rounded-sm">
              <Link2Icon /> Continue With Google
            </Button>
          </FieldGroup>
        </FieldSet>
      </form>
    </section>
  );
};

export default Register;
