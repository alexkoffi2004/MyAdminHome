import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield,
  Calendar,
  Edit,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Briefcase,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  commune?: string | { _id: string; name: string };
  role: string;
  isActive: boolean;
  createdAt: string;
  maxDailyRequests?: number;
  dailyRequestCount?: number;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AgentProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    commune: user?.commune || '',
    role: user?.role || '',
    isActive: user?.isActive || true,
    createdAt: user?.createdAt || new Date().toISOString(),
    maxDailyRequests: user?.maxDailyRequests || 20,
    dailyRequestCount: user?.dailyRequestCount || 0
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<{
    profile?: string;
    password?: string;
  }>({});

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        commune: user.commune || '',
        role: user.role || '',
        isActive: user.isActive || true,
        createdAt: user.createdAt || new Date().toISOString(),
        maxDailyRequests: user.maxDailyRequests || 20,
        dailyRequestCount: user.dailyRequestCount || 0
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Annuler les modifications
      setProfileData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        address: user?.address || '',
        commune: user?.commune || '',
        role: user?.role || '',
        isActive: user?.isActive || true,
        createdAt: user?.createdAt || new Date().toISOString(),
        maxDailyRequests: user?.maxDailyRequests || 20,
        dailyRequestCount: user?.dailyRequestCount || 0
      });
      setErrors({});
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Validation
      if (!profileData.firstName || !profileData.lastName) {
        setErrors({ profile: 'Le prénom et le nom sont requis' });
        return;
      }

      if (!profileData.email) {
        setErrors({ profile: 'L\'email est requis' });
        return;
      }

      // Mettre à jour le profil
      await userService.updateUser(user!._id, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address
      });

      // Mettre à jour le contexte
      if (updateUser) {
        updateUser({
          ...user!,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phoneNumber: profileData.phoneNumber,
          address: profileData.address
        });
      }

      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrors({ profile: error.response?.data?.message || 'Erreur lors de la mise à jour du profil' });
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Validation
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setErrors({ password: 'Tous les champs sont requis' });
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setErrors({ password: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setErrors({ password: 'Les mots de passe ne correspondent pas' });
        return;
      }

      // Appeler l'API pour changer le mot de passe
      // Note: Vous devrez créer cette route dans votre backend
      await userService.updateUser(user!._id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('Mot de passe modifié avec succès');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      setErrors({ password: error.response?.data?.message || 'Erreur lors du changement de mot de passe' });
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const getCommuneName = () => {
    if (!profileData.commune) return 'Non assignée';
    if (typeof profileData.commune === 'string') return profileData.commune;
    return profileData.commune.name;
  };

  const getProgressPercentage = () => {
    if (!profileData.maxDailyRequests) return 0;
    return Math.round((profileData.dailyRequestCount || 0) / profileData.maxDailyRequests * 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Mon Profil</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Gérez vos informations personnelles et vos paramètres
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <Card 
            title="Informations personnelles"
            headerAction={
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditToggle}
              >
                {isEditing ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </>
                )}
              </Button>
            }
          >
            {errors.profile && (
              <div className="mb-4 rounded-md bg-error-50 p-3 dark:bg-error-900/20">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-error-500" />
                  <p className="ml-2 text-sm text-error-700 dark:text-error-300">{errors.profile}</p>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Prénom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                ) : (
                  <p className="text-sm text-neutral-900 dark:text-white">{profileData.firstName}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Nom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                ) : (
                  <p className="text-sm text-neutral-900 dark:text-white">{profileData.lastName}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                ) : (
                  <p className="text-sm text-neutral-900 dark:text-white">{profileData.email}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Téléphone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                ) : (
                  <p className="text-sm text-neutral-900 dark:text-white">{profileData.phoneNumber || 'Non spécifié'}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <Building2 className="inline h-4 w-4 mr-1" />
                  Commune assignée
                </label>
                <p className="text-sm text-neutral-900 dark:text-white">{getCommuneName()}</p>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Adresse
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                ) : (
                  <p className="text-sm text-neutral-900 dark:text-white">{profileData.address || 'Non spécifiée'}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-4 flex justify-end">
                <Button onClick={handleSaveProfile} disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            )}
          </Card>

          {/* Sécurité */}
          <Card title="Sécurité">
            {!isChangingPassword ? (
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Modifiez votre mot de passe pour sécuriser votre compte
                </p>
                <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                  <Lock className="mr-2 h-4 w-4" />
                  Changer le mot de passe
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {errors.password && (
                  <div className="rounded-md bg-error-50 p-3 dark:bg-error-900/20">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-error-500" />
                      <p className="ml-2 text-sm text-error-700 dark:text-error-300">{errors.password}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">Minimum 6 caractères</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setErrors({});
                  }}>
                    Annuler
                  </Button>
                  <Button onClick={handleChangePassword} disabled={loading}>
                    {loading ? 'Modification...' : 'Modifier le mot de passe'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statut du compte */}
          <Card title="Statut du compte">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Rôle</span>
                <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                  <Shield className="mr-1 h-3 w-3" />
                  Agent
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Statut</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  profileData.isActive
                    ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400'
                    : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400'
                }`}>
                  {profileData.isActive ? (
                    <>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Actif
                    </>
                  ) : (
                    'Inactif'
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Membre depuis</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  {format(new Date(profileData.createdAt), 'MMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>
          </Card>

          {/* Quota journalier */}
          <Card title="Quota journalier">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Demandes traitées</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {profileData.dailyRequestCount} / {profileData.maxDailyRequests}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className={`h-full transition-all ${
                      getProgressPercentage() >= 90
                        ? 'bg-error-500'
                        : getProgressPercentage() >= 70
                        ? 'bg-warning-500'
                        : 'bg-success-500'
                    }`}
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  {getProgressPercentage()}% de votre quota utilisé
                </p>
              </div>

              {getProgressPercentage() >= 90 && (
                <div className="rounded-md bg-warning-50 p-3 dark:bg-warning-900/20">
                  <p className="text-xs text-warning-700 dark:text-warning-300">
                    Vous approchez de votre limite quotidienne
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Informations système */}
          <Card title="Informations système">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">ID Utilisateur</p>
                <p className="mt-1 text-xs font-mono text-neutral-900 dark:text-white break-all">
                  {user?._id}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Date de création</p>
                <p className="mt-1 text-sm text-neutral-900 dark:text-white">
                  {format(new Date(profileData.createdAt), 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentProfile;
