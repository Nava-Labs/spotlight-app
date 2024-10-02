import { redirect } from "next/navigation";

export default async function TwitterCallbackPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  console.log("I'M HERE >>>");
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL!}/api/twitter/auth`,
    {
      method: "POST",
      body: JSON.stringify({ code: searchParams?.code }),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const response = await request.json();
  console.log("RES >>>", response);
  redirect(
    `/onboarding?step=information&user=${response.id}&username=${response.username}`,
  );
}
