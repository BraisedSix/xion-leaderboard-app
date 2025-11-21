"use client";
import { useState, useEffect } from "react";
import { useAbstraxionAccount, useAbstraxionSigningClient, useAbstraxionClient } from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import Toast from "@/components/Toast";
import Link from "next/link";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

interface PlayerStats {
  loginDays: number;
  rankStars: number;
  peakScore: number;
  updatedAt: number;
}

export default function HomePage() {
  const { data: account } = useAbstraxionAccount();
  const { client: signingClient } = useAbstraxionSigningClient();
  const { client: queryClient } = useAbstraxionClient();

  const [stats, setStats] = useState<PlayerStats>({ loginDays: 0, rankStars: 0, peakScore: 0, updatedAt: 0 });
  const [form, setForm] = useState({ loginDays: 0, rankStars: 0, peakScore: 0 });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", isVisible: false });

  useEffect(() => {
    if (account?.bech32Address && queryClient) fetchStats();
  }, [account?.bech32Address, queryClient]);

  const showToast = (msg: string) => setToast({ message: msg, isVisible: true });

  const fetchStats = async () => {
    try {
      const res = await queryClient?.queryContractSmart(contractAddress, {
        Get: { collection: "player_stats", document: account?.bech32Address }
      });
      if (res?.document) {
        const data = JSON.parse(res.document.data);
        setStats(data);
        setForm({ loginDays: data.loginDays, rankStars: data.rankStars, peakScore: data.peakScore });
      }
    } catch (e) { console.log("No stats yet"); }
  };

  const updateStats = async () => {
    if (!signingClient || !account) return;
    setLoading(true);
    try {
      const newStats = { ...form, updatedAt: Date.now() };
      await signingClient.execute(account.bech32Address, contractAddress, {
        Set: {
          collection: "player_stats",
          document: account.bech32Address,
          data: JSON.stringify(newStats)
        }
      }, "auto");

      // 更新成功后显示的战绩
      setStats(newStats);
      // 清空输入框！
      setForm({ loginDays: 0, rankStars: 0, peakScore: 0 });
      showToast("战绩更新成功！已上链");

      // 保存个人数据，排行榜页面使用
      localStorage.setItem(
        "my_latest_stats",
        JSON.stringify({
          loginDays: newStats.loginDays,
          rankStars: newStats.rankStars,
          peakScore: newStats.peakScore,
        })
      );
    } catch (e) {
      showToast("更新失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  if (!account?.bech32Address) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-yellow-400 mb-8">王者荣耀 · 巅峰对决</h1>
          <p className="text-white text-xl">请先连接钱包开始你的荣耀之旅</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent">
          我的王者战绩
        </h1>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-yellow-900/30 to-black border border-yellow-600/40 rounded-2xl p-8 text-center transform hover:scale-105 transition">
            <p className="text-yellow-400 text-xl mb-4">登录天数</p>
            <p className="text-6xl font-bold text-white">{stats.loginDays}</p>
            <p className="text-yellow-300 mt-2">天</p>
          </div>
          <div className="bg-gradient-to-br from-blue-900/30 to-black border border-blue-600/40 rounded-2xl p-8 text-center transform hover:scale-105 transition">
            <p className="text-blue-400 text-xl mb-4">排位星星</p>
            <p className="text-6xl font-bold text-white">{stats.rankStars}</p>
            <p className="text-blue-300 mt-2">颗</p>
          </div>
          <div className="bg-gradient-to-br from-red-900/30 to-black border border-red-600/50 rounded-2xl p-8 text-center transform hover:scale-105 transition">
            <p className="text-red-400 text-xl mb-4">巅峰赛分数</p>
            <p className="text-6xl font-bold text-white">{stats.peakScore}</p>
            <p className="text-red-300 mt-2">分</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-10">
          <h2 className="text-3xl font-bold text-center text-white mb-10">更新今日战绩</h2>

          <div className="space-y-8">
            {/* 登录天数 */}
            <div>
              <label className="flex items-center gap-3 text-yellow-400 text-lg font-bold mb-2">
                <span className="text-2xl">Login Days</span>
                <span className="text-sm font-normal text-white/70">（累计登录天数）</span>
              </label>
              <input
                type="number"
                placeholder="例：168（连续登录168天）"
                value={form.loginDays}
                onChange={e => setForm({ ...form, loginDays: +e.target.value || 0 })}
                className="w-full p-5 rounded-xl bg-white/10 border border-yellow-500/30 text-white text-xl placeholder-white/40 focus:border-yellow-400 focus:outline-none transition"
              />
            </div>

            {/* 排位星星 */}
            <div>
              <label className="flex items-center gap-3 text-blue-400 text-lg font-bold mb-2">
                <span className="text-2xl">Rank Stars</span>
                <span className="text-sm font-normal text-white/70">（当前段位总星星数）</span>
              </label>
              <input
                type="number"
                placeholder="例：128（王者128星）"
                value={form.rankStars}
                onChange={e => setForm({ ...form, rankStars: +e.target.value || 0 })}
                className="w-full p-5 rounded-xl bg-white/10 border border-blue-500/30 text-white text-xl placeholder-white/40 focus:border-blue-400 focus:outline-none transition"
              />
              <p className="text-white/50 text-sm mt-2 ml-1">
                钻石以下每胜1星，王者段位100星起步，每多1星=多赢一场
              </p>
            </div>

            {/* 巅峰赛分数 */}
            <div>
              <label className="flex items-center gap-3 text-red-400 text-lg font-bold mb-2">
                <span className="text-2xl">Peak Score</span>
                <span className="text-sm font-normal text-white/70">（巅峰赛最高分）</span>
              </label>
              <input
                type="number"
                placeholder="例：2850（国服强度）"
                value={form.peakScore}
                onChange={e => setForm({ ...form, peakScore: +e.target.value || 0 })}
                className="w-full p-5 rounded-xl bg-white/10 border border-red-500/40 text-white text-xl placeholder-white/40 focus:border-red-400 focus:outline-none transition"
              />
              <p className="text-white/50 text-sm mt-2 ml-1">
                2100+ 全国前100 | 2400+ 国服 | 2700+ 理论巅峰 | 3000+ 超神
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-6 pt-8">
              <Button
                onClick={updateStats}
                disabled={loading}
                structure="base"
                fullWidth
                className="text-2xl py-6 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-red-600 font-bold"
              >
                {loading ? "上链更新中..." : "确认提交今日战绩"}
              </Button>

              <Link href="/leaderboard" className="flex-1">
                <Button structure="base" variant="secondary" fullWidth className="text-2xl py-6">
                  查看全服排行
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toast.message} isVisible={toast.isVisible} onClose={() => setToast({ ...toast, isVisible: false })} />
    </div>
  );
}