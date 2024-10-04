import React, { useCallback, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { CheckIcon, Trash2Icon } from "lucide-react";
import { ThreadRequest, RequestStatus } from "@/types";
import useSupabaseBrowser from "@/hooks/useSupabaseBrowser";
import { useSpotlightClaim } from "@/app/claim";

interface RequestListItemProps {
  request: ThreadRequest;
  status: RequestStatus;
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

  const onDecline = useCallback(async (id: number) => {
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
  }, [client, refetchRequests]);

  const onAccept = useCallback(async (id: number, text: string) => {
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
  }, [client, influencerTwitterHandle, refetchRequests]);

  const onClaim = useCallback(async (amount: number, id: number) => {
    await handleClaim(amount, id, refetchRequests);
  }, [handleClaim, refetchRequests]);

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
            onClick={async () =>
              await onClaim(0.01, request.id)
            }
            loading={isClaiming}
            disabled={!!request.tx_receipt}
            className="rounded-full bg-green-600"
          >
            <p>{!request.tx_receipt ? "Claim Payment" : "Claimed"} </p>
            <CheckIcon className="w-4 h-4 ml-2" />{" "}
          </Button>
        )}
      </div>
    </li>
  );
};

export default RequestListItem;