import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Multimodal } from "@/components/Multimodal";
import Reports from "@/pages/Reports";
import { ChatWindow } from "@/components/ChatWindow";

/**
 * Workspace — one place for creation: conversation-driven drafting,
 * visual work, and generated documents.
 */
export default function Workspace() {
  const [tab, setTab] = useState("create");

  useEffect(() => {
    const onPrompt = (e: Event) => {
      const detail = (e as CustomEvent).detail as { prompt?: string; surface?: string };
      if (detail?.surface !== "workspace") return;
      setTab("create");
      // Hand the prompt to the conversation surface inside Workspace.
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("aurora:prompt", { detail: { prompt: detail.prompt } }));
      }, 150);
    };
    window.addEventListener("aurora:prompt", onPrompt as EventListener);
    return () => window.removeEventListener("aurora:prompt", onPrompt as EventListener);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/50 px-4 pt-4">
        <h1 className="font-display text-xl tracking-tight">Workspace</h1>
        <p className="mb-3 text-xs text-muted-foreground">Write, build, analyse, and generate.</p>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="rounded-xl">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="min-h-0 flex-1">
        <Tabs value={tab} onValueChange={setTab} className="h-full">
          <TabsContent value="create" className="m-0 h-full data-[state=inactive]:hidden">
            <ChatWindow />
          </TabsContent>
          <TabsContent value="visual" className="m-0 h-full overflow-auto data-[state=inactive]:hidden">
            <Multimodal />
          </TabsContent>
          <TabsContent value="documents" className="m-0 h-full overflow-auto data-[state=inactive]:hidden">
            <Reports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
