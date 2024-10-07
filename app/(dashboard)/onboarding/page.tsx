"use client";

import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Dispatch,
  SetStateAction,
  Suspense,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Button } from "@/components/ui/button";
import { TWITTER_CALLBACK_URL } from "@/lib/constants";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/ui/spinner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NumberInput } from "@/components/ui/number-input";
import getSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { CircleCheckBig } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";

const formSchema = z.object({
  blinks_title: z.string().min(2).max(50),
  blinks_description: z.string().min(2).max(280),
  price: z.object({
    post: z.number(),
    repost: z.number(),
  }),
});

export default function Onboarding() {
  return (
    <Suspense>
      <OnboardingWrapper />
    </Suspense>
  );
}

const OnboardingWrapper = () => {
  // NOTE: the order of it is important
  const tabs = useMemo(
    () => ["account", "information", "pricing", "completed"],
    [],
  );

  const wallet = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();

  const [isLoading, startTransition] = useTransition();
  const [selectedTab, setSelectedTab] = useState(
    searchParams.get("step") || "account",
  );

  const percentage = useMemo(() => {
    const index = tabs.findIndex((value) => value === selectedTab);
    return ((index + 1) / tabs.length) * 100;
  }, [selectedTab, tabs]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const twitter_id = searchParams.get("user");
    if (!twitter_id) return;
    localStorage.setItem("spotlight:twitter_id", twitter_id);
  }, [searchParams]);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const twitter_id = searchParams.get("user");
    if (!publicKey) return alert("Please connect your wallet first");
    if (!twitter_id) return alert("No twitter id");

    setSelectedTab("completed");
    startTransition(async () => {
      await supabase
        .from("influencers")
        .update({
          ...values,
          public_key: wallet.publicKey!.toString(),
        })
        .eq("twitter_id", twitter_id);
      console.log(values);
    });
  }

  return (
    <div className="flex flex-col">
      <div className="min-h-[80vh] flex flex-col justify-center max-w-4xl mx-auto space-y-4">
        <div className="flex space-x-3 items-center max-w-4xl">
          <Progress value={percentage} className="w-full" />
          <p className="text-sm min-w-fit">
            {tabs.findIndex((value) => value === selectedTab) + 1} of{" "}
            {tabs.length}
          </p>
        </div>
        <Card className="min-w-[56rem] mx-auto rounded-xl shadow-lg min-h-fit p-8">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs defaultValue="account" value={selectedTab}>
                <AccountTab />
                <InformationTab
                  onSuccess={() => setSelectedTab("pricing")}
                  setTab={setSelectedTab}
                />
                <PricingTab onSuccess={() => {}} setTab={setSelectedTab} />
                <CompletedTab
                  isLoading={isLoading}
                  onSuccess={() =>
                    router.push(`/profile/${searchParams.get("username")}`)
                  }
                />
              </Tabs>
            </form>
          </FormProvider>
        </Card>
      </div>
    </div>
  );
};

const AccountTab = () => {
  const getTwitterOauthUrl = () => {
    const rootUrl = "https://twitter.com/i/oauth2/authorize";
    const options = {
      redirect_uri: TWITTER_CALLBACK_URL,
      client_id: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID!,
      state: "state",
      response_type: "code",
      code_challenge: "y_SfRG4BmOES02uqWeIkIgLQAlTBggyf_G7uKT51ku8",
      code_challenge_method: "S256",
      //👇🏻 required scope for authentication and posting tweets
      scope: ["users.read", "tweet.read", "tweet.write"].join(" "),
    };
    const qs = new URLSearchParams(options).toString();
    return `${rootUrl}?${qs}`;
  };

  return (
    <TabsContent value="account">
      <div className="space-y-2">
        <p className="text-lg font-semibold leading-none tracking-tight">
          Register as a Creator
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            First, authorize our app to access your twitter account for repost
            and post actions. This will enable us to repost and post actions on
            your behalf, either when using the App or when payments is received.
          </p>
          <p>
            You can revoke this permission later on if you decide to not use the
            Spotlight Protocol
          </p>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant={"outline"}>Cancel</Button>

        <Link href={getTwitterOauthUrl()}>
          <Button>Authorize Spotlight on Twitter</Button>
        </Link>
      </div>
    </TabsContent>
  );
};

const InformationTab = ({
  onSuccess,
}: {
  onSuccess: () => void;
  setTab: Dispatch<SetStateAction<string>>;
}) => {
  const form = useFormContext();
  return (
    <TabsContent value="information">
      <div className="space-y-2">
        <p className="text-lg font-semibold leading-none tracking-tight">
          Blinks Information
        </p>
        <div className="space-y-2 mt-4">
          <FormField
            control={form.control}
            name="blinks_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="blinks_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormDescription>This is description</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant={"outline"} disabled>
          Back
        </Button>
        <Button onClick={onSuccess}>Next</Button>
      </div>
    </TabsContent>
  );
};

const PricingTab = ({
  onSuccess,
  setTab,
}: {
  onSuccess: () => void;
  setTab: Dispatch<SetStateAction<string>>;
}) => {
  const form = useFormContext();
  return (
    <TabsContent value="pricing">
      <div className="space-y-4">
        <p className="text-lg font-semibold leading-none tracking-tight">
          Set Pricing
        </p>
        <div className="w-full flex space-x-2">
          <FormField
            control={form.control}
            name="price.post"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Post price</FormLabel>
                <FormControl>
                  <NumberInput
                    suffix=" SOL"
                    placeholder="10 SOL"
                    {...field}
                    onValueChange={({ floatValue }) => {
                      field.onChange(floatValue);
                    }}
                    onChange={() => {}}
                  />
                </FormControl>
                <FormDescription>Helpers Description</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price.repost"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Repost price</FormLabel>
                <FormControl>
                  <NumberInput
                    suffix=" SOL"
                    placeholder="10 SOL"
                    {...field}
                    onValueChange={({ floatValue }) => {
                      field.onChange(floatValue);
                    }}
                    onChange={() => {}}
                  />
                </FormControl>
                <FormDescription>Helpers Description</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant={"outline"} onClick={() => setTab("information")}>
          Back
        </Button>
        <Button onClick={onSuccess}>Submit</Button>
      </div>
    </TabsContent>
  );
};

const CompletedTab = ({
  isLoading,
  onSuccess,
}: {
  isLoading: boolean;
  onSuccess: () => void;
}) => {
  return (
    <TabsContent value="completed">
      <div className="flex flex-col items-center">
        {isLoading && <Spinner size="xl" width={6} className="text-zinc-400" />}

        {!isLoading && (
          <div className="flex flex-col items-center">
            <CircleCheckBig className="w-20 h-20 stroke-[1.5] text-zinc-400" />
            <p className="text-xl font-semibold mt-4">Submitted</p>
            <p className="text-muted-foreground mt-1 mb-4">
              Registration is completed! click &quot;Go to Profile&quot; to get
              access to your blinks
            </p>
            <Button onClick={onSuccess}>Go to Profile</Button>
          </div>
        )}
      </div>
    </TabsContent>
  );
};
