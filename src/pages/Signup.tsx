import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import {
  buildSignupBody,
  extractDisplayNameFromAuthResponse,
  getApiErrorMessage,
  signupRequest,
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

const signupSchema = z
  .object({
    fullName: z.string().min(1, "Name is required").max(120),
    portal: z.enum(["internal", "carrier", "customer", "partner"]),
    role: z.string(),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
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
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const { toast } = useToast();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/";

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      portal: "internal",
      role: defaultRoleForPortal("internal"),
      email: "",
      password: "",
      confirmPassword: "",
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

  async function onSubmit(data: SignupForm) {
    const email = data.email.trim();
    try {
      const body = buildSignupBody({
        fullName: data.fullName,
        portal: data.portal,
        role: data.role as UserRole,
        email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      const { data: res, accessToken } = await signupRequest(body);
      const displayName =
        data.fullName.trim() || extractDisplayNameFromAuthResponse(res, email);

      if (accessToken) {
        login({
          portal: data.portal,
          role: data.role as UserRole,
          email,
          displayName,
          accessToken,
        });
        navigate(from, { replace: true });
        return;
      }

      toast({
        title: "Account created",
        description: "You can sign in with your email and password.",
      });
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = getApiErrorMessage(err);
      if (/exist|already|duplicate|taken/i.test(msg)) {
        form.setError("email", {
          type: "manual",
          message: "An account with this email may already exist. Try signing in.",
        });
      }
      toast({
        title: "Could not create account",
        description: msg,
        variant: "destructive",
      });
    }
  }

  return (
    <AuthPageShell
      asideCopy="Create your account with the portal and role that match your organization. You can sign in
anytime from the same login page."
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="space-y-1 lg:hidden">
          <h2 className="text-xl font-semibold text-foreground">Create account</h2>
          <p className="text-sm text-muted-foreground">
            Tell us who you are, then choose a password.
          </p>
        </div>

        <Card className="border border-border/80 shadow-elevated bg-gradient-card overflow-hidden">
          <CardHeader className="space-y-1 pb-4 hidden lg:block">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Create account</CardTitle>
            <CardDescription className="text-base">
              Tell us who you are, then choose a password. Same portals and roles as sign in.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 lg:pt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="name"
                          placeholder="Jane Smith"
                          className="bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      <FormLabel>Password</FormLabel>
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
                      <FormLabel>Confirm password</FormLabel>
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
                  <UserPlus className="h-4 w-4" />
                  Create account
                </Button>
              </form>
            </Form>
            <p className="text-xs text-muted-foreground text-center mt-5 leading-relaxed">
              Registration uses your API (<code className="text-[10px]">VITE_API_BASE_URL</code>). If the server
              returns a token, you will be signed in automatically.
            </p>
            <p className="text-sm text-center text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </AuthPageShell>
  );
}
