import { VolunteerForm } from "@/components/volunteers/volunteer-form";

export default function VolunteerPage() {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
          Community Extension Services
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Become a Volunteer
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          CES volunteer registration demonstration.
        </p>
      </header>

      <aside className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <p className="font-semibold">Classroom/local demonstration using synthetic test information only.</p>
        <p className="mt-2">Do not enter real personal information. Real-data collection and public production deployment are not approved.</p>
      </aside>
      <section aria-labelledby="volunteer-use-heading" className="my-6 rounded-xl bg-sky-50 p-4 text-sm leading-6 text-slate-700">
        <h2 id="volunteer-use-heading" className="font-semibold">How the information is used</h2>
        <p className="mt-2">The information submitted in this form will be used by Community Extension Services to register student volunteers and contact them regarding the CES activity they selected.</p>
      </section>
      <VolunteerForm />
    </div>
  );
}
