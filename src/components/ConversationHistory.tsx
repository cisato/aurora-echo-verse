import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/hooks/useConversations';
import { MessageSquare, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ConversationHistoryProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ConversationHistory({
  conversations,
  currentConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isCollapsed = false,
  onToggleCollapse
}: ConversationHistoryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (isCollapsed) {
    return (
      <div className="w-12 h-full border-r bg-background/60 backdrop-blur-lg flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          className="mb-4"
          onClick={onToggleCollapse}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewConversation}
          className="mb-2"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col items-center gap-1 px-1">
            {conversations.slice(0, 10).map((conv) => (
              <Button
                key={conv.id}
                variant={currentConversation?.id === conv.id ? "secondary" : "ghost"}
                size="icon"
                className="w-10 h-10"
                onClick={() => onSelectConversation(conv)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="w-64 h-full border-r bg-background/60 backdrop-blur-lg flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm">Conversations</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onNewConversation}
          >
            <Plus className="h-4 w-4" />
          </Button>
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleCollapse}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No conversations yet
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group relative rounded-lg p-2 cursor-pointer transition-colors",
                  currentConversation?.id === conv.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50"
                )}
                onClick={() => onSelectConversation(conv)}
                onMouseEnter={() => setHoveredId(conv.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {conv.title || 'New Conversation'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                {hoveredId === conv.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
