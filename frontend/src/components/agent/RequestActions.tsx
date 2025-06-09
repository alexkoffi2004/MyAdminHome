import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, FileText, Info } from "lucide-react";
import documentService from '../../services/documentService';
import { Request } from '../../types/request';
import { toast } from "sonner";

interface RequestActionsProps {
  request: Request;
  onStatusUpdate: (status: string) => Promise<Request>;
}

const RequestActions: React.FC<RequestActionsProps> = ({ request: initialRequest, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [request, setRequest] = useState<Request>(initialRequest);

  const handleStatusUpdate = async (status: string) => {
    try {
      setLoading(true);
      const updatedRequest = await onStatusUpdate(status);
      setRequest(updatedRequest);
      toast.success(`Demande ${status === 'completed' ? 'approuvée' : 'rejetée'} avec succès`);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocument = async () => {
    try {
      setGenerating(true);
      const response = await documentService.generateDocument(request._id);
      setRequest(prev => ({
        ...prev,
        generatedDocument: response.data.generatedDocument
      }));
      toast.success('Document généré avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération du document');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadDocument = async () => {
    try {
      const blob = await documentService.downloadDocument(request._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${request._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Erreur lors du téléchargement du document');
    }
  };

  const handleApproveClick = () => {
    if (!isPaymentCompleted) {
      toast.error("Impossible d'approuver la demande : le paiement n'a pas encore été effectué", {
        description: "Veuillez attendre que le citoyen effectue le paiement avant d'approuver la demande."
      });
      return;
    }
  };

  const isPaymentCompleted = request.paymentStatus === 'completed';

  return (
    <div className="flex items-center gap-4">
      {request.status === 'pending' && (
        <>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="default"
                disabled={loading}
                className="flex items-center gap-2"
                onClick={handleApproveClick}
              >
                <CheckCircle className="h-4 w-4" />
                Approuver
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer l'approbation</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir approuver cette demande ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleStatusUpdate('completed')}>
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Rejeter
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer le rejet</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir rejeter cette demande ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleStatusUpdate('rejected')}>
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {!isPaymentCompleted && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-5 w-5 text-yellow-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>En attente du paiement</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </>
      )}
      
      {request.status === 'completed' && !request.generatedDocument && (
        <Button
          variant="default"
          onClick={handleGenerateDocument}
          disabled={generating}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          {generating ? 'Génération...' : 'Générer le document'}
        </Button>
      )}

      {request.generatedDocument && (
        <Button
          variant="default"
          onClick={handleDownloadDocument}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Télécharger le document
        </Button>
      )}
    </div>
  );
};

export default RequestActions; 