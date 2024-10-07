import React, { useTransition } from "react";
import { ThreadRequest } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckIcon, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSpotlightClaim } from "@/app/claim";
import useSupabaseBrowser from "@/hooks/useSupabaseBrowser";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ProjectRequestItemProps {
  request: ThreadRequest;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetchRequests: () => Promise<any>;
}

const ProjectRequestItem: React.FC<ProjectRequestItemProps> = ({
  request,
  refetchRequests,
}) => {
  const client = useSupabaseBrowser();
  const [isApproving, startApprove] = useTransition();
  const { claim: handleDecline, isLoading: isDeclining } = useSpotlightClaim({
    statusOnSuccess: "declined",
  });

  const handleApprove = async (id: number) => {
    startApprove(async () => {
      const { error } = await client
        .from("requests")
        .update({ status: "approved" })
        .eq("id", id);

      if (error) {
        console.error("Error updating requests:", error);
      } else {
        refetchRequests();
      }
    });
  };

  return (
    <li className="p-6">
      <div className="flex justify-between items-start mb-2">
        <div className="flex w-full justify-between">
          <div>
            <div className="flex space-x-2 items-center">
              <h3
                className={cn(
                  "text-lg font-semibold",
                  request.status === "declined" && "line-through",
                )}
              >
                {request.title}
              </h3>
              {request.status === "declined" && (
                <Badge
                  variant={"outline"}
                  className="bg-red-100 text-red-500 h-5 border-0"
                >
                  Declined
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Requested to @{request.influencer?.twitter_handle}
            </p>
          </div>
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
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {request.status === "requested" && (
          <Button disabled variant={"outline"} className="rounded-full">
            Waiting for approval..
          </Button>
        )}
        {request.status === "pending" && (
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className="rounded-full">
                  <p>Report Problems</p>
                  <Flag className="w-4 h-4 ml-2" />{" "}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start">
                <Textarea placeholder="Write your issue with the post here.." />
                <div className="flex justify-end">
                  <Button size={"sm"} className="mt-4">
                    Submit issue
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-green-600 hover:bg-green-500">
                  <p>Approve work</p>
                  <CheckIcon className="w-4 h-4 ml-2" />{" "}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-xl">
                <DialogHeader>
                  <DialogTitle>Approve this creator&apos;s work?</DialogTitle>
                </DialogHeader>
                <div className="text-muted-foreground">
                  By Approving this thread. You will transfer your funds to @
                  {request.influencer?.twitter_handle} wallet. Make sure the
                  fulfilled request is acceptable to avoid unwanted outcome.
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant={"outline"} className="rounded-full">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={async () => await handleApprove(request.id)}
                    loading={isApproving}
                    className="rounded-full"
                  >
                    Proceed transfer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
        {request.status === "approved" && (
          <Button disabled className="rounded-full bg-green-600">
            <p>Approved</p>
            <CheckIcon className="w-4 h-4 ml-2" />{" "}
          </Button>
        )}
        {request.status === "declined" && (
          <Button
            loading={isDeclining}
            onClick={async () =>
              await handleDecline(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (request.influencer?.price as any).post,
                request.id,
                refetchRequests,
              )
            }
            className="rounded-full"
            disabled={!!request.tx_receipt}
          >
            <p>{!request.tx_receipt ? "Claim Refund" : "Refunded"} </p>
            <CheckIcon className="w-4 h-4 ml-2" />{" "}
          </Button>
        )}
      </div>
    </li>
  );
};

export default ProjectRequestItem;
