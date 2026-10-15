import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, HeartHandshake, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm, type FieldValues, type Path, type UseFormRegister } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { Brand } from "../components/Brand";
import { api, getApiErrorMessage } from "../services/api";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().max(30).optional(),
  password: z.string()
    .min(8, "Use at least 8 characters.")
    .regex(/[a-z]/, "Add a lowercase letter.")
    .regex(/[A-Z]/, "Add an uppercase letter.")
    .regex(/[0-9]/, "Add a number."),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(Boolean, "Accept the terms to continue."),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const emailSchema = z.object({ email: z.string().trim().email("Enter a valid email address.") });

const resetSchema = z.object({
  password: z.string().min(8, "Use at least 8 characters.")
    .regex(/[a-z]/, "Add a lowercase letter.")
    .regex(/[A-Z]/, "Add an uppercase letter.")
    .regex(/[0-9]/, "Add a number."),
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type EmailValues = z.infer<typeof emailSchema>;
type ResetValues = z.infer<typeof resetSchema>;

function AuthLayout({ title, subtitle, children, footer }: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="auth-page">
      <a className="skip-link" href="#auth-form">Skip to form</a>
      <section className="auth-visual" aria-label="CareConnect 360 support">
        <img
          src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85"
          alt="Support colleagues collaborating in a bright office"
        />
        <div className="auth-visual-shade" />
        <div className="auth-visual-content">
          <Brand light />
          <div className="auth-visual-message">
            <span className="auth-visual-symbol"><HeartHandshake size={24} /></span>
            <p className="eyebrow eyebrow-light">Care, made connected</p>
            <h1>Good support starts with being heard.</h1>
            <p>Keep your conversations, updates, and next steps together in one place.</p>
          </div>
          <span className="auth-visual-caption">Every Complaint Matters. Every Customer Deserves Care.</span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-top"><Brand /><Link to="/" className="back-home"><ArrowLeft size={16} /> Home</Link></div>
        <div className="auth-form-wrap" id="auth-form">
          <div className="auth-heading"><span className="auth-lock"><LockKeyhole size={19} /></span><p className="eyebrow">Your CareConnect account</p><h2>{title}</h2><p>{subtitle}</p></div>
          {children}
          {footer && <div className="auth-form-footer">{footer}</div>}
        </div>
        <p className="auth-privacy-note"><LockKeyhole size={13} /> Your account connection will use a secure server session.</p>
      </section>
    </main>
  );
}

function FieldError({ children }: { children?: string }) {
  return children ? <span className="field-error" role="alert">{children}</span> : null;
}

function PasswordField<TValues extends FieldValues>({ label, name, register, error, autoComplete }: {
  label: string;
  name: Path<TValues>;
  register: UseFormRegister<TValues>;
  error?: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <div className={`password-input${error ? " input-invalid" : ""}`}>
        <input id={name} type={visible ? "text" : "password"} autoComplete={autoComplete} {...register(name)} aria-invalid={Boolean(error)} />
        <button className="password-toggle" type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Hide password" : "Show password"} title={visible ? "Hide password" : "Show password"}>
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      <FieldError>{error}</FieldError>
    </div>
  );
}

function FormNotice({ message, success = false }: { message: string; success?: boolean }) {
  if (!message) return null;
  return <div className={`form-notice${success ? " notice-success" : ""}`} role="status" aria-live="polite">{message}</div>;
}

export function LoginPage() {
  const [notice, setNotice] = useState("");
  const [noticeSuccess, setNoticeSuccess] = useState(false);
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", rememberMe: false } });

  const onSubmit = form.handleSubmit(async (values) => {
    setNotice("");
    setNoticeSuccess(false);
    try {
      await api.post("/auth/login", values);
      setNoticeSuccess(true);
      setNotice("Signed in. The customer workspace will be available in a later stage.");
    } catch (error) {
      setNotice(getApiErrorMessage(error));
    }
  });

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to follow your support conversations and updates." footer={<>New to CareConnect? <Link to="/register">Create an account</Link></>}>
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="form-field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...form.register("email")} aria-invalid={Boolean(form.formState.errors.email)} /><FieldError>{form.formState.errors.email?.message}</FieldError></div>
        <PasswordField label="Password" name="password" register={form.register} error={form.formState.errors.password?.message} autoComplete="current-password" />
        <div className="form-options"><label className="checkbox-label"><input type="checkbox" {...form.register("rememberMe")} /> <span>Keep me signed in</span></label><Link to="/forgot-password">Forgot password?</Link></div>
        <FormNotice message={notice} success={noticeSuccess} />
        <button className="button button-primary auth-submit" type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Signing in..." : "Sign in"}<ArrowLeft className="submit-arrow" size={17} /></button>
        <p className="auth-demo-note">Your session uses an HTTP-only cookie. Keep this service running while you use the account.</p>
      </form>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const [notice, setNotice] = useState("");
  const [noticeSuccess, setNoticeSuccess] = useState(false);
  const form = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "", termsAccepted: false } });

  const onSubmit = form.handleSubmit(async ({ confirmPassword: _confirmPassword, ...values }) => {
    setNotice("");
    setNoticeSuccess(false);
    try {
      await api.post("/auth/register", values);
      setNoticeSuccess(true);
      setNotice("Account created. You are signed in; the customer workspace will be added in a later stage.");
    } catch (error) {
      setNotice(getApiErrorMessage(error));
    }
  });

  return (
    <AuthLayout title="Create your account" subtitle="Start a conversation with a team that keeps you in the loop." footer={<>Already have an account? <Link to="/login">Sign in</Link></>}>
      <form className="auth-form auth-form-register" onSubmit={onSubmit} noValidate>
        <div className="form-field"><label htmlFor="name">Full name</label><input id="name" autoComplete="name" placeholder="Your name" {...form.register("name")} aria-invalid={Boolean(form.formState.errors.name)} /><FieldError>{form.formState.errors.name?.message}</FieldError></div>
        <div className="form-field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...form.register("email")} aria-invalid={Boolean(form.formState.errors.email)} /><FieldError>{form.formState.errors.email?.message}</FieldError></div>
        <div className="form-field"><label htmlFor="phone">Phone <span className="optional-label">Optional</span></label><input id="phone" type="tel" autoComplete="tel" placeholder="For support updates" {...form.register("phone")} /><FieldError>{form.formState.errors.phone?.message}</FieldError></div>
        <PasswordField label="Password" name="password" register={form.register} error={form.formState.errors.password?.message} autoComplete="new-password" />
        <PasswordField label="Confirm password" name="confirmPassword" register={form.register} error={form.formState.errors.confirmPassword?.message} autoComplete="new-password" />
        <FieldError>{form.formState.errors.root?.message}</FieldError>
        <label className="checkbox-label terms-label"><input type="checkbox" {...form.register("termsAccepted")} aria-invalid={Boolean(form.formState.errors.termsAccepted)} /><span>I agree to the terms and privacy notice.</span></label>
        <FieldError>{form.formState.errors.termsAccepted?.message}</FieldError>
        <FormNotice message={notice} success={noticeSuccess} />
        <button className="button button-primary auth-submit" type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creating account..." : "Create customer account"}<ArrowLeft className="submit-arrow" size={17} /></button>
        <p className="auth-demo-note">Public registration creates customer accounts only. Account creation is not connected until the API is implemented.</p>
      </form>
    </AuthLayout>
  );
}

