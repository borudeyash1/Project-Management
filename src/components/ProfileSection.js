import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const ProfileSection = () => {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState(state.userProfile);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const save = () => dispatch({ type: 'UPDATE_PROFILE', payload: form });

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center gap-3">
          <img className="h-14 w-14 rounded-full object-cover" src={form.avatarUrl} alt={form.fullName} />
          <div>
            <div className="text-[18px] tracking-tight font-semibold">{form.fullName}</div>
            <div className="text-sm text-slate-500">{form.designation} • {form.department}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {[
            {label:'Full Name', name:'fullName'},
            {label:'Email', name:'email'},
            {label:'Phone', name:'phone'},
            {label:'Designation', name:'designation'},
            {label:'Department', name:'department'},
            {label:'Location', name:'location'},
          ].map(f => (
            <div key={f.name}>
              <div className="text-sm font-medium">{f.label}</div>
              <input
                className="mt-1 w-full border border-border rounded-md p-2 text-sm"
                name={f.name}
                value={form[f.name]}
                onChange={onChange}
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <div className="text-sm font-medium">About</div>
            <textarea
              className="mt-1 w-full border border-border rounded-md p-2 text-sm"
              name="about"
              rows={4}
              value={form.about}
              onChange={onChange}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm" onClick={() => setForm(state.userProfile)}>Discard</button>
          <button className="px-3 py-2 rounded-lg text-white text-sm bg-yellow-500" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;


