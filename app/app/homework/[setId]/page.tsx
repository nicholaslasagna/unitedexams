import { redirect } from "next/navigation";

export default async function AppHomeworkSetRedirect({
  params
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  redirect(`/homework/${setId}`);
}
