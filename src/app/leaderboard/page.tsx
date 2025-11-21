"use client";
import { useState, useEffect } from "react";
import { useAbstraxionAccount, useAbstraxionClient } from "@burnt-labs/abstraxion";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

interface Player {
  address: string;
  displayName: string;
  loginDays: number;
  rankStars: number;
  peakScore: number;
  isMe?: boolean;
}

// 纯前端假玩家（永远有数据，超帅名字）
const FAKE_PLAYERS: Player[] = [
  { address: "xion1godofwar999", displayName: "战神·无敌最俊朗", loginDays: 999, rankStars: 428, peakScore: 3800 },
  { address: "xion1legend888", displayName: "百星王者·老夫常胜", loginDays: 888, rankStars: 399, peakScore: 3650 },
  { address: "xion1king777", displayName: "最强王者·一剑开天", loginDays: 1000, rankStars: 380, peakScore: 3520 },
  { address: "xion1pro666", displayName: "国服第一·鲁班大师", loginDays: 730, rankStars: 366, peakScore: 3480 },
  { address: "xion1master555", displayName: "巅峰赛·狂人", loginDays: 680, rankStars: 350, peakScore: 3400 },
  { address: "xion1glory444", displayName: "荣耀黄金·不败神话", loginDays: 620, rankStars: 500, peakScore: 3300 },
  { address: "xion1star333", displayName: "星耀老将", loginDays: 580, rankStars: 310, peakScore: 3150 },
];


export default function LeaderboardPage() {
  const { data: account } = useAbstraxionAccount();
  const { client: queryClient } = useAbstraxionClient();

  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [sortBy, setSortBy] = useState<"peakScore" | "rankStars" | "loginDays">("peakScore");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRealDataAndMerge();
  }, [account?.bech32Address, sortBy]);

  const fetchMyRealDataAndMerge = async () => {
    setLoading(true);

    let myData: Player | null = null;

    // 1. 优先读本地缓存
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("my_latest_stats");
      if (cached) {
        try {
          const data = JSON.parse(cached);
          myData = {
            address: account!.bech32Address,
            displayName: "我",
            loginDays: Number(data.loginDays ?? 0),
            rankStars: Number(data.rankStars ?? 0),
            peakScore: Number(data.peakScore ?? 0),
            isMe: true,
          };
        } catch (e) {
          console.log("本地缓存损坏，忽略");
        }
      }
    }

    // 2. 兜底查链上（只有第一次或缓存坏了才走这里）
    if (!myData && account?.bech32Address && queryClient) {
      try {
        const res = await queryClient.queryContractSmart(contractAddress, {
          Get: { collection: "player_stats", document: account.bech32Address },
        });
        if (res?.document) {
          const data = JSON.parse(res.document.data);
          myData = {
            address: account.bech32Address,
            displayName: "我",
            loginDays: data.loginDays || 0,
            rankStars: data.rankStars || 0,
            peakScore: data.peakScore || 0,
            isMe: true,
          };
          // 顺便把链上最新数据再写回本地缓存
          localStorage.setItem("my_latest_stats", JSON.stringify({
            loginDays: data.loginDays || 0,
            rankStars: data.rankStars || 0,
            peakScore: data.peakScore || 0,
          }));
        }
      } catch (err) {
        console.log("链上暂无数据");
      }
    }

    // 3. 最终兜底
    if (!myData && account?.bech32Address) {
      myData = {
        address: account.bech32Address,
        displayName: "我",
        loginDays: 0,
        rankStars: 0,
        peakScore: 0,
        isMe: true,
      };
    }

    const merged = myData ? [...FAKE_PLAYERS, myData] : FAKE_PLAYERS;
    merged.sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0));

    setAllPlayers(merged);
    setLoading(false);
  };

  const getRankColor = (index: number) => {
    if (index === 0) return "text-yellow-400";
    if (index === 1) return "text-gray-300";
    if (index === 2) return "text-orange-600";
    return "text-white/70";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-32 text-center">
        <p className="text-3xl text-yellow-400">全服排行加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent">
          全服巅峰榜
        </h1>
        <p className="text-center text-white/70 text-xl mb-12">冲分！上王者！证明你是最强的王者！</p>

        {/* 排序按钮 */}
        <div className="flex justify-center gap-6 mb-12">
          {([
            { key: "peakScore", label: "巅峰赛分数" },
            { key: "rankStars", label: "排位星星" },
            { key: "loginDays", label: "登录天数" },
          ] as const).map((item) => (
            <button
              key={item.key}
              onClick={() => setSortBy(item.key)}
              className={`px-10 py-4 rounded-full text-xl font-bold transition-all transform hover:scale-110 ${sortBy === item.key
                ? "bg-gradient-to-r from-yellow-500 to-red-600 text-black shadow-2xl"
                : "bg-white/10 text-white hover:bg-white/20"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 排行榜 */}
        <div className="space-y-6">
          {allPlayers.map((p, i) => (
            <div
              key={p.address}
              className={`flex items-center justify-between p-8 rounded-3xl border backdrop-blur-sm transition-all transform hover:scale-105 ${i < 3
                ? "bg-gradient-to-r from-yellow-900/40 to-transparent border-yellow-600/60 shadow-2xl"
                : p.isMe
                  ? "bg-gradient-to-r from-green-900/40 to-transparent border-green-500/60"
                  : "bg-white/5 border-white/10"
                }`}
            >
              <div className="flex items-center gap-8">
                <div className={`text-6xl font-bold ${getRankColor(i)} drop-shadow-lg`}>
                  #{i + 1}
                </div>
                <div>
                  <p className={`text-2xl font-bold ${p.isMe ? "text-green-400" : "text-white"}`}>
                    {p.displayName}
                    {p.isMe && "（本人）"}
                  </p>
                  {!p.isMe && (
                    <p className="text-white/50 text-sm">
                      {p.address.slice(0, 12)}...{p.address.slice(-8)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-16 text-right">
                <div>
                  <p className="text-red-400 text-4xl font-bold">{p.peakScore}</p>
                  <p className="text-white/60">巅峰赛</p>
                </div>
                <div>
                  <p className="text-blue-400 text-3xl font-bold">{p.rankStars}</p>
                  <p className="text-white/60">排位星星</p>
                </div>
                <div>
                  <p className="text-green-400 text-3xl font-bold">{p.loginDays}</p>
                  <p className="text-white/60">登录天数</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/50 mt-12">
          快去更新战绩，冲上全服第一吧！
        </p>
      </div>
    </div>
  );
}