"use client";
import Link from 'next/link';
import { useAbstraxionAccount, useModal, Abstraxion } from '@burnt-labs/abstraxion';
import { Button } from '@burnt-labs/ui';

export default function Navigation() {
  const { data: account } = useAbstraxionAccount();
  const [, setShowModal] = useModal();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-yellow-500/20 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-10">
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              王者荣耀
            </Link>

            {account?.bech32Address && (
              <div className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-white/80 hover:text-yellow-400 transition font-medium">
                  我的战绩
                </Link>
                <Link href="/leaderboard" className="text-white/80 hover:text-yellow-400 transition font-medium">
                  全服排行
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {account?.bech32Address ? (
              <>
                <span className="text-white/70 text-sm hidden sm:block">
                  {account.bech32Address?.slice(0, 10)}...{account.bech32Address?.slice(-8)}
                </span>
                <Button
                  onClick={() => window.location.reload()}
                  structure="base"
                  size="sm"
                  variant="secondary"
                >
                  断开连接
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setShowModal(true)}
                structure="base"
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-red-600 font-bold"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
      <Abstraxion onClose={() => setShowModal(false)} />
    </nav>
  );
}