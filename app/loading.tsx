export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-gradient-to-b from-amber-50 via-white to-emerald-50">
      <div className="text-center">
        <div className="mb-4 inline-flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-emerald-200 border-t-emerald-600" />
        <p className="text-lg font-medium text-emerald-900">Loading...</p>
      </div>
    </div>
  );
}
