export default function Navbar() {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h1 className="text-xl font-bold">MyStore</h1>
      <div className="space-x-4">
        <a href="/">Home</a>
        <a href="/products">Products</a>
      </div>
    </div>
  );
}