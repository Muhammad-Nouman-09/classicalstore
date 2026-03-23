export default function Home() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-bold">Welcome to My Store</h1>
      <p className="mt-4">Simple. Clean. Fast.</p>
      <a href="/products" className="mt-6 inline-block bg-black text-white px-6 py-2">
        Shop Now
      </a>
    </div>
  );
}