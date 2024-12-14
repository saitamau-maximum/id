import {
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ context: { client } }: LoaderFunctionArgs) => {
  const res = await client.index.$get();
  const message = await res.text();

  return {
    message,
  };
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Welcome to Remix!</h1>
      <p>{data.message}</p>
    </div>
  );
}
