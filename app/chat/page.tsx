import ChatInterface from "../../components/ChatInterface";

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-80px)] flex-col space-y-6 py-6">
      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] px-8 py-6">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">AI Chat</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Talk to your agent in natural language.
        </h1>
        <p className="mt-2 text-slate-400 text-sm">
          Query yield opportunities, check your portfolio, audit pools, or configure risk settings.
        </p>
      </section>

      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}
