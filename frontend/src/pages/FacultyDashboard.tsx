import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { ResearchArea, FacultyResearchArea, FacultySlot, SupervisionRequest } from '../types';
import ResearchAreaSelector from '../components/ResearchAreaSelector';
import { Save, CheckCircle2, Users, BookOpen, SlidersHorizontal, Minus, Plus, FileText, Clock, Sparkles, X } from 'lucide-react';

export default function FacultyDashboard() {
  const { profile, refreshProfile } = useAuth();
  const [areas, setAreas] = useState<ResearchArea[]>([]);
  const [fra, setFra] = useState<FacultyResearchArea[]>([]);
  const [slot, setSlot] = useState<FacultySlot | null>(null);
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [department, setDepartment] = useState(profile?.department ?? '');
  const [officeHours, setOfficeHours] = useState(profile?.office_hours ?? '');
  const [courses, setCourses] = useState((profile?.courses ?? []).join('\n'));
  const [publications, setPublications] = useState((profile?.publications ?? []).join('\n'));
  const [keywords, setKeywords] = useState((profile?.research_keywords ?? []).join(', '));
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAreas, setSavingAreas] = useState(false);
  const [savingSlots, setSavingSlots] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [requests, setRequests] = useState<SupervisionRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<SupervisionRequest[]>([]);
  const [reviewing, setReviewing] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [totalSlots, setTotalSlots] = useState(0);
  const [takenSlots, setTakenSlots] = useState(0);

  const loadPendingRequests = useCallback(async () => {
    if (!profile) return;
    try {
      const [requestData, approvedData, slotData] = await Promise.all([
        api.getPendingSupervisionRequests(),
        api.getApprovedSupervisionRequests(),
        api.getFacultySlot(profile.id),
      ]);
      setRequests((current) => {
        const unchanged = current.length === requestData.length
          && current.every((request, index) => (
            request.id === requestData[index].id
            && request.status === requestData[index].status
          ));
        return unchanged ? current : requestData;
      });
      setApprovedRequests((current) => {
        const unchanged = current.length === approvedData.length
          && current.every((request, index) => request.id === approvedData[index].id);
        return unchanged ? current : approvedData;
      });
      if (slotData) {
        setSlot(slotData);
        setTotalSlots(slotData.total_slots);
        setTakenSlots(slotData.taken_slots);
      }
    } catch (err) {
      console.error('Failed to refresh pending requests:', (err as Error).message);
    }
  }, [profile]);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [areasData, slotData, myAreasData, requestData, approvedData] = await Promise.all([
        api.getResearchAreas(),
        api.getFacultySlot(profile.id),
        api.getMyFacultyResearchAreas(),
        api.getPendingSupervisionRequests(),
        api.getApprovedSupervisionRequests(),
      ]);
      setAreas(areasData);
      setBio(profile.bio ?? '');
      setDepartment(profile.department ?? '');
      setOfficeHours(profile.office_hours ?? '');
      setCourses((profile.courses ?? []).join('\n'));
      setPublications((profile.publications ?? []).join('\n'));
      setKeywords((profile.research_keywords ?? []).join(', '));

      setFra(myAreasData);
      setSelectedIds(myAreasData.map((i) => i.research_area_id));
      setWeights(Object.fromEntries(myAreasData.map((i) => [i.research_area_id, i.weight])));

      setSlot(slotData);
      setTotalSlots(slotData?.total_slots ?? 0);
      setTakenSlots(slotData?.taken_slots ?? 0);
      setRequests(requestData);
      setApprovedRequests(approvedData);
    } catch (err) {
      console.error('Failed to load:', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!profile) return;
    const refresh = window.setInterval(loadPendingRequests, 10000);
    return () => window.clearInterval(refresh);
  }, [loadPendingRequests, profile]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleToggle = (id: string) => {
    setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
    setWeights((p) => ({ ...p, [id]: p[id] ?? 3 }));
  };

  const handleSaveAreas = async () => {
    setSavingAreas(true);
    try {
      const updated = await api.saveFacultyResearchAreas(
        selectedIds.map((id) => ({ research_area_id: id, weight: weights[id] ?? 3 })),
      );
      setFra(updated);
      setSelectedIds(updated.map((i) => i.research_area_id));
      setWeights(Object.fromEntries(updated.map((i) => [i.research_area_id, i.weight])));
      flash('Research areas saved.');
    } catch (err) {
      flash('Error: ' + (err as Error).message);
    }
    setSavingAreas(false);
  };

  const handleSaveSlots = async () => {
    setSavingSlots(true);
    try {
      const updated = await api.saveFacultySlot(totalSlots, takenSlots);
      setSlot(updated);
      flash('Availability saved.');
    } catch (err) {
      flash('Error: ' + (err as Error).message);
    }
    setSavingSlots(false);
  };

  const splitLines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);
  const splitCommas = (s: string) => s.split(',').map((l) => l.trim()).filter(Boolean);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.updateMe({
        bio,
        department,
        office_hours: officeHours,
        courses: splitLines(courses),
        publications: splitLines(publications),
        research_keywords: splitCommas(keywords),
      });
      await refreshProfile();
      flash('Profile updated.');
    } catch (err) {
      flash('Error: ' + (err as Error).message);
    }
    setSavingProfile(false);
  };

  const reviewRequest = async (id: string, status: 'approved' | 'denied') => {
    setReviewing(id);
    try {
      const updatedRequest = await api.updateSupervisionRequestStatus(id, status);
      setRequests((current) => current.filter((request) => request.id !== id));
      if (status === 'approved') {
        setApprovedRequests((current) => [...current, updatedRequest]);
        setTakenSlots((value) => value + 1);
        flash('Application approved.');
      } else {
        flash('Application denied.');
      }
    } catch (err) {
      flash('Error: ' + (err as Error).message);
    } finally {
      setReviewing(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="skeleton h-10 w-48" />
        <div className="skeleton mt-3 h-5 w-80" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="skeleton h-64" />
          <div className="skeleton h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }

  const available = Math.max(0, totalSlots - takenSlots);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-neutral-900">Faculty Profile</h1>
        <p className="mt-2 text-neutral-600">Manage your research areas, publications, courses, availability, and public profile.</p>
      </div>

      {msg && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 animate-slide-up">
          <CheckCircle2 className="h-4 w-4" /> {msg}
        </div>
      )}

      <section className="mt-6 card p-6 animate-slide-up shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-neutral-900"><Users className="h-5 w-5 text-primary-600" /> Student applications</h2>
            <p className="mt-1 text-sm text-neutral-500">Review solo and group project requests for your available slots.</p>
          </div>
          <span className="badge bg-amber-50 text-amber-700">{requests.length} pending</span>
        </div>
        {requests.length === 0 ? (
          <p className="mt-5 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-500">No pending applications.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="rounded-xl border border-neutral-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-neutral-900">{request.student?.full_name || request.student_details?.full_name} · {request.project_mode}</p>
                    <p className="mt-1 text-sm text-neutral-500">Student Email: {request.student?.email || request.student_email}</p>
                    <p className="text-sm text-neutral-500">Student ID: {request.student_id}</p>
                    <p className="mt-1 text-sm font-medium text-neutral-700">Project Title: {request.project_title}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => reviewRequest(request.id, 'approved')} disabled={reviewing === request.id} className="btn-primary !bg-emerald-600 !px-3 !py-2 text-sm"><CheckCircle2 className="h-4 w-4" />Approve</button>
                    <button onClick={() => reviewRequest(request.id, 'denied')} disabled={reviewing === request.id} className="btn-secondary !border-rose-200 !px-3 !py-2 text-sm !text-rose-700"><X className="h-4 w-4" />Deny</button>
                  </div>
                </div>
                {request.project_mode === 'Group' && <p className="mt-3 text-sm text-neutral-600"><span className="font-semibold">Group members:</span> {request.group_members.join(', ')}</p>}
                <p className="mt-3 flex gap-2 text-sm leading-relaxed text-neutral-600"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" /><span><span className="font-semibold">Proposal:</span> {request.project_proposal}</span></p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Profile section */}
        <section className="card p-6 animate-slide-up shadow-soft lg:col-span-1">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-neutral-900">
            <Users className="h-5 w-5 text-primary-600" /> Profile
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Department</label>
              <input className="input" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Computer Science" />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea className="input min-h-[80px] resize-y" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Brief description of your research and teaching." />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Office hours</label>
              <input className="input" value={officeHours} onChange={(e) => setOfficeHours(e.target.value)} placeholder="Mon 2-4pm, Wed 10am-12pm, Room CS-301" />
            </div>
            <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary w-full">
              <Save className="h-4 w-4" /> {savingProfile ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </section>

        {/* Availability + keywords + publications + courses */}
        <section className="card p-6 animate-slide-up stagger-1 shadow-soft lg:col-span-2">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-neutral-900">
            <SlidersHorizontal className="h-5 w-5 text-primary-600" /> Supervision availability
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SlotCounter label="Total slots" value={totalSlots} setValue={setTotalSlots} min={0} max={20} />
            <SlotCounter label="Already taken" value={takenSlots} setValue={setTakenSlots} min={0} max={totalSlots} />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-50 p-4">
            <span className="text-sm font-medium text-neutral-600">Available slots</span>
            <span className={`text-2xl font-bold ${available > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {available > 0 ? `${available} Slots Remaining` : '0 Slots Remaining - Quota Full'}
            </span>
          </div>
          <div className="mt-4 rounded-xl border border-neutral-200 p-4">
            <p className="text-sm font-semibold text-neutral-700">
              {takenSlots} of {totalSlots} Slots Filled
            </p>
            {approvedRequests.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500">No approved applications yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {approvedRequests.map((request, index) => (
                  <p key={request.id} className="text-sm text-neutral-600">
                    <span className="font-semibold">Slot {index + 1}: Approved - </span>
                    {request.student?.full_name || request.student_details?.full_name || request.student_email}
                    {' '}({request.project_title} · {request.project_mode})
                  </p>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleSaveSlots} disabled={savingSlots} className="btn-primary mt-4 w-full">
            <Save className="h-4 w-4" /> {savingSlots ? 'Saving…' : 'Save availability'}
          </button>

          <hr className="my-6 border-neutral-100" />

          {/* Keywords */}
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-neutral-900">
            <Sparkles className="h-4 w-4 text-accent-500" /> Research keywords
          </h3>
          <p className="mt-1 text-xs text-neutral-500">Comma-separated. These power the topic-based matching engine.</p>
          <input className="input mt-2" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="deep learning, computer vision, NLP" />

          {/* Publications */}
          <h3 className="mt-5 flex items-center gap-2 font-display text-base font-bold text-neutral-900">
            <FileText className="h-4 w-4 text-primary-500" /> Publications
          </h3>
          <p className="mt-1 text-xs text-neutral-500">One per line.</p>
          <textarea className="input mt-2 min-h-[80px] resize-y font-mono text-xs" value={publications} onChange={(e) => setPublications(e.target.value)} placeholder={'Smith, J. et al. "Paper Title" — Conference 2024'} />

          {/* Courses */}
          <h3 className="mt-5 flex items-center gap-2 font-display text-base font-bold text-neutral-900">
            <BookOpen className="h-4 w-4 text-primary-500" /> Courses taught
          </h3>
          <p className="mt-1 text-xs text-neutral-500">One per line.</p>
          <textarea className="input mt-2 min-h-[60px] resize-y" value={courses} onChange={(e) => setCourses(e.target.value)} placeholder={'CS 445: Deep Learning'} />

          <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary mt-5 w-full">
            <Save className="h-4 w-4" /> {savingProfile ? 'Saving…' : 'Save keywords, publications & courses'}
          </button>
        </section>
      </div>

      {/* Research areas */}
      <section className="mt-6 card p-6 animate-slide-up stagger-2 shadow-soft">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-neutral-900">
          <BookOpen className="h-5 w-5 text-primary-600" /> Your research areas
        </h2>
        <p className="mt-1 text-sm text-neutral-500">Select the areas you supervise and weight your expertise (1-5).</p>
        <div className="mt-4">
          <ResearchAreaSelector
            areas={areas}
            selectedIds={selectedIds}
            weights={weights}
            onToggle={handleToggle}
            onWeightChange={(id, w) => setWeights((p) => ({ ...p, [id]: w }))}
          />
        </div>
        <button onClick={handleSaveAreas} disabled={savingAreas} className="btn-primary mt-6">
          <Save className="h-4 w-4" /> {savingAreas ? 'Saving…' : 'Save research areas'}
        </button>
      </section>
    </div>
  );
}

function SlotCounter({ label, value, setValue, min, max }: {
  label: string; value: number; setValue: (n: number) => void; min: number; max: number;
}) {
  const dec = () => setValue(Math.max(min, value - 1));
  const inc = () => setValue(Math.min(max, value + 1));
  return (
    <div className="rounded-xl border border-neutral-200 p-4 transition-colors hover:border-neutral-300">
      <p className="text-sm font-semibold text-neutral-700">{label}</p>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={dec} className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-all hover:bg-neutral-200 active:scale-95">
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center font-display text-2xl font-bold text-neutral-900">{value}</span>
        <button onClick={inc} className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-all hover:bg-neutral-200 active:scale-95">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
