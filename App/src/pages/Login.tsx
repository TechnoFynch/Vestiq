import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Link2Icon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import zod from "zod";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { axiosInstance } from "@/services/axiosInstance";
import apiEndpoints from "@/constants/apiEndpoints";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/redux";
import { setToken } from "@/features/slices/authSlice";
import appRoutes from "@/constants/appRoutes";

type LoginInputs = {
  email: string;
  password: string;
};

const schema = zod
  .object({
    email: zod.string().trim().email("Invalid email address"),
    password: zod
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters"),
  })
  .required();

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    resetField,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(schema),
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (data: LoginInputs) => {
      try {
        const r = await axiosInstance.post(apiEndpoints.login, {
          email: data.email,
          password: data.password,
        });
        return r.data;
      } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>;
        throw new Error(
          axiosError.response?.data?.message ?? axiosError.message,
        );
      }
    },
    onSuccess: (responseData) => {
      dispatch(
        setToken({
          token: responseData.accessToken,
          name: responseData.user.name,
          role: responseData.user.role,
        }),
      );
      toast.success(`Welcome back ${responseData.user.name}!`);
      navigate(appRoutes.user.home);
    },
    onError: (err: AxiosError<{ message: string }>) => {
      resetField("password");
    },
  });

  const onSubmit: SubmitHandler<LoginInputs> = (data) => mutate(data);

  return (
    <section className="bg-[#f6f6f6] w-full h-full rounded-r-lg p-8">
      <h1 className="md:hidden font-bold text-4xl text-gray-300">
        Shop<span className="font-bold text-4xl text-amber-400">Co</span>
      </h1>
      <h2 className="text-2xl font-semibold mt-4">Login</h2>
      <p className="text-gray-700">
        Don&apos;t have an account{" "}
        <Link to={appRoutes.user.register} className="text-blue-600">
          Sign up
        </Link>
      </p>
      {isError && (
        <p className="text-destructive mt-4 text-center">{error.message}</p>
      )}
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-2">
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">
                Email <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter email"
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
              <FieldDescription className="text-destructive">
                {errors.password?.message}
              </FieldDescription>
            </Field>
          </FieldGroup>
          <Button
            variant="outline"
            className="cursor-pointer rounded-sm"
            type="submit"
          >
            Log In
          </Button>
          <Separator />
          <Button className="cursor-pointer rounded-sm">
            <Link2Icon /> Continue With Google
          </Button>
        </FieldSet>
      </form>
    </section>
  );
};

export default Login;
