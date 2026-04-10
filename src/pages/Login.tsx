import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import {
  buildLoginBody,
  extractDisplayNameFromAuthResponse,
  getApiErrorMessage,
  loginRequest,
} from "@/auth/authApi";
import {
  PORTAL_LABELS,
  ROLE_LABELS,
  ROLES_BY_PORTAL,
  defaultRoleForPortal,
} from "@/auth/config";
import type { LoginPortal, UserRole } from "@/auth/types";
import { useToast } from "@/hooks/use-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

const loginSchema = z
  .object({
    portal: z.enum(["internal", "carrier", "customer", "partner"]),
    role: z.string(),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
  })
  .superRefine((data, ctx) => {
    const allowed = ROLES_BY_PORTAL[data.portal];
    if (!allowed.includes(data.role as UserRole)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pick a role that matches this login type.",
        path: ["role"],
      });
    }
  });

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/";

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      portal: "internal",
      role: defaultRoleForPortal("internal"),
      email: "",
      password: "",
    },
  });

  const portal = form.watch("portal");

  const roleOptions = useMemo(() => ROLES_BY_PORTAL[portal], [portal]);

  useEffect(() => {
    const allowed = ROLES_BY_PORTAL[portal];
    const current = form.getValues("role");
    if (!allowed.includes(current)) {
      form.setValue("role", allowed[0]);
    }
  }, [portal, form]);

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  async function onSubmit(data: LoginForm) {
    try {
      const body = buildLoginBody({
        portal: data.portal,
        role: data.role as UserRole,
        email: data.email.trim(),
        password: data.password,
      });
      const { data: res, accessToken } = await loginRequest(body);
      const email = data.email.trim();
      const displayName = extractDisplayNameFromAuthResponse(res, email);
      login({
        portal: data.portal,
        role: data.role as UserRole,
        email,
        displayName,
        accessToken,
      });
      navigate(from, { replace: true });
    } catch (err) {
      toast({
        title: "Sign in failed",
        description: getApiErrorMessage(err),
        variant: "destructive",
      });
    }
  }

  return (
    <AuthPageShell
      asideCopy="Sign in with the portal and role that match how you use the platform—operations, carrier,
customer, or partner."
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="space-y-1 lg:hidden">
          <h2 className="text-xl font-semibold text-foreground">Sign in</h2>
          <p className="text-sm text-muted-foreground">
            Choose your portal and role, then enter your credentials.
          </p>
        </div>

        <Card className="border border-border/80 shadow-elevated bg-gradient-card overflow-hidden">
          <CardHeader className="space-y-1 pb-4 hidden lg:block">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Sign in</CardTitle>
            <CardDescription className="text-base">
              Choose your portal and role, then enter your credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 lg:pt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="portal"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Login type</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(v as LoginPortal)}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select login type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Object.keys(PORTAL_LABELS) as LoginPortal[]).map((key) => (
                              <SelectItem key={key} value={key}>
                                {PORTAL_LABELS[key]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(v as UserRole)}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roleOptions.map((r) => (
                              <SelectItem key={r} value={r}>
                                {ROLE_LABELS[r]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="bg-border/80" />

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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-2">
                        <FormLabel>Password</FormLabel>
                        <Link
                          to="/forgot-password"
                          className="text-xs font-medium text-primary hover:underline shrink-0"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
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
                  <LogIn className="h-4 w-4" />
                  Continue
                </Button>
              </form>
            </Form>
            <p className="text-xs text-muted-foreground text-center mt-5 leading-relaxed">
              Credentials are sent to your configured API (<code className="text-[10px]">VITE_API_BASE_URL</code>).
            </p>
            <p className="text-sm text-center text-muted-foreground mt-4">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </AuthPageShell>
  );
}
