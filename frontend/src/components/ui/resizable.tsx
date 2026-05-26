import * as React from "react";
import { GripVertical } from "lucide-react";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import { cn } from "@/lib/utils";

type Direction = "horizontal" | "vertical";

const ResizablePanelGroup = ({
  className,
  direction,
  ...props
}: React.ComponentProps<typeof PanelGroup> & { direction?: Direction }) => (
  <PanelGroup
    orientation={direction ?? (props as any).orientation ?? "horizontal"}
    className={cn(
      "flex h-full w-full",
      direction === "vertical" ? "flex-col" : "",
      className
    )}
    {...props}
  />
)

const ResizablePanel = Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <PanelResizeHandle
    className={cn(
        "relative flex items-center justify-center bg-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
        className
      )}
    {...props}
    data-separator
    style={{ touchAction: "none", ...(props as any).style }}
  >
    {withHandle && (
        <div className="z-10 flex h-6 w-6 items-center justify-center rounded-sm border bg-border cursor-col-resize">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }