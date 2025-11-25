'use client';

import Link from 'next/link';

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6 px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Copyright */}
        <div className="text-sm text-gray-600">
          © {currentYear} <span className="font-semibold text-green-700">Mr. Kim</span>. All rights reserved.
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/about"
            className="text-gray-600 hover:text-green-700 transition-colors"
          >
            About
          </Link>
          <Link
            href="/privacy"
            className="text-gray-600 hover:text-green-700 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-gray-600 hover:text-green-700 transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/support"
            className="text-gray-600 hover:text-green-700 transition-colors"
          >
            Support
          </Link>
        </div>

        {/* Location */}
        <div className="text-sm text-gray-600">
          Nairobi, Kenya
        </div>
      </div>
    </footer>
  );
}
