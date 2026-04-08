import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link2Icon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link } from "react-router";
import zod from "zod";

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
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<LoginInputs> = (data) => console.log(data);

  return (
    <section className="bg-[#f6f6f6] w-full h-full rounded-r-lg p-8">
      <h1 className="md:hidden font-bold text-4xl text-gray-300">
        Shop<span className="font-bold text-4xl text-indigo-400">Core</span>
      </h1>
      <h2 className="text-2xl font-semibold mt-4">Login</h2>
      <p className="text-gray-700">
        Don&apos;t have an account{" "}
        <Link to="/register" className="text-blue-600">
          Sign up
        </Link>
      </p>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-4">
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
            </Field>
            <Field>
              <FieldLabel htmlFor="password">
                Password <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Enter password"
                className="rounded-sm"
              />
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
