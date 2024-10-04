import React from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThreadRequest, RequestStatus } from "@/types";
import RequestListItem from './RequestListItem';
import RequestedEmptyState from "@/public/empty-states/requested.svg";
import PendingEmptyState from "@/public/empty-states/pending.svg";
import ApprovedEmptyState from "@/public/empty-states/approved.svg";

interface RequestListProps {
  requests: ThreadRequest[];
  status: RequestStatus;
  refetchRequests: () => Promise<any>;
  influencerTwitterHandle?: string;
}

const RequestList: React.FC<RequestListProps> = ({
  requests,
  status,
  refetchRequests,
  influencerTwitterHandle,
}) => {
  const filteredRequests = requests.filter((req) => req.status === status);

  return (
    <ScrollArea className="min-h-fit max-h-[600px]">
      <ul className="divide-y">
        {!filteredRequests.length && (
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
        {filteredRequests.map((request) => (
          <RequestListItem
            key={request.id}
            request={request}
            status={status}
            refetchRequests={refetchRequests}
            influencerTwitterHandle={influencerTwitterHandle}
          />
        ))}
      </ul>
    </ScrollArea>
  );
};

export default RequestList;