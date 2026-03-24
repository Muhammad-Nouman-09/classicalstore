import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 pt-8 border-t border-gray-800 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center text-gray-400 text-sm">
          <p>&copy; 2024 Classical Store. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}