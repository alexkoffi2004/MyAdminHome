import RequestActions from '../components/agent/RequestActions';

// Dans le composant RequestDetails, ajoutez :
{user.role === 'agent' && (
  <div className="request-actions">
    <RequestActions 
      request={request} 
      onStatusUpdate={handleStatusUpdate}
    />
  </div>
)} 