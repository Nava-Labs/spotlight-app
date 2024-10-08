"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@solana/wallet-adapter-react";
import { Influencers, ThreadRequest } from "@/types";
import useSupabaseBrowser from "@/hooks/useSupabaseBrowser";
import { useQuery as useSupabaseQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PencilLine, Repeat2, Share2 } from "lucide-react";

import ApprovedEmptyState from "@/public/empty-states/approved.svg";
import { Badge } from "@/components/ui/badge";
import WalletConnect from "@/app/_components/ConnectWallet";
import RequestList from "./_components/RequestList";
import ProjectRequestList from "./_components/ProjectRequestList";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

const CircularProgress = dynamic(
  () => import("@/components/ui/half-circular-progress"),
  {
    loading: () => <Skeleton className="w-20 h-16 rounded-lg mr-6" />,
  },
);

const SocialScoreTooltip = () => (
  <TooltipProvider>
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <InfoIcon className="h-3 w-3 ml-1 text-muted-foreground cursor-help z-10" />
      </TooltipTrigger>
      <TooltipContent className="bg-background text-muted-foreground border shadow-md text-sm">
        <p>
          The social score is calculated based on the influencer&apos;s
          engagement rate,
        </p>
        <p>follower count, and overall social media presence.</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default function Dashboard() {
  const wallet = useWallet();
  const client = useSupabaseBrowser();
  const params = useParams();
  const twitterHandle = params.twitter_handle;

  const { data: influencerData, refetch: refetchInfluencer } = useSupabaseQuery(
    client
      .from("influencers")
      .select("*")
      .eq("twitter_handle", twitterHandle)
      .single(),
  );

  const isInfluencer = useMemo(() => {
    if (!influencerData) return false;
    if (!wallet.publicKey) return false;
    return wallet.publicKey.toString() === influencerData.public_key;
  }, [wallet, influencerData]);

  const getRequestsQuery = useCallback(() => {
    const base = client
      .from("requests")
      .select("*, influencer:influencers(twitter_handle,price)")
      .eq("influencer_id", influencerData?.id ?? "");
    if (isInfluencer) return base;

    return base.eq("public_key", wallet.publicKey ?? "");
  }, [influencerData, wallet, isInfluencer, client]);

  const { data: requestsData, refetch: refetchRequests } = useSupabaseQuery(
    getRequestsQuery(),
    { enabled: !!influencerData || !!wallet.publicKey },
  );

  useEffect(() => {
    if (wallet.publicKey) {
      wallet.connect();
    }
  }, [wallet]);

  if (!influencerData || !requestsData) {
    return (
      <div className="min-h-screen bg-background py-4 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4 items-center">
            <Skeleton className="!size-20 rounded-lg border-4 border-bg-muted" />
            <div className="flex space-x-8 w-full">
              <div className="w-full">
                <Skeleton className="w-1/4 h-6 rounded-lg" />
                <Skeleton className="w-1/2 h-6 rounded-lg mt-1" />
                <Skeleton className="w-full h-6 rounded-lg mt-1" />
              </div>
            </div>
            <Skeleton className="w-20 h-16 rounded-lg" />
          </div>
          <Skeleton className="w-full h-64 mt-4 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!wallet.publicKey) {
    return (
      <div className="min-h-screen bg-background py-4 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="w-full flex justify-between">
            <div className="flex space-x-4 items-center">
              <img
                src={"https://unavatar.io/x/" + twitterHandle}
                className="size-20 rounded-lg border-4 border-bg-muted"
              />
              <div>
                <p className="text-xl font-semibold">@{twitterHandle}</p>
                <p className="text-base text-muted-foreground">
                  {influencerData.blinks_description}
                </p>
              </div>
            </div>
            <div className="flex flex-col min-w-max items-center ml-8 -mr-6">
              <div className="flex items-center -mb-3">
                <p className="text-xs uppercase text-muted-foreground font-bold">
                  social score
                </p>
                <SocialScoreTooltip />
              </div>
              <CircularProgress value={influencerData.social_score} />
            </div>
          </div>
          <Card className="relative mt-4 flex h-64 w-full flex-col items-center justify-between gap-3 rounded-md bg-transparent overflow-hidden">
            <div className="flex h-full w-fit items-center justify-center">
              <ApprovedEmptyState />
            </div>
            <p className="text-center text-muted-foreground/50">
              You have no tweet request for ...
            </p>
            <div className="flex h-full w-fit items-center justify-center">
              <ApprovedEmptyState />
            </div>
            <p className="text-center text-muted-foreground/50">
              You have no tweet request for ...
            </p>
            <div className="flex h-full w-fit items-center justify-center">
              <ApprovedEmptyState />
            </div>
            <p className="text-center text-muted-foreground/50">
              You have no tweet request for ...
            </p>

            <div className="absolute top-0 w-full h-full flex items-center justify-center bg-white/5 backdrop-blur-lg">
              <WalletConnect />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!isInfluencer) {
    return (
      <div className="min-h-screen bg-background py-4 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="w-full flex justify-between">
            <div className="flex space-x-4 items-center">
              <img
                src={"https://unavatar.io/x/" + twitterHandle}
                className="size-20 rounded-lg border-4 border-bg-muted"
              />
              <div>
                <p className="text-xl font-semibold">@{twitterHandle}</p>
                <p className="text-base text-muted-foreground">
                  {influencerData.blinks_description}
                </p>
              </div>
            </div>
            <div className="flex flex-col min-w-max items-center ml-8">
              <div className="flex items-center -mb-3">
                <p className="text-xs uppercase text-muted-foreground font-bold">
                  social score
                </p>
                <SocialScoreTooltip />
              </div>
              <CircularProgress value={influencerData.social_score} />
            </div>
          </div>
          <ProjectView
            requests={requestsData}
            influencerData={influencerData}
            refetchRequests={refetchRequests}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="w-full flex justify-between">
          <div className="flex space-x-4 items-center">
            <img
              src={"https://unavatar.io/x/" + twitterHandle}
              className="size-20 rounded-lg border-4 border-bg-muted"
            />
            <div>
              <p className="text-xl font-semibold">@{twitterHandle}</p>
              <p className="text-base text-muted-foreground">
                {influencerData.blinks_description}
              </p>
            </div>
          </div>
          <div className="flex flex-col min-w-max items-center ml-8 -mr-6">
            <div className="flex items-center -mb-3">
              <p className="text-xs uppercase text-muted-foreground font-bold">
                social score
              </p>
              <SocialScoreTooltip />
            </div>
            <CircularProgress value={influencerData.social_score} />
          </div>
        </div>
        <InfluencerView
          requests={requestsData}
          influencerData={influencerData}
          refetchRequests={async () => {
            await refetchRequests();
            await refetchInfluencer();
          }}
        />
      </div>
    </div>
  );
}

const ProjectView = ({
  requests,
  influencerData,
  refetchRequests,
}: {
  requests: ThreadRequest[];
  influencerData: Influencers;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetchRequests: () => Promise<any>;
}) => {
  return (
    <Card className="mt-6">
      <CardContent className="p-0">
        <ProjectRequestList
          requests={requests}
          influencerData={influencerData}
          refetchRequests={refetchRequests}
        />
      </CardContent>
    </Card>
  );
};

const InfluencerView = ({
  requests,
  influencerData,
  refetchRequests,
}: {
  requests: ThreadRequest[];
  influencerData: Influencers;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetchRequests: () => Promise<any>;
}) => {
  const tweetText = encodeURIComponent(
    "Check out my Spotlight profile and request a tweet from me! 🚀\n\n",
  );
  const repostUrl = encodeURIComponent(
    `https://dial.to/?action=solana-action:https://www.spotlightprotocol.xyz/api/repost-request?creator=${influencerData.twitter_handle}`,
  );
  const postUrl = encodeURIComponent(
    `https://dial.to/?action=solana-action:https://www.spotlightprotocol.xyz/api/post-request?creator=${influencerData.twitter_handle}`,
  );
  const twitterSharePostUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${postUrl}`;
  const twitterShareRepostUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${repostUrl}`;
  return (
    <>
      <Tabs defaultValue="requested" className="w-full mt-6">
        <div className="flex justify-between">
          <TabsList className="grid grid-cols-3 rounded-full h-10 p-1">
            <TabsTrigger
              value="requested"
              className="rounded-full space-x-2 px-4"
            >
              <p>Requested</p>
              {!!requests.filter((req) => req.status === "requested")
                .length && (
                <Badge className="px-1 py-0 bg-zinc-500">
                  {requests.filter((req) => req.status === "requested").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="rounded-full space-x-2 px-4"
            >
              <p>Pending</p>
              {!!requests.filter((req) => req.status === "pending").length && (
                <Badge className="px-1 py-0 bg-zinc-500">
                  {requests.filter((req) => req.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="rounded-full space-x-2 px-4"
            >
              <p>Approved</p>
              {!!requests.filter((req) => req.status === "approved").length && (
                <Badge className="px-1 py-0 bg-zinc-500">
                  {requests.filter((req) => req.status === "approved").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <Menubar className="border-0">
            <MenubarMenu>
              <MenubarTrigger asChild>
                <Button
                  variant={"outline"}
                  className="rounded-full h-10 border-dashed"
                >
                  <p>Share Blinks</p>
                  <Share2 className="ml-2 size-4" />
                </Button>
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  onClick={() => window.open(twitterSharePostUrl, "_blank")}
                >
                  <p>Post Blinks</p>
                  <PencilLine className="ml-2 size-4" />
                </MenubarItem>
                <MenubarItem
                  onClick={() => window.open(twitterShareRepostUrl, "_blank")}
                >
                  <p>Instant Repost Blinks</p>
                  <Repeat2 className="ml-2 size-4" />
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
        <Card className="mt-2">
          <TabsContent value="requested" className="mt-0">
            <CardContent className="p-0">
              <RequestList
                requests={requests}
                status="requested"
                refetchRequests={refetchRequests}
                influencerTwitterHandle={influencerData.twitter_handle ?? ""}
              />
            </CardContent>
          </TabsContent>
          <TabsContent value="pending" className="mt-0">
            <CardContent className="p-0">
              <RequestList
                requests={requests}
                status="pending"
                refetchRequests={refetchRequests}
                influencerTwitterHandle={influencerData.twitter_handle ?? ""}
              />
            </CardContent>
          </TabsContent>
          <TabsContent value="approved" className="mt-0">
            <CardContent className="p-0">
              <RequestList
                requests={requests}
                status="approved"
                refetchRequests={refetchRequests}
                influencerTwitterHandle={influencerData.twitter_handle ?? ""}
              />
            </CardContent>
          </TabsContent>
        </Card>
      </Tabs>
    </>
  );
};
