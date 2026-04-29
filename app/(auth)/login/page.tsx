import { LoginForm } from "@/components/dashboard/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return <LoginForm nextPath={resolvedSearchParams.next || "/"} />;
}
