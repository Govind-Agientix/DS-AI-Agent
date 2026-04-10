import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { clearPasswordResetToken, readPasswordResetToken } from "@/auth/passwordReset";

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const tokenPayload = useMemo(() => readPasswordResetToken(token), [token]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function onSubmit(_data: FormValues) {
    if (!token) return;
    clearPasswordResetToken(token);
    toast.success("Password updated", {
      description: "You can sign in with your new password when your backend is connected.",
    });
    navigate("/login", { replace: true });
  }

  const invalid = !token || !tokenPayload;

  return (
    <AuthPageShell
      asideCopy="Choose a strong new password. Your session will use it once your API is wired up—in demo mode
sign-in still accepts any password."
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="space-y-1 lg:hidden">
          <h2 className="text-xl font-semibold text-foreground">
            {invalid ? "Link invalid" : "Set new password"}
          </h2>
        </div>

        <Card className="border border-border/80 shadow-elevated bg-gradient-card overflow-hidden">
          {invalid ? (
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This reset link is missing, expired, or was already used. Request a new one from the forgot
                  password page.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/forgot-password">Forgot password</Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Back to sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="space-y-1 pb-4 hidden lg:block">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Set new password
                </CardTitle>
                <CardDescription className="text-base">
                  Account: <span className="font-medium text-foreground">{tokenPayload.email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 lg:pt-2">
                <p className="text-sm text-muted-foreground mb-4 lg:hidden">
                  {tokenPayload.email}
                </p>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              autoComplete="new-password"
                              className="bg-background"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm new password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              autoComplete="new-password"
                              className="bg-background"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-card hover:opacity-90 transition-opacity"
                    >
                      <KeyRound className="h-4 w-4" />
                      Update password
                    </Button>
                  </form>
                </Form>
                <p className="text-xs text-muted-foreground text-center mt-5 leading-relaxed">
                  Demo does not persist passwords. Connect your auth API to enforce real password rules.
                </p>
                <p className="text-sm text-center text-muted-foreground mt-4">
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Back to sign in
                  </Link>
                </p>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </AuthPageShell>
  );
}
