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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TwitterIcon, GlobeIcon } from "lucide-react";
import Link from "next/link";
import { DialogClose } from "@radix-ui/react-dialog";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSpotlightRequest } from "./request";

// Mock data for thread requests
const mockThreadRequests = [
  {
    id: 1,
    startup: "TechNova",
    title: "AI in Healthcare",
    content:
      "Explore groundbreaking AI applications revolutionizing healthcare. From early disease detection to personalized treatment plans, we'll dive into how artificial intelligence is transforming patient care and medical research.",
    status: "requested",
    website: "https://technova.ai",
    twitter: "https://twitter.com/technova_ai",
  },
  {
    id: 2,
    startup: "EcoGreen",
    title: "Sustainable Living",
    content:
      "Discover practical tips for reducing your carbon footprint in daily life. We'll cover everything from energy-efficient home improvements to sustainable shopping habits, helping you make a positive impact on the environment.",
    status: "requested",
    website: "https://ecogreen.com",
    twitter: "https://twitter.com/ecogreen_life",
  },
  {
    id: 3,
    startup: "CryptoWave",
    title: "Blockchain Basics",
    content:
      "Demystify blockchain technology for beginners. We'll break down complex concepts into easy-to-understand explanations, covering the fundamentals of cryptocurrencies, smart contracts, and decentralized applications.",
    status: "requested",
    website: "https://cryptowave.io",
    twitter: "https://twitter.com/cryptowave_io",
  },
  {
    id: 4,
    startup: "FitTech",
    title: "Wearable Fitness Tech",
    content:
      "Explore the latest innovations in wearable fitness technology. From advanced health tracking to AI-powered personal training, we'll showcase how these devices are revolutionizing the way we approach health and fitness.",
    status: "approved",
    website: "https://fittech.fit",
    twitter: "https://twitter.com/fittech_wear",
  },
  {
    id: 5,
    startup: "SpaceX",
    title: "Mars Colonization",
    content:
      "Delve into the challenges and possibilities of Mars colonization. We'll discuss the latest advancements in space travel, the potential for sustainable habitats on Mars, and the long-term implications for humanity's future in space.",
    status: "approved",
    website: "https://www.spacex.com",
    twitter: "https://twitter.com/spacex",
  },
];

type ThreadRequest = {
  id: number;
  startup: string;
  title: string;
  content: string;
  status: "requested" | "approved" | string;
  website: string;
  twitter: string;
};

export default function Dashboard() {
  const [requests, setRequests] = useState<ThreadRequest[]>(mockThreadRequests);
  const wallet = useWallet();
  const [amount, setAmount] = useState("");

  const { request, isLoading } = useSpotlightRequest();

  useEffect(() => {
    if (wallet.publicKey) {
      wallet.connect();
    }
  }, [wallet.publicKey]);

  const handleApprove = (id: number) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: "approved" } : req,
      ),
    );
  };

  const renderRequestList = (status: "requested" | "approved") => (
    <ScrollArea className="h-[600px] pr-4">
      <ul className="space-y-4">
        {requests
          .filter((req) => req.status === status)
          .map((request) => (
            <li key={request.id} className="bg-card rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{request.startup}</h3>
                  <p className="text-sm text-muted-foreground">
                    {request.title}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={request.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      <GlobeIcon className="h-4 w-4" />
                      <span className="sr-only">Visit website</span>
                    </Button>
                  </Link>
                  <Link
                    href={request.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      <TwitterIcon className="h-4 w-4" />
                      <span className="sr-only">Visit Twitter</span>
                    </Button>
                  </Link>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {request.content}
              </p>
              <div className="flex justify-between items-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-full">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">
                        {request.startup}
                      </DialogTitle>
                      <DialogDescription className="text-sm">
                        {request.title}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        {request.content}
                      </p>
                      <div className="flex space-x-2 mb-4">
                        <Link
                          href={request.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                          >
                            <GlobeIcon className="h-4 w-4 mr-2" />
                            Website
                          </Button>
                        </Link>
                        <Link
                          href={request.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                          >
                            <TwitterIcon className="h-4 w-4 mr-2" />
                            Twitter
                          </Button>
                        </Link>
                      </div>
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
                    onClick={() => handleApprove(request.id)}
                    className="rounded-full"
                  >
                    Accept Tweet
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
            <TabsList className="grid w-full grid-cols-2 rounded-full p-1 bg-muted">
              <TabsTrigger value="requested" className="rounded-full">
                Requested
              </TabsTrigger>
              <TabsTrigger value="approved" className="rounded-full">
                Approved
              </TabsTrigger>
            </TabsList>
            <TabsContent value="requested">
              {renderRequestList("requested")}
            </TabsContent>
            <TabsContent value="approved">
              {renderRequestList("approved")}
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
