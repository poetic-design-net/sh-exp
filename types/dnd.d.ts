declare module '@hello-pangea/dnd' {
  import * as React from 'react';

  export type DraggableId = string;
  export type DroppableId = string;
  export type DragStart = any;
  export type DropResult = {
    draggableId: DraggableId;
    type: string;
    source: {
      droppableId: DroppableId;
      index: number;
    };
    destination?: {
      droppableId: DroppableId;
      index: number;
    };
  };

  export interface DroppableProvided {
    innerRef: (element: HTMLElement | null) => void;
    placeholder?: React.ReactElement;
    droppableProps: {
      [key: string]: any;
    };
  }

  export interface DraggableProvided {
    innerRef: (element: HTMLElement | null) => void;
    draggableProps: {
      [key: string]: any;
    };
    dragHandleProps: {
      [key: string]: any;
    } | null;
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean;
    draggingOver: DroppableId | null;
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith: DraggableId | null;
  }

  export interface DragDropContextProps {
    onBeforeCapture?(before: DragStart): void;
    onBeforeDragStart?(initial: DragStart): void;
    onDragStart?(initial: DragStart, provided: ResponderProvided): void;
    onDragUpdate?(initial: DragStart, provided: ResponderProvided): void;
    onDragEnd(result: DropResult, provided: ResponderProvided): void;
    children: React.ReactNode;
  }

  export interface ResponderProvided {
    announce: (message: string) => void;
  }

  export const DragDropContext: React.FC<DragDropContextProps>;

  export interface DroppableProps {
    droppableId: DroppableId;
    type?: string;
    mode?: 'standard' | 'virtual';
    isDropDisabled?: boolean;
    isCombineEnabled?: boolean;
    direction?: 'vertical' | 'horizontal';
    ignoreContainerClipping?: boolean;
    renderClone?: any;
    getContainerForClone?: () => HTMLElement;
    children(provided: DroppableProvided, snapshot: DroppableStateSnapshot): React.ReactElement;
  }

  export const Droppable: React.FC<DroppableProps>;

  export interface DraggableProps {
    draggableId: DraggableId;
    index: number;
    isDragDisabled?: boolean;
    disableInteractiveElementBlocking?: boolean;
    shouldRespectForcePress?: boolean;
    children(
      provided: DraggableProvided,
      snapshot: DraggableStateSnapshot
    ): React.ReactElement;
  }

  export const Draggable: React.FC<DraggableProps>;
}
