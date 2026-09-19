import { FormEvent, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Profile } from '../types';
import { ErrorBanner } from './Login';
import { Users, GraduationCap, UserPlus, Pencil, Trash2 } from 'lucide-react';

const departments = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'IT',
  'Data Science',
  'Artificial Intelligence',
  'AI',
  'Administration',
] as const;

const emptyForm = { name: '', email: '', temporaryPassword: '', department: 'Computer Science', designation: '', researchInterests: '' };

export default function AdminDashboard() {
  const [faculty, setFaculty] = useState<Profile[]>([]);
  const [counts, setCounts] = useState({ students: 0, faculty: 0 });
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const [overview, directory] = await Promise.all([api.getAdminOverview(), api.getAdminFaculty()]);
    setCounts(overview);
    setFaculty(directory);
  };
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      if (editing) {
        const updated = await api.updateFaculty(editing, {
          full_name: form.name, email: form.email, department: form.department,
          designation: form.designation,
          research_keywords: form.researchInterests.split(',').map((item) => item.trim()).filter(Boolean),
        });
        setFaculty((current) => current.map((member) => member.id === updated.id ? updated : member));
        setMessage('Faculty member updated.');
      } else {
        await api.createFaculty(form);
        await load();
        setMessage('Faculty member created.');
      }
      setForm(emptyForm);
      setEditing(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const startEdit = (member: Profile) => {
    setEditing(member.id);
    setForm({
      name: member.full_name, email: member.email, temporaryPassword: '',
      department: member.department || 'Computer Science', designation: member.designation || '',
      researchInterests: member.research_keywords.join(', '),
    });
    setMessage('');
  };

  const remove = async (member: Profile) => {
    if (!window.confirm(`Delete ${member.full_name}?`)) return;
    try {
      await api.deleteFaculty(member.id);
      setFaculty((current) => current.filter((item) => item.id !== member.id));
      setCounts((current) => ({ ...current, faculty: current.faculty - 1 }));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-neutral-900">Admin Control Panel</h1>
      <p className="mt-2 text-neutral-600">Manage faculty access and monitor the recommendation system.</p>
      {error && <div className="mt-4"><ErrorBanner message={error} /></div>}
      {message && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <StatCard icon={<GraduationCap />} label="Total Students" value={counts.students} />
        <StatCard icon={<Users />} label="Total Faculty" value={counts.faculty} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
        <section className="card p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
            <UserPlus className="h-5 w-5 text-primary-600" /> {editing ? 'Edit Faculty' : 'Add Faculty'}
          </h2>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
            <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
            {!editing && <Field label="Temporary Password" type="password" value={form.temporaryPassword} onChange={(value) => setForm({ ...form, temporaryPassword: value })} required />}
            <DepartmentSelect value={form.department} onChange={(value) => setForm({ ...form, department: value })} />
            <Field label="Designation" value={form.designation} onChange={(value) => setForm({ ...form, designation: value })} required />
            <Field label="Research Interests (comma separated)" value={form.researchInterests} onChange={(value) => setForm({ ...form, researchInterests: value })} />
            <div className="flex gap-2">
              <button className="btn-primary flex-1" type="submit">{editing ? 'Save Changes' : 'Create Faculty'}</button>
              {editing && <button type="button" className="btn-secondary" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}
            </div>
          </form>
        </section>

        <section className="card overflow-hidden">
          <div className="border-b border-neutral-100 px-6 py-5">
            <h2 className="text-lg font-bold text-neutral-900">Faculty Directory</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {faculty.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div>
                  <p className="font-semibold text-neutral-900">{member.full_name}</p>
                  <p className="text-sm text-neutral-500">{member.email} · {member.designation}</p>
                  <p className="text-xs text-neutral-400">{member.department}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button className="btn-secondary !p-2" aria-label={`Edit ${member.full_name}`} onClick={() => startEdit(member)}><Pencil className="h-4 w-4" /></button>
                  <button className="btn-secondary !p-2 text-rose-600" aria-label={`Delete ${member.full_name}`} onClick={() => remove(member)}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {!faculty.length && <p className="px-6 py-8 text-center text-sm text-neutral-500">No faculty accounts yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="block text-sm font-semibold text-neutral-700">{label}<input className="input mt-1" type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} /></label>;
}

function DepartmentSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-semibold text-neutral-700">
      Department
      <select className="input mt-1" value={value} required onChange={(event) => onChange(event.target.value)}>
        {departments.map((department) => <option key={department} value={department}>{department}</option>)}
      </select>
    </label>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="card flex items-center gap-4 p-5"><div className="rounded-xl bg-primary-50 p-3 text-primary-600">{icon}</div><div><p className="text-sm text-neutral-500">{label}</p><p className="text-2xl font-bold text-neutral-900">{value}</p></div></div>;
}
