import { useState, useRef, useEffect } from "react";
import {
  Menu, X, Search, Archive, LogOut, Star, Send, Mic, Phone, Video,
  MoreVertical, User, Plus, HelpCircle, CheckCheck, Edit3, Users,
  Bell, Smile, Paperclip, MessageCircle, Globe, Shield,
  BarChart2, TrendingUp, Eye, Hash, Activity, ChevronRight
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid
} from "recharts";

// ─── TYPES ──────────────────────────────────────────────────────────────────

type Screen = "login" | "signup" | "app";
type Tab = "chats" | "status" | "community" | "archive";

interface Profile {
  id: string; name: string; email: string; about: string; avatar: string; color: string;
}
interface Member {
  id: string; name: string; avatar: string; color: string;
  role: "admin" | "member"; isOnline: boolean; lastSeen: string;
}
interface Msg {
  id: string; senderId: string; senderName: string; text: string; time: string;
  type: "text" | "voice" | "media" | "ai"; seen: boolean; reactions: string[];
}
interface ChatItem {
  id: string; type: "group" | "person" | "community"; name: string;
  avatar: string; color: string; lastMessage: string; lastTime: string;
  unread: number; members: Member[]; messages: Msg[]; isArchived: boolean;
  description?: string;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

const PALETTE = ["#25d366","#4ecdc4","#45b7d1","#feca57","#ff9ff3","#54a0ff","#96ceb4","#ff6b6b"];
const gc = (i: number) => PALETTE[i % PALETTE.length];
const uid = () => Math.random().toString(36).slice(2);
const tnow = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
};

// ─── SEED DATA ───────────────────────────────────────────────────────────────

const SEED: ChatItem[] = [
  {
    id:"g1", type:"group", name:"Tech Squad", avatar:"🚀", color:"#25d366",
    lastMessage:"Let's build something amazing!", lastTime:"2:45pm", unread:3,
    isArchived:false, description:"Technology enthusiasts united",
    members:[
      {id:"u1",name:"Amit Kumar",avatar:"AK",color:"#25d366",role:"admin",isOnline:true,lastSeen:"Online"},
      {id:"u2",name:"Priya Sharma",avatar:"PS",color:"#4ecdc4",role:"member",isOnline:false,lastSeen:"1 hr ago"},
      {id:"u3",name:"Rahul Dev",avatar:"RD",color:"#45b7d1",role:"member",isOnline:true,lastSeen:"Online"},
      {id:"u4",name:"Sneha Patel",avatar:"SP",color:"#feca57",role:"member",isOnline:false,lastSeen:"Yesterday"},
    ],
    messages:[
      {id:"m1",senderId:"u1",senderName:"Amit Kumar",text:"Hey everyone! Welcome to Tech Squad 🚀",time:"10:00am",type:"text",seen:true,reactions:[]},
      {id:"m2",senderId:"u2",senderName:"Priya Sharma",text:"Excited to be here! 🎉",time:"10:05am",type:"text",seen:true,reactions:["❤️"]},
      {id:"m3",senderId:"u3",senderName:"Rahul Dev",text:"Let's build something amazing!",time:"2:45pm",type:"text",seen:true,reactions:["🔥"]},
    ]
  },
  {
    id:"c1", type:"community", name:"Dev Community", avatar:"💻", color:"#4ecdc4",
    lastMessage:"React 19 features are 🔥", lastTime:"Yesterday", unread:12,
    isArchived:false, description:"All developers welcome – share, learn, grow",
    members:[
      {id:"u1",name:"Amit Kumar",avatar:"AK",color:"#25d366",role:"admin",isOnline:true,lastSeen:"Online"},
      {id:"u5",name:"Kiran Nair",avatar:"KN",color:"#96ceb4",role:"member",isOnline:true,lastSeen:"Online"},
      {id:"u6",name:"Maya Singh",avatar:"MS",color:"#ff9ff3",role:"member",isOnline:false,lastSeen:"2 hrs ago"},
      {id:"u7",name:"Dev Rao",avatar:"DR",color:"#54a0ff",role:"member",isOnline:true,lastSeen:"Online"},
    ],
    messages:[
      {id:"m5",senderId:"u5",senderName:"Kiran Nair",text:"React 19 is out! 🎉 Concurrent features are insane!",time:"Yesterday",type:"text",seen:true,reactions:["🔥","🔥"]},
      {id:"m6",senderId:"u6",senderName:"Maya Singh",text:"React 19 features are 🔥",time:"Yesterday",type:"text",seen:true,reactions:[]},
    ]
  },
  {
    id:"p1", type:"person", name:"Priya Sharma", avatar:"PS", color:"#4ecdc4",
    lastMessage:"Are you coming today?", lastTime:"2:41pm", unread:1,
    isArchived:false,
    members:[{id:"u2",name:"Priya Sharma",avatar:"PS",color:"#4ecdc4",role:"member",isOnline:false,lastSeen:"1 hr ago"}],
    messages:[
      {id:"m7",senderId:"u2",senderName:"Priya Sharma",text:"Hey! Are you coming today?",time:"2:41pm",type:"text",seen:false,reactions:[]},
    ]
  },
  {
    id:"p2", type:"person", name:"Rahul Dev", avatar:"RD", color:"#45b7d1",
    lastMessage:"I'll be at the office by 9", lastTime:"9:00am", unread:0,
    isArchived:false,
    members:[{id:"u3",name:"Rahul Dev",avatar:"RD",color:"#45b7d1",role:"member",isOnline:true,lastSeen:"Online"}],
    messages:[
      {id:"m9",senderId:"u3",senderName:"Rahul Dev",text:"Good morning! 👋",time:"8:55am",type:"text",seen:true,reactions:[]},
      {id:"m10",senderId:"me",senderName:"You",text:"Morning! What time are you coming in?",time:"8:57am",type:"text",seen:true,reactions:[]},
      {id:"m11",senderId:"u3",senderName:"Rahul Dev",text:"I'll be at the office by 9",time:"9:00am",type:"text",seen:true,reactions:[]},
    ]
  }
];

