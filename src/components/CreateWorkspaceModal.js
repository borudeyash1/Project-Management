import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Upload, QrCode, ShieldCheck } from 'lucide-react';

const CreateWorkspaceModal = () => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Company',
    description: '',
    organization: '',
    email: '',
    logo: null,
    regions: []
  });

  const showToast = (message, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegionChange = (e) => {
    const selectedRegions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({
      ...formData,
      regions: selectedRegions
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        logo: file
      });
      showToast('Logo uploaded', 'success');
    }
  };

  const setCwStep = (step) => {
    dispatch({ type: 'SET_CW_STEP', payload: step });
  };

  const cwNext = () => {
    if (state.cwStep === 1) {
      if (!formData.name || !formData.email) {
        showToast('Please enter name and contact email', 'warning');
        return;
      }
      setCwStep(2);
      return;
    }
    if (state.cwStep === 2) setCwStep(3);
  };

  const cwPrev = () => {
    if (state.cwStep > 1) setCwStep(state.cwStep - 1);
  };

  const finishWorkspace = () => {
    const initials = formData.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const newWorkspace = {
      name: formData.name,
      initials,
      type: formData.type
    };
    
    dispatch({ type: 'ADD_WORKSPACE', payload: newWorkspace });
    dispatch({ type: 'SET_WORKSPACE', payload: formData.name });
    dispatch({ type: 'TOGGLE_MODAL', payload: 'createWorkspace' });
    setCwStep(1);
    showToast('Workspace created', 'success');
    dispatch({ type: 'SET_SECTION', payload: 'workspaceOwner' });
  };

  const toggleModal = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: 'createWorkspace' });
  };

  if (!state.modals.createWorkspace) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={toggleModal}></div>
      <div className="relative w-full max-w-2xl bg-white rounded-xl border border-border shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-yellow-100"></div>
            <h2 className="text-[22px] tracking-tight font-semibold">Create Workspace</h2>
          </div>
          <button 
            className="p-2 rounded-md hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500" 
            onClick={toggleModal}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-5 pb-1">
          {/* Stepper */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div 
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                  state.cwStep >= 1 ? 'text-white bg-yellow-500' : 'text-slate-600 bg-slate-100'
                }`}
              >
                1
              </div>
              <span className="text-sm text-text-secondary">Details</span>
            </div>
            <div className="h-px flex-1 bg-border"></div>
            <div className="flex items-center gap-2">
              <div 
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                  state.cwStep >= 2 ? 'text-white bg-yellow-500' : 'text-slate-600 bg-slate-100'
                }`}
              >
                2
              </div>
              <span className="text-sm text-text-secondary">Verify</span>
            </div>
            <div className="h-px flex-1 bg-border"></div>
            <div className="flex items-center gap-2">
              <div 
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                  state.cwStep >= 3 ? 'text-white bg-yellow-500' : 'text-slate-600 bg-slate-100'
                }`}
              >
                3
              </div>
              <span className="text-sm text-text-secondary">Payment</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Step 1 */}
          {state.cwStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Workspace Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                  placeholder="e.g., NovaTech Studio"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Workspace Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                >
                  <option>Company</option>
                  <option>Agency</option>
                  <option>Startup</option>
                  <option>Personal</option>
                  <option>Non-profit</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                  placeholder="Summary of goals, scope, and purpose"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                  placeholder="Organization name"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Contact Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                  placeholder="name@company.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Logo/Icon</label>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg border border-border bg-slate-50 flex items-center justify-center text-slate-500">
                    <div className="w-5 h-5">🖼️</div>
                  </div>
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Upload</span>
                    <input type="file" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Region Visibility</label>
                <select
                  multiple
                  value={formData.regions}
                  onChange={handleRegionChange}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                >
                  <option>Global</option>
                  <option>United States</option>
                  <option>India</option>
                  <option>Europe</option>
                  <option>APAC</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {state.cwStep === 2 && (
            <div className="grid grid-cols-1 gap-4">
              <p className="text-sm text-slate-600">
                We sent a 6-digit code to <span className="font-medium">{formData.email || 'your email'}</span>. Enter it below to verify ownership.
              </p>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <input
                    key={i}
                    maxLength="1"
                    className="w-full aspect-square text-center rounded-lg border border-border text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button 
                  className="text-sm text-slate-600 hover:text-slate-800 hover:underline"
                  onClick={() => showToast('Code resent', 'info')}
                >
                  Resend code
                </button>
                <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" className="peer sr-only" />
                  <span className="relative inline-flex h-5 w-9 rounded-full bg-slate-200 transition-colors peer-checked:bg-yellow-500">
                    <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-all peer-checked:left-4"></span>
                  </span>
                  Trust this device
                </label>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {state.cwStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-4 bg-slate-50">
                <p className="text-sm text-slate-600 mb-2">Scan the QR to pay the setup fee</p>
                <div className="aspect-square rounded-lg border border-dashed border-border bg-white flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-14 h-14 mx-auto text-slate-500" />
                    <p className="text-xs text-slate-500 mt-2">Static amount</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border p-4 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Workspace</span>
                  <span className="text-sm font-medium">{formData.name || '-'}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-slate-600">Type</span>
                  <span className="text-sm font-medium">{formData.type || '-'}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-slate-600">Setup Fee</span>
                  <span className="text-sm font-semibold tracking-tight">$49.00</span>
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure payment. Auto-invoice via email.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <button 
            className="px-4 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
            onClick={cwPrev}
            disabled={state.cwStep === 1}
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <button 
              className="px-4 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm"
              onClick={toggleModal}
            >
              Cancel
            </button>
            {state.cwStep < 3 ? (
              <button 
                className="px-4 py-2 rounded-lg text-white text-sm shadow-sm hover:shadow focus-visible:outline-none focus-visible:ring-2 bg-yellow-500"
                onClick={cwNext}
              >
                Continue
              </button>
            ) : (
              <button 
                className="px-4 py-2 rounded-lg text-white text-sm shadow-sm hover:shadow focus-visible:outline-none focus-visible:ring-2 bg-yellow-500"
                onClick={finishWorkspace}
              >
                Create Workspace
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
