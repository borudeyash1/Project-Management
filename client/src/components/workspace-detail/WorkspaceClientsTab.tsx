import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Briefcase, Edit, Trash2, X, Mail, Phone, Globe, MapPin, Building } from 'lucide-react';
import { Client } from '../../types';
import apiService from '../../services/api';

interface WorkspaceClientsTabProps {
  workspaceId: string;
  isWorkspaceOwner?: boolean;
}

const WorkspaceClientsTab: React.FC<WorkspaceClientsTabProps> = ({ 
  workspaceId, 
  isWorkspaceOwner = false 
}) => {
  const { state, dispatch } = useApp();
  const allClients = (state.clients || []) as Client[];
  const clients = allClients.filter((client) => client.workspaceId === workspaceId);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    website: '',
    notes: ''
  });

  const resetForm = () => {
    setClientForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      website: '',
      notes: ''
    });
    setEditingClient(null);
  };

  // Load clients for this workspace from backend
  useEffect(() => {
    const loadClients = async () => {
      try {
        const clients = await apiService.getClients(workspaceId);
        dispatch({ type: 'SET_CLIENTS', payload: clients });
      } catch (error: any) {
        console.error('Failed to load workspace clients', error);
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'error',
            message: error?.message || 'Failed to load clients',
            duration: 3000,
          },
        });
      }
    };

    loadClients();
  }, [workspaceId, dispatch]);

  const handleAddClient = async () => {
    if (!clientForm.name.trim() || !clientForm.email.trim()) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Please fill in required fields (Name and Email)',
          duration: 3000
        }
      });
      return;
    }

    try {
      if (editingClient) {
        const updated = await apiService.updateClient(editingClient._id, { ...clientForm });
        dispatch({
          type: 'UPDATE_CLIENT',
          payload: {
            clientId: editingClient._id,
            updates: updated,
          },
        });
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'success',
            message: 'Client updated successfully!',
            duration: 3000,
          },
        });
      } else {
        const created = await apiService.createClient({
          ...clientForm,
          workspaceId,
        });
        dispatch({
          type: 'ADD_CLIENT',
          payload: created,
        });
        dispatch({
          type: 'ADD_TOAST',
          payload: {
            id: Date.now().toString(),
            type: 'success',
            message: 'Client created successfully!',
            duration: 3000,
          },
        });
      }
    } catch (error: any) {
      console.error('Failed to save client', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error?.message || 'Failed to save client',
          duration: 3000,
        },
      });
      return;
    }
    
    resetForm();
    setShowAddModal(false);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      address: client.address || '',
      website: client.website || '',
      notes: client.notes || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteClient(clientId);
      dispatch({
        type: 'DELETE_CLIENT',
        payload: clientId,
      });
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Client deleted successfully',
          duration: 3000,
        },
      });
    } catch (error: any) {
      console.error('Failed to delete client', error);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: error?.message || 'Failed to delete client',
          duration: 3000,
        },
      });
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Clients</h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage client profiles and associate them with projects
            </p>
          </div>
          {isWorkspaceOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          )}
        </div>

        {/* Clients Grid */}
        {clients.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="font-medium">No clients yet</p>
            <p className="text-sm mt-1">Add a client to start creating projects for them</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <div key={client._id} className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      // Store client filter and switch to projects tab
                      sessionStorage.setItem('selectedClientId', client._id);
                      sessionStorage.setItem('selectedClientName', client.name);
                      // Trigger navigation to projects tab
                      window.dispatchEvent(new CustomEvent('switchToProjectsTab', { detail: { clientId: client._id } }));
                    }}
                  >
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 group-hover:text-accent-dark transition-colors">
                      <Briefcase className="w-4 h-4 text-accent-dark" />
                      {client.name}
                    </h4>
                    {client.company && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Building className="w-3 h-3" />
                        {client.company}
                      </p>
                    )}
                    <p className="text-xs text-accent-dark mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to view projects →
                    </p>
                  </div>
                  {isWorkspaceOwner && (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClient(client);
                        }}
                        className="text-accent-dark hover:text-blue-700 p-1"
                        title="Edit Client"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client._id);
                        }}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete Client"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-3 h-3" />
                      {client.phone}
                    </div>
                  )}
                  {client.website && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe className="w-3 h-3" />
                      <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-accent-dark hover:underline truncate">
                        {client.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-3 h-3 mt-0.5" />
                      <span className="text-xs">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingClient ? 'Edit Client' : 'Add Client'}
              </h3>
              <button onClick={handleCloseModal}>
                <X className="w-5 h-5 text-gray-600 hover:text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={clientForm.company}
                    onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={clientForm.website}
                  onChange={(e) => setClientForm({ ...clientForm, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Additional notes about the client..."
                />
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClient}
                  className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover transition-colors"
                >
                  {editingClient ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceClientsTab;
