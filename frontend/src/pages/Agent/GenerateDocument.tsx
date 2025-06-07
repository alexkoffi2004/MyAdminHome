import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  FileText,
  Download,
  Printer,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';

// Types
interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Acte de naissance' | 'Certificat de nationalité' | 'Acte de mariage' | 'Casier judiciaire';
  lastGenerated?: string;
}

// Mock data
const documentTemplates: DocumentTemplate[] = [
  {
    id: 'TEMPLATE-001',
    name: 'Acte de naissance standard',
    description: 'Format standard pour les actes de naissance',
    category: 'Acte de naissance',
    lastGenerated: '2024-03-19',
  },
  {
    id: 'TEMPLATE-002',
    name: 'Certificat de nationalité',
    description: 'Format officiel pour les certificats de nationalité',
    category: 'Certificat de nationalité',
    lastGenerated: '2024-03-18',
  },
  {
    id: 'TEMPLATE-003',
    name: 'Acte de mariage',
    description: 'Format standard pour les actes de mariage',
    category: 'Acte de mariage',
    lastGenerated: '2024-03-17',
  },
  {
    id: 'TEMPLATE-004',
    name: 'Casier judiciaire',
    description: 'Format officiel pour les casiers judiciaires',
    category: 'Casier judiciaire',
    lastGenerated: '2024-03-16',
  },
];

const GenerateDocument = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    
    setGenerating(true);
    // Simuler la génération du document
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(false);
    setGenerated(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/agent/dashboard')}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au tableau de bord
        </Button>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Génération de documents
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Sélectionnez un modèle de document à générer
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Liste des modèles */}
        <div className="lg:col-span-2">
          <Card>
            <div className="space-y-4">
              {documentTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`flex cursor-pointer items-start justify-between rounded-lg border p-4 transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
                      : 'border-neutral-200 hover:border-primary-200 dark:border-neutral-700 dark:hover:border-primary-800'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/30">
                      <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-white">
                        {template.name}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {template.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                          {template.category}
                        </span>
                        {template.lastGenerated && (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            Dernière génération : {template.lastGenerated}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <CheckCircle className="h-5 w-5 text-primary-500" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <Card title="Actions">
            <div className="space-y-4">
              <div className="rounded-lg bg-warning-50 p-4 dark:bg-warning-900/20">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-warning-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-warning-800 dark:text-warning-400">
                      Information
                    </h3>
                    <div className="mt-2 text-sm text-warning-700 dark:text-warning-300">
                      <p>
                        Assurez-vous que toutes les informations sont correctes avant de générer le document.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={!selectedTemplate || generating}
              >
                {generating ? (
                  'Génération en cours...'
                ) : generated ? (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </>
                ) : (
                  <>
                    <Printer className="mr-2 h-4 w-4" />
                    Générer le document
                  </>
                )}
              </Button>

              {generated && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setGenerated(false);
                    setSelectedTemplate(null);
                  }}
                >
                  Générer un autre document
                </Button>
              )}
            </div>
          </Card>

          <Card title="Instructions">
            <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <p>1. Sélectionnez un modèle de document dans la liste</p>
              <p>2. Vérifiez les informations du document</p>
              <p>3. Cliquez sur "Générer le document"</p>
              <p>4. Téléchargez le document généré</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GenerateDocument; 