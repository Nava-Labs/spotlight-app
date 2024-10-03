"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogClose } from "@radix-ui/react-dialog";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSpotlightRequest } from "../../request";
import { ThreadRequest } from "@/types";
import useSupabaseBrowser from "@/hooks/useSupabaseBrowser";
import { useQuery as useSupabaseQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { useParams } from "next/navigation";

import RequestedEmptyState from "@/public/empty-states/requested.svg";
import PendingEmptyState from "@/public/empty-states/pending.svg";
import ApprovedEmptyState from "@/public/empty-states/approved.svg";

export default function Dashboard() {
  const [requests, setRequests] = useState<ThreadRequest[]>([]);
  const wallet = useWallet();
  const [amount, setAmount] = useState("");
  const client = useSupabaseBrowser();
  const params = useParams();
  const twitterHandle = params.twitter_handle;

  const { request, isLoading } = useSpotlightRequest();

  const { data: influencerData } = useSupabaseQuery(
    client
      .from("influencers")
      .select("id")
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

  const handleAccept = async (id: number) => {
    const { error } = await client
      .from("requests")
      .update({ status: "pending" })
      .eq("id", id);

    if (error) {
      console.error("Error updating requests:", error);
    } else {
      refetchRequests();
    }
  };

  const handleApproved = async (id: number) => {
    const { error } = await client
      .from("requests")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      console.error("Error updating requests:", error);
    } else {
      refetchRequests();
    }
  };

  const renderRequestList = (status: "requested" | "pending" | "approved") => (
    <ScrollArea className="h-[600px] pr-4">
      <ul className="space-y-4">
        {!requests.filter((req) => req.status === status).length && (
          <Card className="mt-4 flex h-64 w-full flex-col items-center justify-between gap-3 rounded-md border-none bg-transparent py-6 shadow-none">
            <div className="flex h-full w-fit items-center justify-center">
              {(() => {
                switch (status) {
                  case "requested":
                    return <RequestedEmptyState />;
                  case "pending":
                    return <PendingEmptyState />;
                  case "approved":
                    return <ApprovedEmptyState />;
                  default:
                    break;
                }
              })()}
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
                    {request.request_type}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
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
                  <Button
                    onClick={() => handleAccept(request.id)}
                    className="rounded-full"
                  >
                    Accept Tweet
                  </Button>
                )}
                {status === "pending" && (
                  <Button
                    onClick={() => handleApproved(request.id)}
                    className="rounded-full"
                  >
                    Approved
                  </Button>
                )}
              </div>
            </li>
          ))}
      </ul>
    </ScrollArea>
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <p className="text-base text-muted-foreground">
          Manage and approve thread requests from projects
        </p>
        <Tabs defaultValue="requested" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-3 rounded-full p-1 bg-muted">
            <TabsTrigger value="requested" className="rounded-full">
              Requested
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-full">
              Pending
            </TabsTrigger>
            <TabsTrigger value="approved" className="rounded-full">
              Approved
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
          onClick={async () => await request(1)}
          className="w-full"
          loading={isLoading}
          disabled={!wallet.publicKey}
        >
          Request SOL
        </Button>
      </div>
    </div>
  );
}
