
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface UseChatState {
  handleSendMessage: (text: string) => void;
}

export const useQuickActions = (chatState: UseChatState) => {
  const navigate = useNavigate();
  const { handleSendMessage } = chatState;
  
  const handleActionRequest = (action: string) => {
    switch(action) {
      case "chat":
        navigate("/chat");
        break;
      case "voice":
        navigate("/chat");
        setTimeout(() => {
          // Trigger voice button in chat window
          document.querySelector('[aria-label="Toggle recording"]')?.dispatchEvent(
            new MouseEvent('click', { bubbles: true })
          );
        }, 300);
        break;
      case "search":
        navigate("/search");
        break;
      case "weather":
        navigate("/weather");
        break;
      case "code":
        navigate("/code");
        break;
      case "web":
        navigate("/web");
        break;
      case "reminders":
        toast.info("Reminder view not implemented in demo");
        break;
      case "memory":
        navigate("/");
        // Use custom event to communicate with parent component
        window.dispatchEvent(new CustomEvent('setMode', { detail: { mode: "memory" } }));
        break;
      case "multimodal":
        window.dispatchEvent(new CustomEvent('setMode', { detail: { mode: "multimodal" } }));
        break;
      case "personas":
        window.dispatchEvent(new CustomEvent('setMode', { detail: { mode: "personas" } }));
        break;
      case "reports":
        window.dispatchEvent(new CustomEvent('setMode', { detail: { mode: "reports" } }));
        break;
      case "settings":
        navigate("/settings");
        break;
      case "today":
        handleSendMessage("What's the date today?");
        navigate("/chat");
        break;
      case "help":
        handleSendMessage("What can you help me with?");
        navigate("/chat");
        break;
      case "joke":
        handleSendMessage("Tell me a joke");
        navigate("/chat");
        break;
      default:
        break;
    }
    
    if (action !== "reminders") {
      toast.success(`Quick action: ${action} activated`);
    }
  };

  return { handleActionRequest };
};
