import React, { useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckIcon, Lightbulb, Trash2Icon } from "lucide-react";
import { ThreadRequest, RequestStatus } from "@/types";
import useSupabaseBrowser from "@/hooks/useSupabaseBrowser";
import { useSpotlightClaim } from "@/app/claim";
import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import TypingAnimation from "@/components/ui/typing-animation";

interface RequestListItemProps {
  request: ThreadRequest;
  status: RequestStatus;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetchRequests: () => Promise<any>;
  influencerTwitterHandle?: string;
}

const RequestListItem: React.FC<RequestListItemProps> = ({
  request,
  status,
  refetchRequests,
  influencerTwitterHandle,
}) => {
  const client = useSupabaseBrowser();
  const [isDeclining, startDecline] = useTransition();
  const [isAccepting, startAccept] = useTransition();
  const { claim: handleClaim, isLoading: isClaiming } = useSpotlightClaim({
    statusOnSuccess: "approved",
  });

  const onDecline = useCallback(
    async (id: number) => {
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
    },
    [client, refetchRequests],
  );

  const onAccept = useCallback(
    async (id: number, text: string) => {
      if (!influencerTwitterHandle) return;
      startAccept(async () => {
        const postTweet = await fetch(`/api/twitter/post`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            creator: influencerTwitterHandle,
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
    [client, influencerTwitterHandle, refetchRequests],
  );

  const onClaim = useCallback(
    async (amount: number, id: number) => {
      await handleClaim(amount, id, refetchRequests);
    },
    [handleClaim, refetchRequests],
  );

  return (
    <li className="p-6">
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
      <div>
        <Collapsible>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <AnimatedCircularProgressBar
                max={100}
                min={0}
                value={100 - (request.scam_probability || 0)}
                gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                className="size-8 text-sm font-bold"
              />
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  <p>Read AI Analysis</p>
                  <Lightbulb className="size-4 ml-2" />
                </Button>
              </CollapsibleTrigger>
            </div>

            {status === "requested" && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => onDecline(request.id)}
                  loading={isDeclining}
                  className="rounded-full"
                  variant={"destructive"}
                >
                  <p>Decline</p>
                  <Trash2Icon className="w-4 h-4 ml-2" />{" "}
                </Button>
                <Button
                  onClick={() => onAccept(request.id, request.details!)}
                  loading={isAccepting}
                  className="rounded-full"
                >
                  <p>Accept Tweet</p>
                  <CheckIcon className="w-4 h-4 ml-2" />{" "}
                </Button>
              </div>
            )}
            {status === "pending" && (
              <Button disabled className="rounded-full">
                <p>Pending approval</p>
                <CheckIcon className="w-4 h-4 ml-2" />{" "}
              </Button>
            )}
            {status === "approved" && (
              <Button
                onClick={async () => await onClaim(0.01, request.id)}
                loading={isClaiming}
                disabled={!!request.tx_receipt}
                className="rounded-full bg-green-600"
              >
                <p>{!request.tx_receipt ? "Claim Payment" : "Claimed"} </p>
                <CheckIcon className="w-4 h-4 ml-2" />{" "}
              </Button>
            )}
          </div>
          <CollapsibleContent className={cn(
            "ml-1 border-l-4 border-blue-500 bg-blue-50 mt-2 pl-4 pr-2 py-3",
            (request.scam_probability && request.scam_probability > 50) && "border-yellow-500 bg-yellow-50"
          )}>
            {request.sentiment && (
              <div>
                <TypingAnimation
                  className="text-sm text-muted-foreground font-normal mb-4 font-mono"
                  duration={10}
                  text={"> " + request.sentiment_explanation}
                />
                {request.scam_probability && request.scam_probability > 50 && (
                  <div className="flex items-center mt-2 text-yellow-700 text-sm font-semibold">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span>This post may contain suspicious content. Please review carefully.</span>
                  </div>
                )}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </li>
  );
};

export default RequestListItem;
