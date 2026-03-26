import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-emerald-100 bg-emerald-50/90">
      <div className="mx-auto max-w-6xl px-6 py-6 md:py-8">
        <div className="text-center text-sm text-emerald-800">
          <p>&copy; 2024 Classical Store. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-emerald-600 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-emerald-600 transition">Terms of Service</Link>
            <Link href="/contact" className="hover:text-emerald-600 transition">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
