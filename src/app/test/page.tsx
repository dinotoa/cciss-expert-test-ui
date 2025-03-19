import ChatPanel from "@/components/chat/chat-panel";
import SUGGESTIONS from "@/data/traffic-chat-suggestions.json";

export default function TrafficPage() {
  return (
    <ChatPanel suggestions={SUGGESTIONS} apiEndpoint="/api/test-chat"/>
  );
}