// ─── CHART DATA ──────────────────────────────────────────────────────────────

const engagementData = [
  {name:"Chat",value:45,color:"#25d366"},
  {name:"Reactions",value:25,color:"#4ecdc4"},
  {name:"Voice Msg",value:15,color:"#45b7d1"},
  {name:"Media",value:15,color:"#feca57"},
];
const topicData = [
  {topic:"Tech",msgs:85},{topic:"Events",msgs:62},{topic:"Code",msgs:54},
  {topic:"News",msgs:38},{topic:"Fun",msgs:29},
];
const weeklyData = [
  {day:"Mon",msgs:24},{day:"Tue",msgs:48},{day:"Wed",msgs:35},
  {day:"Thu",msgs:72},{day:"Fri",msgs:58},{day:"Sat",msgs:31},{day:"Sun",msgs:19},
];

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

function LoginPage({ onLogin, onGoSignup }: { onLogin:(p:Profile)=>void; onGoSignup:()=>void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");

  function handle() {
    if (!email || !password) { setErr("Please fill all fields"); return; }
    const name = email.split("@")[0].replace(/[._]/g," ").replace(/\b\w/g,c=>c.toUpperCase());
    onLogin({ id:"me", name, email, about:"Hey there! I am using VibeChat", avatar:name.slice(0,2).toUpperCase(), color:"#25d366" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
         style={{background:"linear-gradient(135deg,#070f10 0%,#0d2d35 45%,#0a1a2e 100%)",fontFamily:"Inter,sans-serif"}}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-[0.07]"
             style={{background:"radial-gradient(circle,#25d366,transparent)"}}/>
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
             style={{background:"radial-gradient(circle,#4ecdc4,transparent)"}}/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.04]"
             style={{background:"radial-gradient(circle,#25d366,transparent)"}}/>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-2xl p-8 backdrop-blur-2xl"
             style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",boxShadow:"0 32px 64px rgba(0,0,0,0.6)"}}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
                 style={{background:"linear-gradient(135deg,#25d366,#1a8a8a)"}}>
              💬
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome back!</h1>
            <p className="text-sm mt-1.5" style={{color:"#8696a0"}}>Sign in to continue to VibeChat</p>
          </div>

          {err && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-400"
                 style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.18)"}}>
              {err}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{color:"#8696a0"}}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)"}}
                onKeyDown={e=>e.key==="Enter"&&handle()}/>
            </div>
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{color:"#8696a0"}}>Password</label>
              <div className="relative">
                <input type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none pr-16"
                  style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)"}}
                  onKeyDown={e=>e.key==="Enter"&&handle()}/>
                <button onClick={()=>setShowPass(v=>!v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                  style={{color:"#8696a0"}}>{showPass?"Hide":"Show"}</button>
              </div>
            </div>
            <button onClick={handle}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98] mt-2"
              style={{background:"linear-gradient(135deg,#25d366,#1a8a8a)"}}>
              Sign In
            </button>
          </div>

          <p className="text-center mt-6 text-sm" style={{color:"#8696a0"}}>
            {"Don't have an account? "}
            <button onClick={onGoSignup} className="font-semibold" style={{color:"#25d366"}}>Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── SIGNUP PAGE ─────────────────────────────────────────────────────────────

function SignupPage({ onSignup, onGoLogin }: { onSignup:(p:Profile)=>void; onGoLogin:()=>void }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [err, setErr] = useState("");
  function handle() {
    if (!name || !email || !password) { setErr("Please fill all fields"); return; }
    onSignup({ id:"me", name, email, about:"Hey there! I am using VibeChat", avatar:name.slice(0,2).toUpperCase(), color:"#25d366" });
  }
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
         style={{background:"linear-gradient(135deg,#070f10 0%,#0d2d35 45%,#0a1a2e 100%)",fontFamily:"Inter,sans-serif"}}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-[0.07]" style={{background:"radial-gradient(circle,#25d366,transparent)"}}/>
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07]" style={{background:"radial-gradient(circle,#4ecdc4,transparent)"}}/>
      </div>
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-2xl p-8 backdrop-blur-2xl"
             style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",boxShadow:"0 32px 64px rgba(0,0,0,0.6)"}}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl" style={{background:"linear-gradient(135deg,#25d366,#1a8a8a)"}}>💬</div>
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="text-sm mt-1.5" style={{color:"#8696a0"}}>Join VibeChat today</p>
          </div>
          {err && <div className="mb-4 p-3 rounded-xl text-sm text-red-400" style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.18)"}}>{err}</div>}
          <div className="space-y-4">
            {([["Full Name",name,setName,"text","Enter your full name"],["Email",email,setEmail,"email","Enter your email"],["Password",password,setPassword,"password","Create a password"]] as const).map(([label,val,setter,type,ph])=>(
              <div key={label}>
                <label className="block text-xs mb-1.5 font-medium" style={{color:"#8696a0"}}>{label}</label>
                <input type={type} value={val} onChange={e=>(setter as (v:string)=>void)(e.target.value)} placeholder={ph}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                  style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)"}}
                  onKeyDown={e=>e.key==="Enter"&&handle()}/>
              </div>
            ))}
            <button onClick={handle} className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98]"
              style={{background:"linear-gradient(135deg,#25d366,#1a8a8a)"}}>Create Account</button>
          </div>
          <p className="text-center mt-6 text-sm" style={{color:"#8696a0"}}>
            {"Already have an account? "}
            <button onClick={onGoLogin} className="font-semibold" style={{color:"#25d366"}}>Sign In</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── CHAT LIST ITEM ───────────────────────────────────────────────────────────

function ChatListItem({ chat, selected, onClick }: { chat:ChatItem; selected:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left"
      style={{background:selected?"rgba(37,211,102,0.08)":"transparent",borderLeft:selected?"3px solid #25d366":"3px solid transparent"}}>
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
             style={{background:chat.color+"22",fontSize:"1.1rem"}}>
          {chat.avatar}
        </div>
        {chat.type==="person"&&chat.members[0]?.isOnline&&(
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{background:"#25d366",borderColor:"#111f21"}}/>
        )}
        {(chat.type==="group"||chat.type==="community")&&(
          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 flex items-center justify-center"
               style={{background:chat.color,borderColor:"#111f21",fontSize:"8px"}}>
            {chat.type==="community"?"🌐":"👥"}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-semibold text-sm text-white truncate">{chat.name}</span>
          <span className="text-xs flex-shrink-0 ml-2" style={{color:"#8696a0"}}>{chat.lastTime}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs truncate" style={{color:"#8696a0"}}>{chat.lastMessage}</span>
          {chat.unread>0&&(
            <div className="rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ml-2 px-1.5 min-w-[20px] h-5"
                 style={{background:"#25d366"}}>{chat.unread>9?"9+":chat.unread}</div>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── GROUP INFO PANEL ─────────────────────────────────────────────────────────

function GroupInfoPanel({ chat, onClose, onOpenDashboard }: { chat:ChatItem; onClose:()=>void; onOpenDashboard:()=>void }) {
  const onlineCount = chat.members.filter(m=>m.isOnline).length;
  const activePercent = Math.round((onlineCount/Math.max(chat.members.length,1))*100);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
           style={{borderColor:"rgba(255,255,255,0.06)"}}>
        <h3 className="font-semibold text-white text-sm">
          {chat.type==="person"?"Contact Info":"Group Info"}
        </h3>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{color:"#8696a0"}}><X size={16}/></button>
      </div>

      <div className="overflow-y-auto flex-1">
        {/* Banner */}
        <div className="p-5 text-center border-b" style={{borderColor:"rgba(255,255,255,0.06)"}}>
          <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl"
               style={{background:chat.color+"22"}}>{chat.avatar}</div>
          <h3 className="text-white font-bold text-base">{chat.name}</h3>
          {chat.description&&<p className="text-xs mt-1" style={{color:"#8696a0"}}>{chat.description}</p>}
          <p className="text-xs mt-1.5 font-medium" style={{color:chat.color}}>
            {chat.members.length} members · {onlineCount} online
          </p>
        </div>

        {/* Mini Dashboard */}
        {chat.type!=="person"&&(
          <div className="p-4 border-b" style={{borderColor:"rgba(255,255,255,0.06)"}}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-white">Activity</span>
              <button onClick={onOpenDashboard}
                className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-all"
                style={{background:"rgba(37,211,102,0.12)",color:"#25d366"}}>
                Full Dashboard <ChevronRight size={12}/>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <PieChart width={88} height={88}>
                <Pie data={engagementData} cx={44} cy={44} innerRadius={26} outerRadius={40} dataKey="value" startAngle={90} endAngle={450} strokeWidth={0}>
                  {engagementData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
              </PieChart>
              <div className="space-y-1.5 flex-1">
                {engagementData.map(e=>(
                  <div key={e.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:e.color}}/>
                    <span style={{color:"#8696a0"}}>{e.name}</span>
                    <span className="text-white font-semibold ml-auto">{e.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-xl" style={{background:"rgba(255,255,255,0.04)"}}>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{color:"#8696a0"}}>Members Active</span>
                <span className="font-semibold" style={{color:"#25d366"}}>{activePercent}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.08)"}}>
                <div className="h-full rounded-full transition-all" style={{width:`${activePercent}%`,background:"linear-gradient(90deg,#25d366,#4ecdc4)"}}/>
              </div>
            </div>
          </div>
        )}

        {/* Members */}
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{color:"#8696a0"}}>
            {chat.type==="person"?"About":"Members"} ({chat.members.length})
          </p>
          {chat.members.map(m=>(
            <div key={m.id} className="flex items-center gap-3 py-2.5 border-b last:border-0"
                 style={{borderColor:"rgba(255,255,255,0.05)"}}>
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                     style={{background:m.color+"28",color:m.color}}>
                  {m.avatar}
                </div>
                {m.isOnline&&<div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2" style={{background:"#25d366",borderColor:"#0e2224"}}/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{m.name}</p>
                <p className="text-xs truncate" style={{color:"#8696a0"}}>{m.lastSeen}</p>
              </div>
              {m.role==="admin"&&(
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background:"rgba(37,211,102,0.12)",color:"#25d366"}}>Admin</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FULL DASHBOARD ───────────────────────────────────────────────────────────

function FullDashboard({ chat, onClose }: { chat:ChatItem; onClose:()=>void }) {
  const onlineCount = chat.members.filter(m=>m.isOnline).length;
  const activePercent = Math.round((onlineCount/Math.max(chat.members.length,1))*100);

  const statCards = [
    {label:"Total Members",value:chat.members.length,icon:"👥",color:"#25d366"},
    {label:"Active Now",value:onlineCount,icon:"🟢",color:"#4ecdc4"},
    {label:"Messages",value:chat.messages.length*3,icon:"💬",color:"#45b7d1"},
    {label:"Active %",value:`${activePercent}%`,icon:"📊",color:"#feca57"},
  ];

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" style={{background:"#070f10",fontFamily:"Inter,sans-serif"}}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10"
           style={{background:"#070f10",borderColor:"rgba(255,255,255,0.06)"}}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
               style={{background:chat.color+"22"}}>{chat.avatar}</div>
          <div>
            <h2 className="text-white font-bold text-base">{chat.name} — Analytics</h2>
            <p className="text-xs" style={{color:"#8696a0"}}>Live group dashboard</p>
          </div>
        </div>
        <button onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{background:"rgba(255,255,255,0.06)",color:"#8696a0"}}>
          <X size={18}/>
        </button>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statCards.map(s=>(
            <div key={s.label} className="p-5 rounded-2xl"
                 style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)"}}>
              <p className="text-2xl mb-2">{s.icon}</p>
              <p className="text-3xl font-bold mb-1" style={{color:s.color}}>{s.value}</p>
              <p className="text-xs" style={{color:"#8696a0"}}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Engagement Donut */}
          <div className="p-5 rounded-2xl" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)"}}>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={14} style={{color:"#25d366"}}/> Engagement Breakdown
            </h3>
            <div className="flex items-center gap-6">
              <PieChart width={160} height={160}>
                <Pie data={engagementData} cx={80} cy={80} innerRadius={45} outerRadius={70} dataKey="value" startAngle={90} endAngle={450} strokeWidth={0}>
                  {engagementData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
              </PieChart>
              <div className="space-y-3 flex-1">
                {engagementData.map(e=>(
                  <div key={e.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{background:e.color}}/>
                        <span style={{color:"#8696a0"}}>{e.name}</span>
                      </div>
                      <span className="text-white font-bold">{e.value}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.08)"}}>
                      <div className="h-full rounded-full" style={{width:`${e.value}%`,background:e.color}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="p-5 rounded-2xl" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)"}}>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={14} style={{color:"#4ecdc4"}}/> Weekly Activity
            </h3>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                <XAxis dataKey="day" tick={{fill:"#8696a0",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"#8696a0",fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"#1f3335",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12}} labelStyle={{color:"white"}} itemStyle={{color:"#25d366"}}/>
                <Line type="monotone" dataKey="msgs" stroke="#25d366" strokeWidth={2.5} dot={{fill:"#25d366",r:4,strokeWidth:0}} activeDot={{r:6,fill:"#25d366"}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topics Bar Chart */}
        <div className="p-5 rounded-2xl mb-6" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)"}}>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Hash size={14} style={{color:"#feca57"}}/> Most Active Topics
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topicData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
              <XAxis dataKey="topic" tick={{fill:"#8696a0",fontSize:12}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#8696a0",fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"#1f3335",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12}} labelStyle={{color:"white"}} itemStyle={{color:"#25d366"}}/>
              <Bar dataKey="msgs" radius={[6,6,0,0]}>
                {topicData.map((_,i)=><Cell key={i} fill={gc(i)}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Members Activity Table */}
        <div className="p-5 rounded-2xl" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)"}}>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Users size={14} style={{color:"#54a0ff"}}/> Member Activity
          </h3>
          <div className="space-y-3">
            {chat.members.map((m,i)=>{
              const pct = Math.floor(20+Math.random()*70);
              return (
                <div key={m.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                       style={{background:m.color+"28",color:m.color}}>{m.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white font-medium truncate">{m.name}</span>
                      <span className="flex-shrink-0 ml-2" style={{color:m.isOnline?"#25d366":"#8696a0"}}>{m.isOnline?"Online":m.lastSeen}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.08)"}}>
                      <div className="h-full rounded-full" style={{width:`${pct}%`,background:`linear-gradient(90deg,${m.color},${m.color}88)`}}/>
                    </div>
                  </div>
                  <span className="text-xs font-bold flex-shrink-0" style={{color:m.color,minWidth:32,textAlign:"right"}}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE MODAL ────────────────────────────────────────────────────────────

function ProfileModal({ user, onClose, onLogout, onUpdate }: {
  user:Profile; onClose:()=>void; onLogout:()=>void; onUpdate:(p:Profile)=>void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [about, setAbout] = useState(user.about);

  function save() {
    onUpdate({...user,name,about,avatar:name.slice(0,2).toUpperCase()});
    setEditing(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,0.75)"}}>
      <div className="w-80 rounded-2xl overflow-hidden shadow-2xl"
           style={{background:"#1a2e30",border:"1px solid rgba(255,255,255,0.1)"}}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{borderColor:"rgba(255,255,255,0.08)"}}>
          <h3 className="font-semibold text-white text-sm">
            {editing?"Edit Profile":"Profile"}
          </h3>
          <button onClick={onClose} style={{color:"#8696a0"}}><X size={18}/></button>
        </div>
        <div className="p-6">
          <div className="text-center mb-5">
            <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white"
                 style={{background:user.color}}>
              {editing?name.slice(0,2).toUpperCase()||"?":user.avatar}
            </div>
            {!editing&&<>
              <h3 className="text-lg font-bold text-white">{user.name}</h3>
              <p className="text-sm mt-0.5" style={{color:"#8696a0"}}>{user.email}</p>
              <p className="text-sm mt-2 px-2" style={{color:"#8696a0"}}>{user.about}</p>
            </>}
          </div>

          {editing?(
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1 font-medium" style={{color:"#8696a0"}}>Name</label>
                <input value={name} onChange={e=>setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none"
                  style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)"}}/>
              </div>
              <div>
                <label className="block text-xs mb-1 font-medium" style={{color:"#8696a0"}}>About</label>
                <input value={about} onChange={e=>setAbout(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none"
                  style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)"}}/>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={()=>setEditing(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{background:"rgba(255,255,255,0.06)",color:"#8696a0"}}>Cancel</button>
                <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:"#25d366"}}>Save</button>
              </div>
            </div>
          ):(
            <div className="flex gap-2">
              <button onClick={()=>setEditing(true)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5"
                style={{background:"rgba(37,211,102,0.12)",color:"#25d366"}}>
                <Edit3 size={13}/> Edit Profile
              </button>
              <button onClick={onLogout}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5"
                style={{background:"rgba(239,68,68,0.1)",color:"#ef4444"}}>
                <LogOut size={13}/> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── NEW GROUP MODAL ──────────────────────────────────────────────────────────

function NewGroupModal({ onCreate, onClose }: { onCreate:(name:string,desc:string)=>void; onClose:()=>void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,0.75)"}}>
      <div className="w-96 rounded-2xl p-6 shadow-2xl" style={{background:"#1a2e30",border:"1px solid rgba(255,255,255,0.1)"}}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-white">Create New Group</h3>
          <button onClick={onClose} style={{color:"#8696a0"}}><X size={18}/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{color:"#8696a0"}}>Group Name *</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Marketing Team"
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
              style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)"}}
              onKeyDown={e=>e.key==="Enter"&&name.trim()&&onCreate(name,desc)}/>
          </div>
          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{color:"#8696a0"}}>Description</label>
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="What is this group about?"
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
              style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)"}}/>
          </div>
          <button onClick={()=>name.trim()&&onCreate(name,desc)} disabled={!name.trim()}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-40"
            style={{background:"linear-gradient(135deg,#25d366,#1a8a8a)"}}>
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [chats, setChats] = useState<ChatItem[]>(SEED);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("chats");
  const [showHamburger, setShowHamburger] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = chats.find(c=>c.id===selectedId)??null;

  useEffect(()=>{ msgEndRef.current?.scrollIntoView({behavior:"smooth"}); },[selectedId,chats]);

  function handleLogin(p:Profile) { setCurrentUser(p); setScreen("app"); }
  function handleLogout() { setCurrentUser(null); setScreen("login"); setSelectedId(null); setShowProfileModal(false); setShowHamburger(false); }

  function selectChat(id:string) {
    setSelectedId(id);
    setShowGroupInfo(false);
    setChats(prev=>prev.map(c=>c.id===id?{...c,unread:0}:c));
  }

  function sendMessage() {
    if (!msgInput.trim()||!selectedId||!currentUser) return;
    const msg:Msg = { id:uid(), senderId:"me", senderName:currentUser.name, text:msgInput.trim(), time:tnow(), type:"text", seen:false, reactions:[] };
    setChats(prev=>prev.map(c=>c.id===selectedId?{...c,messages:[...c.messages,msg],lastMessage:msg.text,lastTime:tnow(),unread:0}:c));
    setMsgInput("");
  }

  function createGroup(name:string,desc:string) {
    if (!currentUser) return;
    const gid = uid();
    const aiMsg:Msg = {
      id:uid(), senderId:"ai", senderName:"VibeMate AI",
      text:`👋 Welcome to **${name}**! I'm VibeMate AI, your group assistant. I'm here to help this community thrive! Ask me anything — from getting started tips to group insights. Let's make something amazing together! 🚀`,
      time:tnow(), type:"ai", seen:true, reactions:[]
    };
    const newGroup:ChatItem = {
      id:gid, type:"group", name, avatar:"🎯", color:gc(chats.length),
      lastMessage:aiMsg.text.slice(0,45)+"...", lastTime:tnow(), unread:0,
      isArchived:false, description:desc||"A new group",
      members:[{id:"me",name:currentUser.name,avatar:currentUser.avatar,color:currentUser.color,role:"admin",isOnline:true,lastSeen:"Online"}],
      messages:[aiMsg]
    };
    setChats(prev=>[newGroup,...prev]);
    setSelectedId(gid);
    setShowNewGroupModal(false);
    setShowHamburger(false);
    setActiveTab("chats");
  }

  const filteredChats = chats.filter(c=>{
    if (activeTab==="archive") return c.isArchived;
    if (activeTab==="community") return c.type==="community";
    if (activeTab==="status") return false;
    if (c.isArchived) return false;
    if (searchQ) return c.name.toLowerCase().includes(searchQ.toLowerCase());
    return true;
  });

  const groupsInList = filteredChats.filter(c=>c.type==="group"||c.type==="community");
  const personsInList = filteredChats.filter(c=>c.type==="person");

  if (screen==="login") return <LoginPage onLogin={handleLogin} onGoSignup={()=>setScreen("signup")}/>;
  if (screen==="signup") return <SignupPage onSignup={handleLogin} onGoLogin={()=>setScreen("login")}/>;

  const sidebarItems = [
    {tab:"chats" as Tab, icon:<MessageCircle size={20}/>, label:"Chats"},
    {tab:"community" as Tab, icon:<Globe size={20}/>, label:"Community"},
    {tab:"status" as Tab, icon:<Bell size={20}/>, label:"Status"},
    {tab:"archive" as Tab, icon:<Archive size={20}/>, label:"Archive"},
  ];

  const hamburgerItems = [
    {icon:<Plus size={15}/>, label:"New Group", action:()=>setShowNewGroupModal(true)},
    {icon:<Globe size={15}/>, label:"Popular Channel", action:()=>setActiveTab("community")},
    {icon:<Star size={15}/>, label:"Starred Messages", action:()=>{}},
    {icon:<Archive size={15}/>, label:"Archive", action:()=>setActiveTab("archive")},
    {icon:<MessageCircle size={15}/>, label:"Chat", action:()=>setActiveTab("chats")},
    {icon:<User size={15}/>, label:"Profile", action:()=>setShowProfileModal(true)},
    {icon:<Users size={15}/>, label:"Select Group", action:()=>{}},
    {icon:<HelpCircle size={15}/>, label:"Help", action:()=>{}},
    {icon:<LogOut size={15}/>, label:"Logout", action:handleLogout, danger:true},
  ];

  return (
    <div className="h-screen flex overflow-hidden" style={{background:"#0b1d1f",fontFamily:"'Inter',sans-serif"}}>

      {/* ── LEFT SIDEBAR ── */}
      <div className="flex flex-col items-center py-4 gap-1.5 flex-shrink-0 border-r"
           style={{width:60,background:"#0e2224",borderColor:"rgba(255,255,255,0.06)"}}>
        <button onClick={()=>setShowProfileModal(true)} title="Profile"
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white mb-3 relative flex-shrink-0"
          style={{background:currentUser?.color??"#25d366"}}>
          {currentUser?.avatar}
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{background:"#25d366",borderColor:"#0e2224"}}/>
        </button>

        {sidebarItems.map(item=>(
          <button key={item.tab} onClick={()=>setActiveTab(item.tab)} title={item.label}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{color:activeTab===item.tab?"#25d366":"#8696a0",background:activeTab===item.tab?"rgba(37,211,102,0.1)":"transparent"}}>
            {item.icon}
          </button>
        ))}

        <div className="flex-1"/>
        <button onClick={handleLogout} title="Logout"
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:text-red-400"
          style={{color:"#8696a0"}}>
          <LogOut size={20}/>
        </button>
      </div>

      {/* ── CHAT LIST PANEL ── */}
      <div className="flex flex-col flex-shrink-0 border-r" style={{width:300,background:"#111f21",borderColor:"rgba(255,255,255,0.06)"}}>
        {/* Panel Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b relative flex-shrink-0"
             style={{borderColor:"rgba(255,255,255,0.06)"}}>
          <h2 className="font-semibold text-white text-sm capitalize">{activeTab}</h2>
          <button onClick={()=>setShowHamburger(v=>!v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{color:showHamburger?"#25d366":"#8696a0",background:showHamburger?"rgba(37,211,102,0.1)":"transparent"}}>
            <Menu size={17}/>
          </button>

          {/* Hamburger Dropdown */}
          {showHamburger&&(
            <div className="absolute top-full right-2 z-50 w-52 rounded-xl overflow-hidden shadow-2xl"
                 style={{background:"#1a2e30",border:"1px solid rgba(255,255,255,0.1)"}}>
              {hamburgerItems.map(item=>(
                <button key={item.label}
                  onClick={()=>{item.action();if(item.label!=="New Group")setShowHamburger(false);}}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/[0.04]"
                  style={{color:item.danger?"#ef4444":"#e9edef",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <span style={{color:item.danger?"#ef4444":"#8696a0"}}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="px-3 py-2 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{background:"rgba(255,255,255,0.06)"}}>
            <Search size={13} style={{color:"#8696a0",flexShrink:0}}/>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
              placeholder="Search chats..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{color:"#e9edef",caretColor:"#25d366"}}/>
            {searchQ&&<button onClick={()=>setSearchQ("")} style={{color:"#8696a0"}}><X size={12}/></button>}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab==="status"?(
            <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{background:"rgba(37,211,102,0.1)"}}>
                <Bell size={24} style={{color:"#25d366"}}/>
              </div>
              <p className="text-sm font-medium text-white">No status updates</p>
              <p className="text-xs" style={{color:"#8696a0"}}>Status updates from your contacts will appear here</p>
            </div>
          ):(
            <>
              {groupsInList.length>0&&(
                <>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{color:"#8696a0"}}>
                      {activeTab==="community"?"Communities":"Groups & Communities"}
                    </span>
                  </div>
                  {groupsInList.map(c=>(
                    <ChatListItem key={c.id} chat={c} selected={selectedId===c.id} onClick={()=>selectChat(c.id)}/>
                  ))}
                </>
              )}
              {personsInList.length>0&&activeTab==="chats"&&(
                <>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{color:"#8696a0"}}>People</span>
                  </div>
                  {personsInList.map(c=>(
                    <ChatListItem key={c.id} chat={c} selected={selectedId===c.id} onClick={()=>selectChat(c.id)}/>
                  ))}
                </>
              )}
              {filteredChats.length===0&&(
                <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{background:"rgba(37,211,102,0.1)"}}>
                    <MessageCircle size={24} style={{color:"#25d366"}}/>
                  </div>
                  <p className="text-sm font-medium text-white">No chats yet</p>
                  <p className="text-xs" style={{color:"#8696a0"}}>
                    {activeTab==="archive"?"No archived chats":"Tap ☰ to create a group or community"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {selectedChat?(
          <>
            {/* Chat Window */}
            <div className="flex flex-col overflow-hidden transition-all duration-300"
                 style={{width:showGroupInfo?"60%":"100%",background:"#0b1d1f"}}>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
                   style={{background:"#111f21",borderColor:"rgba(255,255,255,0.06)"}}>
                <button onClick={()=>setShowGroupInfo(v=>!v)} className="flex items-center gap-3 flex-1 min-w-0 text-left group">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                       style={{background:selectedChat.color+"22"}}>{selectedChat.avatar}</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm truncate group-hover:text-green-400 transition-colors">{selectedChat.name}</p>
                    <p className="text-xs truncate" style={{color:"#8696a0"}}>
                      {selectedChat.type==="person"
                        ?(selectedChat.members[0]?.isOnline?"🟢 Online":selectedChat.members[0]?.lastSeen)
                        :`${selectedChat.members.length} members · ${selectedChat.members.filter(m=>m.isOnline).length} online`}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/5 transition-all" style={{color:"#8696a0"}}><Phone size={16}/></button>
                  <button className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/5 transition-all" style={{color:"#8696a0"}}><Video size={16}/></button>
                  <button className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/5 transition-all" style={{color:"#8696a0"}}><MoreVertical size={16}/></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4"
                   style={{backgroundImage:"radial-gradient(circle at 15% 85%,rgba(37,211,102,0.025) 0%,transparent 50%),radial-gradient(circle at 85% 15%,rgba(78,205,196,0.025) 0%,transparent 50%)"}}>
                <div className="space-y-0.5">
                  {selectedChat.messages.map((msg,idx)=>{
                    const isMine = msg.senderId==="me";
                    const isAI = msg.senderId==="ai";
                    const prevSame = idx>0&&selectedChat.messages[idx-1].senderId===msg.senderId;
                    const memberColor = selectedChat.members.find(m=>m.id===msg.senderId)?.color??"#8696a0";
                    return (
                      <div key={msg.id} className={`flex ${isMine?"justify-end":"justify-start"} ${prevSame?"mt-0.5":"mt-4"}`}>
                        {!isMine&&!prevSame&&(
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 mt-1 flex-shrink-0"
                               style={{background:isAI?"linear-gradient(135deg,#25d366,#1a8a8a)":memberColor+"28",color:isAI?"white":memberColor}}>
                            {isAI?"AI":msg.senderName.slice(0,1)}
                          </div>
                        )}
                        {!isMine&&prevSame&&<div className="w-7 mr-2 flex-shrink-0"/>}
                        <div className="max-w-[68%]">
                          {!isMine&&!prevSame&&selectedChat.type!=="person"&&(
                            <p className="text-xs mb-1 font-semibold" style={{color:isAI?"#25d366":memberColor}}>
                              {isAI?"VibeMate AI ✨":msg.senderName}
                            </p>
                          )}
                          <div className="px-3 py-2 text-sm leading-relaxed"
                               style={{
                                 background:isMine?"#005c4b":isAI?"rgba(37,211,102,0.1)":"rgba(255,255,255,0.07)",
                                 color:"#e9edef",
                                 borderRadius:isMine?"18px 18px 4px 18px":isAI?"18px 18px 18px 4px":"18px 18px 18px 4px",
                                 border:isAI?"1px solid rgba(37,211,102,0.2)":"none",
                               }}>
                            {msg.text.replace(/\*\*(.*?)\*\*/g,"$1")}
                          </div>
                          <div className={`flex items-center gap-1 mt-0.5 ${isMine?"justify-end":"justify-start"}`}>
                            <span className="text-[10px]" style={{color:"#8696a0"}}>{msg.time}</span>
                            {isMine&&<CheckCheck size={11} style={{color:"#4ecdc4"}}/>}
                          </div>
                          {msg.reactions.length>0&&(
                            <div className="flex gap-0.5 mt-0.5">{msg.reactions.map((r,i)=><span key={i} className="text-sm">{r}</span>)}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={msgEndRef}/>
                </div>
              </div>

              {/* Input */}
              <div className="px-3 py-3 border-t flex items-center gap-2 flex-shrink-0"
                   style={{background:"#111f21",borderColor:"rgba(255,255,255,0.06)"}}>
                <button className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-white/5 transition-all" style={{color:"#8696a0"}}><Smile size={19}/></button>
                <button className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-white/5 transition-all" style={{color:"#8696a0"}}><Paperclip size={18}/></button>
                <div className="flex-1 flex items-center px-4 py-2.5 rounded-full" style={{background:"rgba(255,255,255,0.07)"}}>
                  <input value={msgInput} onChange={e=>setMsgInput(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{color:"#e9edef",caretColor:"#25d366"}}/>
                </div>
                <button onClick={msgInput.trim()?sendMessage:undefined}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                  style={{background:msgInput.trim()?"#25d366":"rgba(255,255,255,0.07)",color:msgInput.trim()?"white":"#8696a0"}}>
                  {msgInput.trim()?<Send size={16}/>:<Mic size={17}/>}
                </button>
              </div>
            </div>

            {/* Group Info Panel */}
            {showGroupInfo&&(
              <div className="border-l flex flex-col overflow-hidden transition-all duration-300"
                   style={{width:"40%",background:"#0e2224",borderColor:"rgba(255,255,255,0.06)"}}>
                <GroupInfoPanel chat={selectedChat} onClose={()=>setShowGroupInfo(false)}
                  onOpenDashboard={()=>setShowDashboard(true)}/>
              </div>
            )}
          </>
        ):(
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-5"
               style={{background:"#0b1d1f"}}>
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl"
                   style={{background:"rgba(37,211,102,0.08)",border:"1px solid rgba(37,211,102,0.12)"}}>
                💬
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center text-base"
                   style={{background:"#25d366"}}>✨</div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">VibeChat</h2>
              <p className="text-sm max-w-xs" style={{color:"#8696a0"}}>
                Select a conversation to start messaging, or create a new group from the ☰ menu.
              </p>
            </div>
            <button onClick={()=>setShowNewGroupModal(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
              style={{background:"linear-gradient(135deg,#25d366,#1a8a8a)"}}>
              <Plus size={16}/> New Group
            </button>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {showProfileModal&&currentUser&&(
        <ProfileModal user={currentUser} onClose={()=>setShowProfileModal(false)}
          onLogout={handleLogout} onUpdate={p=>{setCurrentUser(p);setShowProfileModal(false);}}/>
      )}
      {showNewGroupModal&&(
        <NewGroupModal onCreate={createGroup} onClose={()=>setShowNewGroupModal(false)}/>
      )}
      {showDashboard&&selectedChat&&(
        <FullDashboard chat={selectedChat} onClose={()=>setShowDashboard(false)}/>
      )}

      {/* Click outside to close hamburger */}
      {showHamburger&&(
        <div className="fixed inset-0 z-40" onClick={()=>setShowHamburger(false)}/>
      )}
    </div>
  );
}
