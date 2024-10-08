"use client";

import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ChartNoAxesCombined,
  Gamepad2,
  Image,
  InfoIcon,
  Laugh,
  Network,
} from "lucide-react";
import Link from "next/link";

import * as React from "react";
import { LucideIcon } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "@/components/ui/card";

type Industries = {
  value: string;
  label: string;
  icon: LucideIcon;
};

const influencers = [
  {
    twitter_handle: "brocosaur",
    score: 0,
  },
  {
    twitter_handle: "wizardofsoho",
    name: "Wizard Of SoHo (🍷,🍷)",
    score: 80,
  },
  {
    twitter_handle: "austinvirts",
    name: "Austin",
    score: 80,
  },
  {
    twitter_handle: "icedknife",
    name: "Iced",
    score: 80,
  },
  {
    twitter_handle: "0xmikethree",
    name: "Mike Three 🇺🇸",
    score: 80,
  },
  {
    twitter_handle: "ministerofnfts",
    name: "MinisterOfNFTs 🔮",
    score: 80,
  },
  {
    twitter_handle: "alancarroII",
    name: "Alan Carroll",
    score: 80,
  },
  {
    twitter_handle: "blockgraze",
    name: "blockgraze",
    score: 80,
  },
  {
    twitter_handle: "grantyun2",
    name: "Grant Yun",
    score: 80,
  },
  {
    twitter_handle: "xbenjamminx",
    name: "Ben Jammin",
    score: 80,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 w-full max-w-2xl">
        <div className="flex justify-center"></div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to Spotlight
        </h1>
        <p className="text-xl text-gray-600 max-w-prose mx-auto">
          Unleash your creativity and connect with a global audience. Spotlight
          is the ultimate platform for content creators to share their passion,
          grow their following, and monetize their talent.
        </p>
        <div className="flex items-center space-x-4">
          <Input
            className="bg-white shadow h-12 text-lg rounded-full px-4"
            placeholder="search for creator.."
          />
          <ComboboxPopover />
        </div>
        <Card className="gap-8 divide-y">
          {influencers.map((data) => (
            <div
              key={data.twitter_handle}
              className={cn("w-full h-auto px-6 py-4")}
            >
              <div className="w-full flex justify-between">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between">
                    <img
                      src={"https://unavatar.io/x/" + data.twitter_handle}
                      className="size-20 rounded-lg border-4 border-bg-muted"
                    />
                    <div className="flex flex-col min-w-max items-center">
                      <div className="flex items-center mb-1">
                        <p className="text-xs uppercase text-muted-foreground font-bold">
                          score
                        </p>
                        <SocialScoreTooltip />
                      </div>
                      <AnimatedCircularProgressBar
                        max={100}
                        min={0}
                        value={data.score}
                        gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                        className="size-14 font-bold"
                      />
                    </div>
                  </div>

                  <div className="text-start">
                    <p className="text-xl font-semibold">{data.name}</p>
                    <p className="text-muted-foreground">
                      @{data.twitter_handle}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Vel voluptas suscipit dolorem. Deserunt ipsam animi
                      aliquam mollitia nihil laboriosam. Enim et nihil omnis.
                      Autem distinctio voluptatem enim expedita id dolorum
                      nostrum eos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Link href="/onboarding">
        <Button className="text-md shadow border border-zinc-700" size="lg">
          Become a Creator
        </Button>
      </Link>
    </div>
  );
}

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

const industries: Industries[] = [
  {
    value: "meme",
    label: "Meme",
    icon: Laugh,
  },
  {
    value: "depin",
    label: "DePin",
    icon: Network,
  },
  {
    value: "defi",
    label: "DeFi",
    icon: ChartNoAxesCombined,
  },
  {
    value: "gaming",
    label: "Gaming",
    icon: Gamepad2,
  },
  {
    value: "nfts",
    label: "NFTs",
    icon: Image,
  },
];

function ComboboxPopover() {
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Industries | null>(
    null,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="bg-white shadow border-dashed h-12 rounded-full px-4"
        >
          {selectedStatus ? (
            <>
              <selectedStatus.icon className="mr-2 h-4 w-4 shrink-0" />
              {selectedStatus.label}
            </>
          ) : (
            <>Filter</>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" side="bottom" align="start">
        <Command>
          <CommandInput placeholder="Change status..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {industries.map((status) => (
                <CommandItem
                  key={status.value}
                  value={status.value}
                  onSelect={(value) => {
                    setSelectedStatus(
                      industries.find((priority) => priority.value === value) ||
                        null,
                    );
                    setOpen(false);
                  }}
                >
                  <status.icon
                    className={cn(
                      "mr-2 h-4 w-4",
                      status.value === selectedStatus?.value
                        ? "opacity-100"
                        : "opacity-40",
                    )}
                  />
                  <span>{status.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
