"use client";

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  Node,
  Connection,
  Edge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  Handle,
  Position,
  useKeyPress,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Database, 
  Workflow,
  FileJson,
  FileCode,
  ShoppingCart,
  LucideIcon,
  Zap,
  Filter,
  Layers,
  Link,
  X,
  Play,
  Square
} from 'lucide-react';

interface NodeData {
  label: string;
  type: string;
  icon?: LucideIcon;
  category: 'connector' | 'transformation' | 'job' | 'start' | 'end';
}

const StartNode = ({ id }: { id: string }) => {
    return (
      <div className="relative">
        <div className="rounded-xl border-2 border-dashed border-green-500 p-2">
          <div className="w-[60px] h-[60px] bg-green-500 rounded-xl flex items-center justify-center">
            <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent ml-2" />
          </div>
          <Handle
            type="source"
            position={Position.Right}
            id={`${id}-source`}
            className="w-2 h-2 !bg-blue-500"
          />
        </div>
        <div className="absolute top-[75px] left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-sm font-medium">Start</span>
        </div>
      </div>
    );
  };
  
  const EndNode = ({ id }: { id: string }) => {
    return (
      <div className="relative">
        <div className="rounded-xl border-2 border-dashed border-red-500 p-2">
          <div className="w-[60px] h-[60px] bg-red-500 rounded-xl flex items-center justify-center">
            <div className="w-[24px] h-[24px] bg-white rounded-sm" />
          </div>
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-target`}
            className="w-2 h-2 !bg-blue-500"
          />
        </div>
        <div className="absolute top-[75px] left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-sm font-medium">End</span>
        </div>
      </div>
    );
  };

const isValidConnection = (connection: Connection): boolean => {
  const sourceNode = document.querySelector(`[data-id="${connection.source}"]`);
  const targetNode = document.querySelector(`[data-id="${connection.target}"]`);
  
  if (!sourceNode || !targetNode) return false;
  
  const sourceType = sourceNode.getAttribute('data-category');
  const targetType = targetNode.getAttribute('data-category');
  
  // Start node can only connect to connectors or transformations
  if (sourceType === 'start' && !['connector', 'transformation'].includes(targetType || '')) {
    return false;
  }

  // End node can only receive connections from connectors or transformations
  if (targetType === 'end' && !['connector', 'transformation'].includes(sourceType || '')) {
    return false;
  }

  // Jobs cannot connect to anything
  if (sourceType === 'job' || targetType === 'job') {
    return false;
  }
  
  // Connectors can only connect to transformations
  if (sourceType === 'connector' && targetType !== 'transformation') {
    return false;
  }
  
  // Transformations can only connect to connectors or the end node
  if (sourceType === 'transformation' && !['connector', 'end'].includes(targetType || '')) {
    return false;
  }
  
  return true;
};

const CustomNode = ({ id, data, selected }: { id: string, data: NodeData, selected: boolean }) => {
  const { deleteElements } = useReactFlow();
  const IconComponent = data.icon;

  if (!IconComponent) return null;

  const handleClose = () => {
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-lg p-2 border-2 border-gray-200 w-[100px] relative group"
      data-category={data.category}
      data-id={id}
    >
      {selected && (
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      
      {data.category !== 'job' && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-left`}
            className="w-2 h-2 !bg-blue-500"
            isValidConnection={isValidConnection}
          />
          <Handle
            type="source"
            position={Position.Right}
            id={`${id}-right`}
            className="w-2 h-2 !bg-blue-500"
            isValidConnection={isValidConnection}
          />
        </>
      )}
      
      <div className="flex flex-col items-center gap-1">
        <div className="p-1 bg-blue-50 rounded-lg">
          <IconComponent className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-gray-800 text-xs">{data.label}</h3>
          <p className="text-[10px] text-gray-500">{data.type}</p>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const connectors = [
    { type: 'SAP', label: 'ERP', icon: Database, category: 'connector' },
    { type: 'SALESFORCE', label: 'CRM', icon: Database, category: 'connector' },
    { type: 'fileJson', label: 'JSON', icon: FileJson, category: 'connector' },
    { type: 'fileXml', label: 'XML', icon: FileCode, category: 'connector' },
  ];

  const transformations = [
    { type: 'lookup', label: 'Lookup', icon: Filter, category: 'transformation' },
    { type: 'aggregate', label: 'Aggregate', icon: Layers, category: 'transformation' },
    { type: 'split', label: 'Conditional Split', icon: Zap, category: 'transformation' },
  ];

  const jobs = [
    { type: 'cron', label: 'Cron', icon: Link, category: 'job' },
    { type: 'webhook', label: 'Webhook', icon: Link, category: 'job' },
  ];

  const onDragStart = (event: React.DragEvent, component: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ 
      type: component.type, 
      label: component.label,
      iconType: component.icon.name,
      category: component.category
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-[240px] bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Connectors</h2>
      {connectors.map((connector) => (
        <div
          key={connector.type}
          className="p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors mb-2"
          draggable
          onDragStart={(e) => onDragStart(e, connector)}
        >
          <div className="flex items-center gap-3">
            <connector.icon className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">{connector.label}</span>
          </div>
        </div>
      ))}
      <h2 className="text-lg font-semibold mt-6 mb-4">Transformations</h2>
      {transformations.map((transformation) => (
        <div
          key={transformation.type}
          className="p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors mb-2"
          draggable
          onDragStart={(e) => onDragStart(e, transformation)}
        >
          <div className="flex items-center gap-3">
            <transformation.icon className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">{transformation.label}</span>
          </div>
        </div>
      ))}
      <h2 className="text-lg font-semibold mt-6 mb-4">Jobs</h2>
      {jobs.map((job) => (
        <div
          key={job.type}
          className="p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors mb-2"
          draggable
          onDragStart={(e) => onDragStart(e, job)}
        >
          <div className="flex items-center gap-3">
            <job.icon className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">{job.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const Flow = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { project, deleteElements } = useReactFlow();
  const deleteKeyPressed = useKeyPress('Delete');
  const backspaceKeyPressed = useKeyPress('Backspace');

  useEffect(() => {
    const initialNodes: Node[] = [
      {
        id: 'start',
        type: 'start',
        position: { x: 100, y: 250 },
        data: { label: 'Start', category: 'start' },
        draggable: true,
      },
      {
        id: 'end',
        type: 'end',
        position: { x: 900, y: 250 },
        data: { label: 'End', category: 'end' },
        draggable: true,
      },
    ];
    
    setNodes(initialNodes);
  }, []);

  useEffect(() => {
    if (deleteKeyPressed || backspaceKeyPressed) {
      const selectedNodes = nodes.filter(node => node.selected && !['start', 'end'].includes(node.id));
      const selectedEdges = edges.filter(edge => edge.selected);
      
      if (selectedNodes.length > 0 || selectedEdges.length > 0) {
        deleteElements({
          nodes: selectedNodes,
          edges: selectedEdges,
        });
      }
    }
  }, [deleteKeyPressed, backspaceKeyPressed, nodes, edges, deleteElements]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (isValidConnection(params)) {
        setEdges((eds) => addEdge({ ...params, animated: true }, eds));
      }
    },
    [setEdges]
  );

  const iconMap: Record<string, LucideIcon> = {
    workflow: Workflow,
    ecommerce: ShoppingCart,
    lookup: Filter,
    aggregate: Layers,
    split: Zap,
    cron: Link,
    webhook: Link,
    SAP: Database,
    SALESFORCE: Database,
    fileJson: FileJson,
    fileXml: FileCode,
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const dataStr = event.dataTransfer.getData('application/reactflow');

      try {
        const data = JSON.parse(dataStr);
        const iconComponent = iconMap[data.type];

        if (!iconComponent) {
          console.error(`Icon type "${data.type}" not found.`);
          return;
        }

        const position = project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode = {
          id: `${data.type}-${nodes.length + 1}`,
          type: 'custom',
          position: {
            x: position.x,
            y: 250, // Keep consistent Y position
          },
          data: {
            label: data.label,
            type: data.type,
            icon: iconComponent,
            category: data.category,
          },
        };

        setNodes((nds) => nds.concat(newNode));
      } catch (error) {
        console.error('Drop error:', error);
      }
    },
    [project, nodes, setNodes]
  );

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
    start: StartNode,
    end: EndNode,
  }), []);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        className="bg-gray-50"
        deleteKeyCode={['Delete', 'Backspace']}
        defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
        minZoom={0.5}
        maxZoom={1.5}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export function FlowBuilder() {
  return (
    <div className="flex w-full h-screen">
      <Sidebar />
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}