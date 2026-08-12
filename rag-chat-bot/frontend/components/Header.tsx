"use client";
import { useState } from "react";
import { CheckCircle2, Pencil, Save } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
export default function Header({ conversationId, title, onTitle }: { conversationId:string|null; title:string; onTitle:(v:string)=>void }) {
  const [editing,setEditing]=useState(false); const [value,setValue]=useState(title);
  async function save(){ if(!conversationId) return; await fetch(`${API}/conversations/${conversationId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:value.trim()||"New conversation"})}); onTitle(value.trim()||"New conversation"); setEditing(false); }
  return <header className="h-16 shrink-0 border-b border-stone-700/60 bg-bg/90 flex items-center justify-between px-5 lg:px-7">
    <div className="min-w-0">{editing?<div className="flex items-center gap-2"><input autoFocus value={value} onChange={e=>setValue(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()} className="bg-surface-raised border border-stone-700 rounded-md px-2 py-1 outline-none focus:border-accent"/><button onClick={save} aria-label="Save title"><Save size={16}/></button></div>:<div className="flex items-center gap-2"><h2 className="font-semibold truncate">{title}</h2>{conversationId&&<button onClick={()=>setEditing(true)} aria-label="Rename conversation" className="text-text-muted hover:text-text"><Pencil size={14}/></button>}</div>}<p className="text-xs text-text-muted mt-0.5">Grounded answers from your indexed knowledge base</p></div>
    <div className="hidden sm:flex items-center gap-2 rounded-full border border-stone-700/60 bg-surface px-3 py-1.5 text-xs text-text-muted"><CheckCircle2 size={14} className="text-accent"/> DocMind ready</div>
  </header>
}
