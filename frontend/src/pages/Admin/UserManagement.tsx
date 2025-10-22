import { useState, useEffect } from 'react';
import { 
  Search,
  Edit,
  Trash2,
  Shield,
  User,
  UserCheck,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import userService, { UserData } from '../../services/userService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserData['role'] | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserData>>({});
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await userService.deleteUser(userId);
        toast.success('Utilisateur supprimé avec succès');
        fetchUsers(); // Rafraîchir la liste
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setEditedUser(user);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditUser = () => {
    setIsEditing(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    try {
      await userService.updateUser(selectedUser._id, editedUser);
      toast.success('Utilisateur modifié avec succès');
      setIsModalOpen(false);
      setIsEditing(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Erreur lors de la modification de l\'utilisateur');
    }
  };

  const handleToggleActive = async () => {
    if (!selectedUser) return;
    
    try {
      await userService.updateUser(selectedUser._id, { isActive: !selectedUser.isActive });
      toast.success(`Utilisateur ${!selectedUser.isActive ? 'activé' : 'désactivé'} avec succès`);
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setIsEditing(false);
    setEditedUser({});
  };

  const filteredUsers = users
    .filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });

  const getRoleBadge = (role: UserData['role']) => {
    const roleConfig = {
      admin: { color: 'error', icon: Shield, text: 'Administrateur' },
      agent: { color: 'warning', icon: UserCheck, text: 'Agent' },
      citizen: { color: 'primary', icon: User, text: 'Citoyen' },
    };

    const config = roleConfig[role];
    return (
      <span className={`inline-flex items-center rounded-full bg-${config.color}-100 px-2.5 py-0.5 text-xs font-medium text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
        <config.icon className="mr-1 h-3 w-3" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Gestion des utilisateurs
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Gérez les utilisateurs du système
          </p>
        </div>
        <Button onClick={() => navigate('/admin/users/create-agent')}>
          Créer un agent
        </Button>
      </div>

      <Card>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserData['role'] | 'all')}
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="agent">Agents</option>
              <option value="citizen">Citoyens</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Rôle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Date de création
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Chargement des utilisateurs...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-neutral-900 dark:text-white">
                      {`${user.firstName} ${user.lastName}`}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400'
                          : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400'
                      }`}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                          title="Voir les détails"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-error-600 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-error-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de détails/modification */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-neutral-800 shadow-xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-700 dark:bg-neutral-800">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                {isEditing ? 'Modifier l\'utilisateur' : 'Détails de l\'utilisateur'}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Informations personnelles */}
              <div>
                <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
                  Informations personnelles
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Prénom
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.firstName || ''}
                        onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-sm text-neutral-900 dark:text-white">{selectedUser.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Nom
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.lastName || ''}
                        onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-sm text-neutral-900 dark:text-white">{selectedUser.lastName}</p>
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
                        value={editedUser.email || ''}
                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-sm text-neutral-900 dark:text-white">{selectedUser.email}</p>
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
                        value={editedUser.phoneNumber || ''}
                        onChange={(e) => setEditedUser({ ...editedUser, phoneNumber: e.target.value })}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-sm text-neutral-900 dark:text-white">{selectedUser.phoneNumber || 'Non spécifié'}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Rôle
                    </label>
                    {isEditing ? (
                      <select
                        value={editedUser.role || selectedUser.role}
                        onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value as UserData['role'] })}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      >
                        <option value="citizen">Citoyen</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    ) : (
                      <div>{getRoleBadge(selectedUser.role)}</div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Adresse
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.address || ''}
                        onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-sm text-neutral-900 dark:text-white">{selectedUser.address || 'Non spécifiée'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations système */}
              <div className="border-t border-neutral-200 pt-6 dark:border-neutral-700">
                <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
                  Informations système
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Statut
                    </label>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedUser.isActive
                        ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400'
                        : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400'
                    }`}>
                      {selectedUser.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Date de création
                    </label>
                    <p className="text-sm text-neutral-900 dark:text-white">
                      {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      ID Utilisateur
                    </label>
                    <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">{selectedUser._id}</p>
                  </div>

                  {selectedUser.commune && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Commune assignée
                      </label>
                      <p className="text-sm text-neutral-900 dark:text-white">
                        {typeof selectedUser.commune === 'string' ? selectedUser.commune : selectedUser.commune.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-between border-t border-neutral-200 bg-white px-6 py-4 dark:border-neutral-700 dark:bg-neutral-800">
              <Button
                variant="outline"
                onClick={handleToggleActive}
              >
                {selectedUser.isActive ? 'Désactiver' : 'Activer'}
              </Button>
              
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSaveUser}>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={closeModal}>
                      Fermer
                    </Button>
                    <Button onClick={handleEditUser}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;