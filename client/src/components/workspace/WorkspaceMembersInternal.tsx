import React from 'react';
import { useParams } from 'react-router-dom';
import WorkspaceMembersTab from '../workspace-detail/WorkspaceMembersTab';

const WorkspaceMembersInternal: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  if (!workspaceId) {
    return null;
  }

  return <WorkspaceMembersTab workspaceId={workspaceId} />;
};

export default WorkspaceMembersInternal;
