import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { FacultyWithDetails, SupervisionRequest } from '../types';
import { getInitials, avatarColorFor } from '../lib/utils';
import { CheckCircle2, FileText, Users, X } from 'lucide-react';

export default function ListOfSupervisions() {
  const [faculty, setFaculty] = useState<FacultyWithDetails[]>([]);
  const [requests, setRequests] = useState<SupervisionRequest[]>([]);
  const [selected, setSelected] = useState<FacultyWithDetails | null>(null);
  const [mode, setMode] = useState<'Solo' | 'Group'>('Solo');
  const [members, setMembers] = useState<string[]>(['']);
  const [proposal, setProposal] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [facultyData, requestData] = await Promise.all([
        api.getFaculty(),
        api.getMySupervisionRequests(),
      ]);
      setFaculty(facultyData);
      setRequests(requestData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      const created = await api.createSupervisionRequest({
        faculty_id: selected.id,
        project_mode: mode,
        group_members: mode === 'Group' ? members : [],
        project_title: projectTitle.trim(),
        project_proposal: proposal,
      });
      setRequests((current) => [created, ...current]);
      setSelected(null);
      setProposal('');
      setProjectTitle('');
      setMembers(['']);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-8"><div className="skeleton h-10 w-72" /><div className="mt-6 grid gap-4 md:grid-cols-2"><div className="skeleton h-48" /><div className="skeleton h-48" /></div></div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-neutral-900">List of Supervisions</h1>
      <p className="mt-2 text-neutral-600">Review supervisors, their expertise, and open supervision slots before applying.</p>

      {error && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {faculty.map((item) => {
          const available = Math.max(0, (item.slot?.total_slots ?? 0) - (item.slot?.taken_slots ?? 0));
          const activeRequest = requests.find((request) => request.faculty_id === item.id && ['pending', 'approved'].includes(request.status));
          return (
            <article key={item.id} className="card p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white ${avatarColorFor(item.id)}`}>{getInitials(item.full_name)}</div>
                <div>
                  <h2 className="font-display font-bold text-neutral-900">{item.full_name}</h2>
                  <p className="text-xs text-neutral-500">{item.department || 'Faculty supervisor'}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-neutral-600">{item.bio || 'Research and project supervision available.'}</p>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Domain expertise</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.research_areas.map((area) => <span key={area.id} className="badge bg-primary-50 text-primary-700">{area.research_area?.name}</span>)}
                  {item.research_keywords.slice(0, 4).map((keyword) => <span key={keyword} className="badge bg-accent-50 text-accent-700">{keyword}</span>)}
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
                <span className={`text-sm font-bold ${available > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{available} open slot{available === 1 ? '' : 's'}</span>
                {activeRequest ? (
                  <span className={`badge ${activeRequest.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{activeRequest.status}</span>
                ) : (
                  <button onClick={() => setSelected(item)} disabled={available === 0} className="btn-primary !px-3 !py-2 text-sm">Apply</button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4">
          <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-neutral-900">Apply to {selected.full_name}</h2>
              <button onClick={() => setSelected(null)} className="btn-ghost !px-2"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5">
              <label className="label">Project title</label>
              <input className="input" required value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="Enter a project title." />
            </div>
            <div className="mt-5">
              <label className="label">Project mode</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Solo', 'Group'] as const).map((option) => <button key={option} onClick={() => setMode(option)} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${mode === option ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600'}`}><Users className="mr-2 inline h-4 w-4" />{option}</button>)}
              </div>
            </div>
            {mode === 'Group' && (
              <div className="mt-5">
                <label className="label">Group member IDs or emails</label>
                <div className="space-y-2">
                  {members.map((member, index) => (
                    <div key={index} className="flex gap-2">
                      <input className="input" value={member} placeholder="student ID or email" onChange={(e) => setMembers((current) => current.map((value, i) => i === index ? e.target.value : value))} />
                      <button type="button" onClick={() => setMembers((current) => current.filter((_, i) => i !== index))} className="btn-secondary !px-3"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setMembers((current) => [...current, ''])} className="mt-2 text-sm font-semibold text-primary-600">+ Add member</button>
              </div>
            )}
            <div className="mt-5">
              <label className="label">Project proposal</label>
              <textarea className="input min-h-[120px] resize-y" value={proposal} onChange={(e) => setProposal(e.target.value)} placeholder="Describe your proposed project and goals." />
            </div>
            <button onClick={submit} disabled={saving} className="btn-primary mt-5 w-full"><FileText className="h-4 w-4" />{saving ? 'Submitting…' : 'Submit application'}</button>
          </div>
        </div>
      )}

      {requests.length > 0 && (
        <section className="mt-10 card p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-neutral-900"><CheckCircle2 className="h-5 w-5 text-primary-600" />Your requests</h2>
          <div className="mt-4 space-y-3">
            {requests.map((request) => <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-50 p-4"><div><p className="font-semibold text-neutral-800">{request.faculty?.full_name} · {request.project_mode}</p><p className="text-sm text-neutral-500">{request.project_proposal}</p></div><span className={`badge ${request.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : request.status === 'denied' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{request.status}</span></div>)}
          </div>
        </section>
      )}
    </div>
  );
}