export function ForgotPasswordPage() {
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const form = useForm<EmailValues>({ resolver: zodResolver(emailSchema), defaultValues: { email: "" } });

  const onSubmit = form.handleSubmit(async (values) => {
    setNotice("");
    setSuccess(false);
    setPreviewUrl("");
    try {
      const response = await api.post<{ message: string; developmentPreviewUrl?: string }>("/auth/forgot-password", values);
      setSuccess(true);
      setNotice(response.data.message);
      setPreviewUrl(response.data.developmentPreviewUrl ?? "");
    } catch (error) {
      setNotice(getApiErrorMessage(error));
    }
  });

  return (
    <AuthLayout title="Reset your password" subtitle="Enter the email linked to your account. We will only confirm the same message whether or not an account exists." footer={<>Remembered it? <Link to="/login">Back to sign in</Link></>}>
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="form-field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...form.register("email")} aria-invalid={Boolean(form.formState.errors.email)} /><FieldError>{form.formState.errors.email?.message}</FieldError></div>
        <FormNotice message={notice} success={success} />
        {previewUrl && <a className="reset-preview-link" href={previewUrl}>Open development reset link <ArrowLeft size={14} /></a>}
        <button className="button button-primary auth-submit" type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Sending..." : "Send reset instructions"}<ArrowLeft className="submit-arrow" size={17} /></button>
        <p className="auth-demo-note">Development returns a local reset link. Production email delivery is not configured yet.</p>
      </form>
    </AuthLayout>
  );
}

export function ResetPasswordPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");
  const form = useForm<ResetValues>({ resolver: zodResolver(resetSchema), defaultValues: { password: "", confirmPassword: "" } });

  const onSubmit = form.handleSubmit(async ({ confirmPassword: _confirmPassword, ...values }) => {
    setNotice("");
    try {
      await api.post("/auth/reset-password", { ...values, token });
      navigate("/login", { replace: true, state: { passwordReset: true } });
    } catch (error) {
      setNotice(getApiErrorMessage(error));
    }
  });

  return (
    <AuthLayout title="Choose a new password" subtitle="Use a strong password you have not used on another account." footer={<>Return to <Link to="/login">sign in</Link></>}>
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <PasswordField label="New password" name="password" register={form.register} error={form.formState.errors.password?.message} autoComplete="new-password" />
        <PasswordField label="Confirm new password" name="confirmPassword" register={form.register} error={form.formState.errors.confirmPassword?.message} autoComplete="new-password" />
        <FormNotice message={notice} />
        <button className="button button-primary auth-submit" type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Updating..." : "Update password"}<ArrowLeft className="submit-arrow" size={17} /></button>
        <p className="auth-demo-note">Reset tokens are verified by the server and are not stored in this page.</p>
      </form>
    </AuthLayout>
  );
}