import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useRegister } from "@/hooks/useAuth";
import { Input, Button, Card } from "@/components";
import { ROUTES, ROLES } from "@/constants/appConstants";
import { Icon } from "@/components/Icon";

function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { role: ROLES.PATIENT },
  });
  const { mutate: registerUser, isLoading } = useRegister();

  const onSubmit = (data) => {
    registerUser(data);
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon name="faHeartPulse" className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Create Account
          </h2>
          <p className="mt-2 text-slate-500">
            Join MediCore to manage your appointments
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Full Name"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register("name", { required: "Name is required" })}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
            })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Register"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to={ROUTES.login}
            className="font-semibold text-primary hover:underline"
          >
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default RegisterPage;
