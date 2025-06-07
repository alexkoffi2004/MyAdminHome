import Badge from './Badge';

export type RequestStatus = 'pending' | 'processing' | 'completed' | 'rejected';

interface RequestStatusBadgeProps {
  status: RequestStatus;
}

const RequestStatusBadge = ({ status }: RequestStatusBadgeProps) => {
  switch (status) {
    case 'pending':
      return <Badge variant="warning">En attente</Badge>;
    case 'processing':
      return <Badge variant="primary">En traitement</Badge>;
    case 'completed':
      return <Badge variant="success">Terminée</Badge>;
    case 'rejected':
      return <Badge variant="danger">Rejetée</Badge>;
    default:
      return <Badge>Inconnu</Badge>;
  }
};

export default RequestStatusBadge;