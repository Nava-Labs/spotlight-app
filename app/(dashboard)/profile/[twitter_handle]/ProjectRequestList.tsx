import React from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThreadRequest, Influencers } from "@/types";
import ApprovedEmptyState from "@/public/empty-states/approved.svg";
import ProjectRequestItem from './ProjectRequestItem';

interface ProjectRequestListProps {
  requests: ThreadRequest[];
  influencerData: Influencers;
  refetchRequests: () => Promise<any>;
}

const ProjectRequestList: React.FC<ProjectRequestListProps> = ({
  requests,
  influencerData,
  refetchRequests,
}) => {
  return (
    <ScrollArea className="min-h-fit max-h-[600px]">
      <ul className="divide-y">
        {!requests.length && (
          <Card className="mt-4 flex h-64 w-full flex-col items-center justify-between gap-3 rounded-md border-none bg-transparent py-6 shadow-none">
            <div className="flex h-full w-fit items-center justify-center">
              <ApprovedEmptyState />
            </div>
            <p className="text-center text-muted-foreground/50">
              You have no tweet request for @{influencerData.twitter_handle}
            </p>
          </Card>
        )}
        {requests.map((request) => (
          <ProjectRequestItem
            key={request.id}
            request={request}
            refetchRequests={refetchRequests}
          />
        ))}
      </ul>
    </ScrollArea>
  );
};

export default ProjectRequestList;