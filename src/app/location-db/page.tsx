import ChatPanel from "@/components/chat/chat-panel";
import SUGGESTIONS from "@/data/locationdb-chat-suggestions.json";

export default function LocationDBPage() {
  return (
    <ChatPanel suggestions={SUGGESTIONS} apiEndpoint="/api/locationdb-chat"/>
  );
}
