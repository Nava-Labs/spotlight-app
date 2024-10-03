"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogClose } from "@radix-ui/react-dialog";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSpotlightRequest } from "../../../request";
import { ThreadRequest } from "@/types";
import useSupabaseBrowser from "@/hooks/useSupabaseBrowser";
import { useQuery as useSupabaseQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { useParams } from "next/navigation";

import RequestedEmptyState from "@/public/empty-states/requested.svg";
import PendingEmptyState from "@/public/empty-states/pending.svg";
import ApprovedEmptyState from "@/public/empty-states/approved.svg";
import { CheckIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSpotlightClaim } from "@/app/claim";

export default function Dashboard() {
  const [requests, setRequests] = useState<ThreadRequest[]>([]);
  const wallet = useWallet();
  const [amount, setAmount] = useState("");
  const client = useSupabaseBrowser();
  const params = useParams();
  const twitterHandle = params.twitter_handle;

  const { request, isLoading: isRequestLoading } = useSpotlightRequest();
  const { claim, isLoading: isClaimLoading } = useSpotlightClaim();
  const [isDeclining, startDecline] = useTransition();
  const [isAccepting, startAccept] = useTransition();

  const { data: influencerData } = useSupabaseQuery(
    client
      .from("influencers")
      .select("*")
      .eq("twitter_handle", twitterHandle)
      .single(),
  );

  const { data: requestsData, refetch: refetchRequests } = useSupabaseQuery(
    client
      .from("requests")
      .select("*")
      .eq("influencer_id", influencerData?.id ?? ""),
    { enabled: !!influencerData },
  );

  useEffect(() => {
    if (wallet.publicKey) {
      wallet.connect();
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    if (requestsData) {
      const threadRequests: ThreadRequest[] = requestsData.map((collab) => ({
        ...collab,
      }));

      setRequests(threadRequests);
    }
  }, [requestsData]);

  const handleDecline = async (id: number) => {
    startDecline(async () => {
      const { error } = await client
        .from("requests")
        .update({ status: "declined" })
        .eq("id", id);

      if (error) {
        console.error("Error updating requests:", error);
      } else {
        refetchRequests();
      }
    });
  };

  const handleAccept = useCallback(
    async (id: number, text: string) => {
      if (!influencerData) return;
      startAccept(async () => {
        const postTweet = await fetch(`/api/twitter/post`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            creator: influencerData.twitter_handle,
            text: text,
          }),
        });

        if (!postTweet.ok) return;
        const res = await postTweet.json();
        console.log(res);

        const { error } = await client
          .from("requests")
          .update({ status: "pending" })
          .eq("id", id);

        if (error) {
          console.error("Error updating requests:", error);
        } else {
          refetchRequests();
        }
      });
    },
    [influencerData],
  );

  const renderRequestList = (status: "requested" | "pending" | "approved") => (
    <ScrollArea className="h-[600px] pr-4">
      <ul className="space-y-4">
        {!requests.filter((req) => req.status === status).length && (
          <Card className="mt-4 flex h-64 w-full flex-col items-center justify-between gap-3 rounded-md border-none bg-transparent py-6 shadow-none">
            <div className="flex h-full w-fit items-center justify-center">
              {status === "requested" && <RequestedEmptyState />}
              {status === "pending" && <PendingEmptyState />}
              {status === "approved" && <ApprovedEmptyState />}
            </div>
            <p className="text-center text-muted-foreground/50">
              No {status} post found.
            </p>
          </Card>
        )}
        {requests
          .filter((req) => req.status === status)
          .map((request) => (
            <li key={request.id} className="bg-card rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{request.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    By {request.requested_by}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {request.details}
              </p>
              <div className="flex justify-between items-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-full">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-xl">
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        {request.details}
                      </p>
                      <div className="flex justify-end space-x-2">
                        <DialogClose asChild>
                          <Button variant="outline" className="rounded-full">
                            Close
                          </Button>
                        </DialogClose>
                        {status === "requested" && (
                          <Button className="rounded-full">Approve</Button>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                {status === "requested" && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleDecline(request.id)}
                      loading={isDeclining}
                      className="rounded-full"
                      variant={"destructive"}
                    >
                      <p>Decline</p>
                      <Trash2Icon className="w-4 h-4 ml-2" />{" "}
                    </Button>
                    <Button
                      onClick={() => handleAccept(request.id, request.details!)}
                      loading={isAccepting}
                      className="rounded-full"
                    >
                      <p>Accept Tweet</p>
                      <CheckIcon className="w-4 h-4 ml-2" />{" "}
                    </Button>
                  </div>
                )}
                {status === "pending" && (
                  <Button
                    onClick={async () =>
                      await claim(0.001, request.id, refetchRequests)
                    }
                    loading={isClaimLoading}
                    className="rounded-full"
                  >
                    Approve
                  </Button>
                )}
              </div>
            </li>
          ))}
      </ul>
    </ScrollArea>
  );

  return (
    <div className="min-h-screen bg-background py-4 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex space-x-8">
          <div>
            <p className="text-xl font-semibold">@{twitterHandle}</p>
            <p className="text-base text-muted-foreground">
              {influencerData?.blinks_description}
            </p>
          </div>
          <div className="flex flex-col min-w-max items-center">
            <p className="text-xs uppercase text-muted-foreground">
              social score
            </p>
            <p className="text-5xl font-bold">78</p>
          </div>
        </div>
        <Tabs defaultValue="requested" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-3 rounded-full h-10 p-1">
            <TabsTrigger value="requested" className="rounded-full space-x-2">
              <p>Requested</p>
              {!!requests.filter((req) => req.status === "requested")
                .length && (
                <Badge className="px-1 py-0 bg-zinc-500">
                  {requests.filter((req) => req.status === "requested").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-full space-x-2">
              <p>Pending</p>
              {!!requests.filter((req) => req.status === "pending").length && (
                <Badge className="px-1 py-0 bg-zinc-500">
                  {requests.filter((req) => req.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="rounded-full space-x-2">
              <p>Approved</p>
              {!!requests.filter((req) => req.status === "approved").length && (
                <Badge className="px-1 py-0 bg-zinc-500">
                  {requests.filter((req) => req.status === "approved").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <Card className="mt-2">
            <TabsContent value="requested">
              <CardContent>{renderRequestList("requested")}</CardContent>
            </TabsContent>
            <TabsContent value="pending">
              <CardContent>{renderRequestList("pending")}</CardContent>
            </TabsContent>
            <TabsContent value="approved">
              <CardContent>{renderRequestList("approved")}</CardContent>
            </TabsContent>
          </Card>
        </Tabs>
        <input
          type="number"
          placeholder="Amount in SOL"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full mt-8"
        />

        <Button
          onClick={async () => await request(0.001)}
          className="w-full"
          loading={isRequestLoading}
          disabled={!wallet.publicKey}
        >
          Request SOL
        </Button>
      </div>
    </div>
  );
}
