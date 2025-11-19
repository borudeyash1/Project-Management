import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import AddClientModal from '../AddClientModal';
import { Client as ClientType } from '../../types';
import apiService from '../../services/api';
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  User,
  FolderKanban,
  X
} from 'lucide-react';

interface ClientView {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  contactPerson?: string;
  projectCount: number;
  totalRevenue: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const WorkspaceClients: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { workspaceId: routeWorkspaceId } = useParams<{ workspaceId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientView | null>(null);
  const [showClientProjects, setShowClientProjects] = useState(false);

  const workspaceId = routeWorkspaceId || state.currentWorkspace;
  const currentWorkspace = state.workspaces.find((w) => w._id === workspaceId);
  const isOwner = currentWorkspace?.owner === state.userProfile._id;

  // Load clients for this workspace from the backend so they persist in MongoDB
  useEffect(() => {
    const loadClients = async () => {
      if (!workspaceId) return;
      try {
        const clients = await apiService.getClients(workspaceId);
        dispatch({ type: 'SET_CLIENTS', payload: clients });
      } catch (error: any) {
        console.error('Failed to load workspace clients', error);
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            type: 'error',
            message: error?.message || 'Failed to load clients',
          },
        });
      }
    };

    loadClients();
  }, [workspaceId, dispatch]);

  // Derive clients for this workspace from global state
  const workspaceClients = (state.clients as ClientType[]).filter((client) => {
    if (!workspaceId) return true;
    return client.workspaceId === workspaceId;
  });

  const clients: ClientView[] = workspaceClients.map((client) => {
    const projectCount = state.projects.filter((p) => {
      const matchesWorkspace = !workspaceId || p.workspace === workspaceId;
      const clientId = (p.client as any)?._id ?? (p.client as any) ?? undefined;
      return matchesWorkspace && clientId === client._id;
    }).length;

    return {
      _id: client._id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      address: client.address,
      contactPerson: client.contactPerson,
      projectCount,
      totalRevenue: client.totalRevenue ?? 0,
      status: client.status,
      createdAt: client.createdAt,
    };
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Clients', value: clients.length, color: 'text-blue-600' },
    { label: 'Active', value: clients.filter(c => c.status === 'active').length, color: 'text-green-600' },
    { label: 'Total Projects', value: clients.reduce((sum, c) => sum + c.projectCount, 0), color: 'text-purple-600' },
    { label: 'Total Revenue', value: `$${(clients.reduce((sum, c) => sum + c.totalRevenue, 0) / 1000).toFixed(0)}k`, color: 'text-orange-600' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clients</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your workspace clients
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div
            key={client._id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{client.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    client.status === 'active' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    {client.status}
                  </span>
                </div>
              </div>
              {isOwner && (
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <MoreVertical className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {client.contactPerson && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4" />
                  <span>{client.contactPerson}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="truncate">{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{client.address}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => {
                    setSelectedClient(client);
                    setShowClientProjects(true);
                  }}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <FolderKanban className="w-4 h-4" />
                  <span>{client.projectCount} Projects</span>
                </button>
                <div className="font-semibold text-green-600">
                  ${(client.totalRevenue / 1000).toFixed(0)}k
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2 mt-4">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Briefcase className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No clients found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first client'}
          </p>
          {isOwner && !searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          )}
        </div>
      )}

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (clientData) => {
          if (!workspaceId) {
            dispatch({
              type: 'ADD_TOAST',
              payload: { type: 'error', message: 'No active workspace selected.' },
            });
            return;
          }

          try {
            const created = await apiService.createClient({
              name: clientData.name,
              email: clientData.email,
              phone: clientData.phone,
              company: clientData.company,
              website: clientData.website,
              address: clientData.address,
              contactPerson: clientData.contactPerson,
              notes: clientData.notes,
              workspaceId,
            });

            dispatch({ type: 'ADD_CLIENT', payload: created });

            dispatch({
              type: 'ADD_TOAST',
              payload: {
                type: 'success',
                message: `Client "${clientData.name}" added successfully!`,
              },
            });
          } catch (error: any) {
            console.error('Failed to create client', error);
            dispatch({
              type: 'ADD_TOAST',
              payload: {
                type: 'error',
                message: error?.message || 'Failed to create client',
              },
            });
          }
        }}
      />

      {/* Client Projects Modal */}
      {showClientProjects && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {selectedClient.name} - Projects
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedClient.company}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowClientProjects(false);
                  setSelectedClient(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {/* Mock projects for this client */}
                {state.projects.filter(p => (p.client as any)?._id === selectedClient._id || p.client === selectedClient._id).length === 0 ? (
                  <div className="text-center py-12">
                    <FolderKanban className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No projects yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      This client doesn't have any projects assigned
                    </p>
                  </div>
                ) : (
                  state.projects
                    .filter(p => (p.client as any)?._id === selectedClient._id || p.client === selectedClient._id)
                    .map(project => (
                      <div
                        key={project._id}
                        onClick={() => {
                          navigate(`/project-view/${project._id}`);
                          setShowClientProjects(false);
                        }}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {project.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {project.description}
                            </p>
                          </div>
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {project.status}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceClients;
