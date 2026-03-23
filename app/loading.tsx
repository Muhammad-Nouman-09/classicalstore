export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-4 inline-flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-blue-300 border-t-blue-600" />
        <p className="text-lg font-medium text-slate-800">Loading...</p>
      </div>
    </div>
  );
}
