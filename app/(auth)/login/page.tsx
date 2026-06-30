import { LoginForm } from "@/components/dashboard/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return <LoginForm oauthError={resolvedSearchParams.error} />;
}
