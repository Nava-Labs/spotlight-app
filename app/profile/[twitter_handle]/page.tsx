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

export default function Dashboard() {
  const [requests, setRequests] = useState<ThreadRequest[]>([]);
  const wallet = useWallet();
  const [amount, setAmount] = useState("");
  const client = useSupabaseBrowser();

  const { request, isLoading } = useSpotlightRequest();

  const { data: requestsData, refetch: refetchRequests } = useSupabaseQuery<
    ThreadRequest[]
  >(client.from("requests").select(`*`));
  console.log(requestsData);

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

  const handleApprove = async (id: number) => {
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

  const handleDeclined = async (id: number) => {
    const { error } = await client
      .from("requests")
      .update({ status: "declined" })
      .eq("id", id);

    if (error) {
      console.error("Error updating requests:", error);
    } else {
      refetchRequests();
    }
  };

  const handleCompleted = async (id: number) => {
    const { error } = await client
      .from("requests")
      .update({ status: "completed" })
      .eq("id", id);

    if (error) {
      console.error("Error updating requests:", error);
    } else {
      refetchRequests();
    }
  };

  const renderRequestList = (
    status: "requested" | "approved" | "completed" | "declined",
  ) => (
    <ScrollArea className="h-[600px] pr-4">
      <ul className="space-y-4">
        {requests
          .filter((req) => req.status === status)
          .map((request) => (
            <li key={request.id} className="bg-card rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">
                    {request.users.public_key}
                  </h3>
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
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleDeclined(request.id)}
                      variant="outline"
                      className="rounded-full bg-red-500 text-white"
                    >
                      Decline
                    </Button>
                    <Button
                      onClick={() => handleApprove(request.id)}
                      className="rounded-full"
                    >
                      Accept Tweet
                    </Button>
                  </div>
                )}
                {status === "approved" && (
                  <Button
                    onClick={() => handleCompleted(request.id)}
                    className="rounded-full"
                  >
                    Completed
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
      <Card className="max-w-4xl mx-auto rounded-xl shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CardTitle className="text-2xl"></CardTitle>
          </div>
          <CardDescription className="text-base">
            Manage and approve thread requests from projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="requested" className="w-full">
            <TabsList className="grid w-full grid-cols-4 rounded-full p-1 bg-muted">
              <TabsTrigger value="requested" className="rounded-full">
                Requested
              </TabsTrigger>
              <TabsTrigger value="approved" className="rounded-full">
                Approved
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-full">
                Completed
              </TabsTrigger>
              <TabsTrigger value="declined" className="rounded-full">
                Declined
              </TabsTrigger>
            </TabsList>
            <TabsContent value="requested">
              {renderRequestList("requested")}
            </TabsContent>
            <TabsContent value="approved">
              {renderRequestList("approved")}
            </TabsContent>
            <TabsContent value="completed">
              {renderRequestList("completed")}
            </TabsContent>
            <TabsContent value="declined">
              {renderRequestList("declined")}
            </TabsContent>
          </Tabs>
          <input
            type="number"
            placeholder="Amount in SOL"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full"
          />

          <Button
            onClick={async () => await request(1)}
            className="w-full"
            loading={isLoading}
            disabled={!wallet.publicKey}
          >
            Request SOL
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
