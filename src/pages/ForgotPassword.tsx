import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
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
import { createPasswordResetToken } from "@/auth/passwordReset";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [done, setDone] = useState(false);
  const [resetPath, setResetPath] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  function onSubmit(data: FormValues) {
    const token = createPasswordResetToken(data.email);
    setResetPath(`/reset-password?token=${encodeURIComponent(token)}`);
    setDone(true);
  }

  return (
    <AuthPageShell
      asideCopy="If you forgot your password, enter your email and we’ll guide you through setting a new one.
In production this step sends a secure link by email."
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="space-y-1 lg:hidden">
          <h2 className="text-xl font-semibold text-foreground">Forgot password</h2>
          <p className="text-sm text-muted-foreground">
            {done ? "Check the next step to choose a new password." : "We’ll send reset instructions to your email."}
          </p>
        </div>

        <Card className="border border-border/80 shadow-elevated bg-gradient-card overflow-hidden">
          {!done ? (
            <>
              <CardHeader className="space-y-1 pb-4 hidden lg:block">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Forgot password
                </CardTitle>
                <CardDescription className="text-base">
                  Enter the email you use to sign in. We never show whether an address exists in the system—same
                  message for everyone.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 lg:pt-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              autoComplete="email"
                              placeholder="you@company.com"
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
                      <Mail className="h-4 w-4" />
                      Send reset link
                    </Button>
                  </form>
                </Form>
                <p className="text-xs text-muted-foreground text-center mt-5 leading-relaxed">
                  Demo: no email is sent. You’ll open the reset page on this device only.
                </p>
                <p className="text-sm text-center text-muted-foreground mt-4">
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Back to sign in
                  </Link>
                </p>
              </CardContent>
            </>
          ) : (
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Check your next step</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    In production you’d receive an email with a link. Here, continue on this device to set a new
                    password.
                  </p>
                </div>
                {resetPath && (
                  <Button asChild size="lg" className="w-full rounded-lg bg-gradient-primary text-primary-foreground">
                    <Link to={resetPath}>
                      Set new password
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <p className="text-sm text-center text-muted-foreground pt-2">
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Back to sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </AuthPageShell>
  );
}
