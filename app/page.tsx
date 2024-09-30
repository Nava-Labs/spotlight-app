"use client";

import { useState } from "react";
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

  wallet.connect();

  const { request, isLoading } = useSpotlightRequest();

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
            <CardTitle className="text-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 286 53"
                fill="none"
                className="h-8"
              >
                <path
                  d="M67.0246 41.7572L6.80586 0.52098C7.80888 0.183122 8.88305 0 10 0H62.1927C67.7155 0 72.1927 4.47715 72.1927 10V33C72.1927 36.7704 70.106 40.0534 67.0246 41.7572Z"
                  fill="black"
                />
                <path
                  d="M3.67247 2.25607C1.4308 4.08991 0 6.87786 0 10V33C0 38.5228 4.47715 43 10 43L35.3073 43L3.67247 2.25607Z"
                  fill="black"
                />
                <path
                  d="M100.152 40.72C97.624 40.72 95.344 40.28 93.312 39.4C91.296 38.52 89.632 37.264 88.32 35.632C87.024 33.984 86.2 32.032 85.848 29.776L91.848 28.864C92.36 30.912 93.408 32.496 94.992 33.616C96.592 34.736 98.432 35.296 100.512 35.296C101.744 35.296 102.904 35.104 103.992 34.72C105.08 34.336 105.96 33.776 106.632 33.04C107.32 32.304 107.664 31.4 107.664 30.328C107.664 29.848 107.584 29.408 107.424 29.008C107.264 28.592 107.024 28.224 106.704 27.904C106.4 27.584 106 27.296 105.504 27.04C105.024 26.768 104.464 26.536 103.824 26.344L94.896 23.704C94.128 23.48 93.296 23.184 92.4 22.816C91.52 22.432 90.68 21.912 89.88 21.256C89.096 20.584 88.448 19.736 87.936 18.712C87.44 17.672 87.192 16.392 87.192 14.872C87.192 12.648 87.752 10.784 88.872 9.28C90.008 7.76 91.528 6.624 93.432 5.872C95.352 5.12 97.48 4.752 99.816 4.768C102.184 4.784 104.296 5.192 106.152 5.992C108.008 6.776 109.56 7.92 110.808 9.424C112.056 10.928 112.936 12.744 113.448 14.872L107.232 15.952C106.976 14.736 106.48 13.704 105.744 12.856C105.024 11.992 104.136 11.336 103.08 10.888C102.04 10.44 100.928 10.2 99.744 10.168C98.592 10.152 97.52 10.328 96.528 10.696C95.552 11.048 94.76 11.56 94.152 12.232C93.56 12.904 93.264 13.688 93.264 14.584C93.264 15.432 93.52 16.128 94.032 16.672C94.544 17.2 95.176 17.624 95.928 17.944C96.696 18.248 97.472 18.504 98.256 18.712L104.448 20.44C105.296 20.664 106.248 20.968 107.304 21.352C108.36 21.736 109.376 22.272 110.352 22.96C111.328 23.648 112.128 24.552 112.752 25.672C113.392 26.792 113.712 28.216 113.712 29.944C113.712 31.736 113.336 33.312 112.584 34.672C111.848 36.016 110.848 37.136 109.584 38.032C108.32 38.928 106.872 39.6 105.24 40.048C103.624 40.496 101.928 40.72 100.152 40.72Z"
                  fill="black"
                />
                <path
                  d="M129.443 40.72C126.915 40.72 124.795 40.12 123.083 38.92C121.371 37.72 120.083 36.088 119.219 34.024C118.355 31.944 117.923 29.616 117.923 27.04C117.923 24.432 118.355 22.096 119.219 20.032C120.083 17.968 121.347 16.344 123.011 15.16C124.691 13.96 126.763 13.36 129.227 13.36C131.675 13.36 133.795 13.96 135.587 15.16C137.395 16.344 138.795 17.968 139.787 20.032C140.779 22.08 141.275 24.416 141.275 27.04C141.275 29.632 140.787 31.96 139.811 34.024C138.835 36.088 137.459 37.72 135.683 38.92C133.907 40.12 131.827 40.72 129.443 40.72ZM116.939 51.52V14.08H122.051V32.272H122.771V51.52H116.939ZM128.555 35.536C130.059 35.536 131.299 35.16 132.275 34.408C133.251 33.656 133.971 32.64 134.435 31.36C134.915 30.064 135.155 28.624 135.155 27.04C135.155 25.472 134.915 24.048 134.435 22.768C133.955 21.472 133.211 20.448 132.203 19.696C131.195 18.928 129.915 18.544 128.363 18.544C126.891 18.544 125.691 18.904 124.763 19.624C123.835 20.328 123.147 21.32 122.699 22.6C122.267 23.864 122.051 25.344 122.051 27.04C122.051 28.72 122.267 30.2 122.699 31.48C123.147 32.76 123.843 33.76 124.787 34.48C125.747 35.184 127.003 35.536 128.555 35.536Z"
                  fill="black"
                />
                <path
                  d="M156.093 40.72C153.501 40.72 151.237 40.136 149.301 38.968C147.365 37.8 145.861 36.192 144.789 34.144C143.733 32.08 143.205 29.712 143.205 27.04C143.205 24.32 143.749 21.936 144.837 19.888C145.925 17.84 147.437 16.24 149.373 15.088C151.309 13.936 153.549 13.36 156.093 13.36C158.701 13.36 160.973 13.944 162.909 15.112C164.845 16.28 166.349 17.896 167.421 19.96C168.493 22.008 169.029 24.368 169.029 27.04C169.029 29.728 168.485 32.104 167.397 34.168C166.325 36.216 164.821 37.824 162.885 38.992C160.949 40.144 158.685 40.72 156.093 40.72ZM156.093 35.296C158.397 35.296 160.109 34.528 161.229 32.992C162.349 31.456 162.909 29.472 162.909 27.04C162.909 24.528 162.341 22.528 161.205 21.04C160.069 19.536 158.365 18.784 156.093 18.784C154.541 18.784 153.261 19.136 152.253 19.84C151.261 20.528 150.525 21.496 150.045 22.744C149.565 23.976 149.325 25.408 149.325 27.04C149.325 29.552 149.893 31.56 151.029 33.064C152.181 34.552 153.869 35.296 156.093 35.296Z"
                  fill="black"
                />
                <path
                  d="M187.589 40C185.877 40.32 184.197 40.456 182.549 40.408C180.917 40.376 179.453 40.08 178.157 39.52C176.861 38.944 175.877 38.04 175.205 36.808C174.613 35.688 174.301 34.544 174.269 33.376C174.237 32.208 174.221 30.888 174.221 29.416V6.88H179.981V29.08C179.981 30.12 179.989 31.032 180.005 31.816C180.037 32.6 180.205 33.24 180.509 33.736C181.085 34.696 182.005 35.232 183.269 35.344C184.533 35.456 185.973 35.392 187.589 35.152V40ZM169.517 18.616V14.08H187.589V18.616H169.517Z"
                  fill="black"
                />
                <path d="M191.723 40V4.72H197.507V40H191.723Z" fill="black" />
                <path
                  d="M203.256 10.144V4.84H209.04V10.144H203.256ZM203.256 40V14.08H209.04V40H203.256Z"
                  fill="black"
                />
                <path
                  d="M225.205 52.24C223.765 52.24 222.381 52.016 221.053 51.568C219.741 51.12 218.557 50.472 217.501 49.624C216.445 48.792 215.581 47.784 214.909 46.6L220.237 43.96C220.733 44.904 221.429 45.6 222.325 46.048C223.237 46.512 224.205 46.744 225.229 46.744C226.429 46.744 227.501 46.528 228.445 46.096C229.389 45.68 230.117 45.056 230.629 44.224C231.157 43.408 231.405 42.384 231.373 41.152V33.784H232.093V14.08H237.157V41.248C237.157 41.904 237.125 42.528 237.061 43.12C237.013 43.728 236.925 44.32 236.797 44.896C236.413 46.576 235.677 47.952 234.589 49.024C233.501 50.112 232.149 50.92 230.533 51.448C228.933 51.976 227.157 52.24 225.205 52.24ZM224.701 40.72C222.317 40.72 220.237 40.12 218.461 38.92C216.685 37.72 215.309 36.088 214.333 34.024C213.357 31.96 212.869 29.632 212.869 27.04C212.869 24.416 213.357 22.08 214.333 20.032C215.325 17.968 216.725 16.344 218.533 15.16C220.341 13.96 222.469 13.36 224.917 13.36C227.381 13.36 229.445 13.96 231.109 15.16C232.789 16.344 234.061 17.968 234.925 20.032C235.789 22.096 236.221 24.432 236.221 27.04C236.221 29.616 235.789 31.944 234.925 34.024C234.061 36.088 232.773 37.72 231.061 38.92C229.349 40.12 227.229 40.72 224.701 40.72ZM225.589 35.536C227.141 35.536 228.389 35.184 229.333 34.48C230.293 33.76 230.989 32.76 231.421 31.48C231.869 30.2 232.093 28.72 232.093 27.04C232.093 25.344 231.869 23.864 231.421 22.6C230.989 21.32 230.309 20.328 229.381 19.624C228.453 18.904 227.253 18.544 225.781 18.544C224.229 18.544 222.949 18.928 221.941 19.696C220.933 20.448 220.189 21.472 219.709 22.768C219.229 24.048 218.989 25.472 218.989 27.04C218.989 28.624 219.221 30.064 219.685 31.36C220.165 32.64 220.893 33.656 221.869 34.408C222.845 35.16 224.085 35.536 225.589 35.536Z"
                  fill="black"
                />
                <path
                  d="M259.895 40V27.52C259.895 26.704 259.839 25.8 259.727 24.808C259.615 23.816 259.351 22.864 258.935 21.952C258.535 21.024 257.927 20.264 257.111 19.672C256.311 19.08 255.223 18.784 253.847 18.784C253.111 18.784 252.383 18.904 251.663 19.144C250.943 19.384 250.287 19.8 249.695 20.392C249.119 20.968 248.655 21.768 248.303 22.792C247.951 23.8 247.775 25.096 247.775 26.68L244.343 25.216C244.343 23.008 244.767 21.008 245.615 19.216C246.479 17.424 247.743 16 249.407 14.944C251.071 13.872 253.119 13.336 255.551 13.336C257.471 13.336 259.055 13.656 260.303 14.296C261.551 14.936 262.543 15.752 263.279 16.744C264.015 17.736 264.559 18.792 264.911 19.912C265.263 21.032 265.487 22.096 265.583 23.104C265.695 24.096 265.751 24.904 265.751 25.528V40H259.895ZM241.919 40V5.44H247.079V23.632H247.775V40H241.919Z"
                  fill="black"
                />
                <path
                  d="M285.286 40C283.574 40.32 281.894 40.456 280.246 40.408C278.614 40.376 277.15 40.08 275.854 39.52C274.558 38.944 273.574 38.04 272.902 36.808C272.31 35.688 271.998 34.544 271.966 33.376C271.934 32.208 271.918 30.888 271.918 29.416V6.88H277.678V29.08C277.678 30.12 277.686 31.032 277.702 31.816C277.734 32.6 277.902 33.24 278.206 33.736C278.782 34.696 279.702 35.232 280.966 35.344C282.23 35.456 283.67 35.392 285.286 35.152V40ZM267.214 18.616V14.08H285.286V18.616H267.214Z"
                  fill="black"
                />
              </svg>
            </CardTitle>
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
