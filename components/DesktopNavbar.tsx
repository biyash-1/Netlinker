"use client";

import { BellIcon, HomeIcon, UserIcon,MessageCircle } from "lucide-react";
import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { ModeToggle } from "./ModeToggle";
import { leaveSocket } from "@/lib/socket";

function DesktopNavbar() {
  const { user, isSignedIn } = useUser();
  

  // Shared Tailwind class for nav items
  const navItemClass =
    "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-700 transition-colors";

  return (
    <div className="hidden md:flex items-center space-x-4">
      {/* Home */}
      <Link href="/" className={navItemClass}>
        <HomeIcon className="w-4 h-4" />
        <span className="hidden lg:inline">Home</span>
      </Link>

      {isSignedIn && user ? (
        <>
          {/* Chat */}
          <Link href="/chats" className={navItemClass}>
            <MessageCircle className="w-4 h-4" />
            <span className="hidden lg:inline">Chat</span>
          </Link>

          {/* Notifications */}
          <Link href="/notifications" className={navItemClass}>
            <BellIcon className="w-4 h-4" />
            <span className="hidden lg:inline">Notifications</span>
          </Link>

          {/* Profile */}
          <Link
            href={`/profile/${
              user.username ?? user.primaryEmailAddress?.emailAddress.split("@")[0]
            }`}
            className={navItemClass}
          >
            <UserIcon className="w-4 h-4" />
            <span className="hidden lg:inline">Profile</span>
          </Link>

          {/* Mode toggle */}
          <ModeToggle />

          {/* Clerk UserButton */}
          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal">
          <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </SignInButton>
      )}
    </div>
  );
}

export default DesktopNavbar;
