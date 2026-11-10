import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useProjectStore } from '../../store/useProjectStore';
import { UIElement } from '../../types/uiBuilder';
import { Globe, FileText, Component } from 'lucide-react';

const PageNode: React.FC<{ data: { label: string; route: string; isHome: boolean; count: number } }> = ({ data }) => {
  return (
    <div className="bg-[#18191D] border border-[#8B7CFF] rounded-[10px] p-3 min-w-[170px] shadow-lg text-[#F5F5F7] select-none">
      <Handle type="target" position={Position.Top} className="!bg-[#8B7CFF]" />
      <div className="flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 text-[#8B7CFF]" />
        <span className="font-semibold text-xs tracking-tight">{data.label}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-[#96969F] font-mono">
        <span>{data.route}</span>
        <span className="bg-[#202126] px-1.5 py-0.5 rounded-[4px] text-zinc-300">{data.count} items</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-[#8B7CFF]" />
    </div>
  );
};

const ComponentNode: React.FC<{ data: { label: string; tag: string; type: string } }> = ({ data }) => {
  return (
    <div className="bg-[#101114] border border-[rgba(255,255,255,0.08)] hover:border-[#8B7CFF] rounded-[8px] p-2 min-w-[140px] shadow-sm text-xs select-none transition-colors">
      <Handle type="target" position={Position.Top} className="!bg-zinc-600" />
      <div className="flex items-center gap-1.5">
        <Component className="w-3 h-3 text-[#8B7CFF]" />
        <span className="font-medium text-[#F5F5F7] truncate">{data.label}</span>
      </div>
      <div className="text-[9px] text-[#96969F] font-mono mt-0.5">&lt;{data.tag}&gt;</div>
      <Handle type="source" position={Position.Bottom} className="!bg-zinc-600" />
    </div>
  );
};

const nodeTypes = {
  pageNode: PageNode,
  componentNode: ComponentNode,
};

export const WebsiteGraph: React.FC = () => {
  const { pages, setWorkspace, setActivePage, setSelectedUIElementId } = useProjectStore();

  const { nodes, edges } = useMemo(() => {
    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];

    // Root project node
    generatedNodes.push({
      id: 'root_project',
      position: { x: 380, y: 25 },
      data: { label: 'SŌZŌ Studio Application Root' },
      style: {
        backgroundColor: '#202126',
        color: '#F5F5F7',
        border: '1px solid #8B7CFF',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '11px',
        padding: '8px 16px',
        textAlign: 'center',
      },
    });

    pages.forEach((page, pageIndex) => {
      const pageNodeId = `node_${page.id}`;
      const pageX = 180 + pageIndex * 300;
      const pageY = 120;

      const countChildren = (el: UIElement): number =>
        1 + el.children.reduce((acc, c) => acc + countChildren(c), 0);

      generatedNodes.push({
        id: pageNodeId,
        type: 'pageNode',
        position: { x: pageX, y: pageY },
        data: {
          label: page.name,
          route: page.route,
          isHome: page.isHome,
          count: countChildren(page.rootElement),
        },
      });

      generatedEdges.push({
        id: `edge_proj_${page.id}`,
        source: 'root_project',
        target: pageNodeId,
        animated: true,
        style: { stroke: '#8B7CFF', strokeWidth: 1.5 },
      });

      page.rootElement.children.forEach((child, childIndex) => {
        const childNodeId = `node_${child.id}`;
        const childX = pageX - 60 + childIndex * 160;
        const childY = pageY + 110;

        generatedNodes.push({
          id: childNodeId,
          type: 'componentNode',
          position: { x: childX, y: childY },
          data: {
            label: child.name,
            tag: child.tag,
            type: child.type,
            elementId: child.id,
            pageId: page.id,
          },
        });

        generatedEdges.push({
          id: `edge_${page.id}_${child.id}`,
          source: pageNodeId,
          target: childNodeId,
          style: { stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1 },
        });

        child.children.slice(0, 3).forEach((subChild, subIndex) => {
          const subNodeId = `node_${subChild.id}`;
          generatedNodes.push({
            id: subNodeId,
            type: 'componentNode',
            position: { x: childX - 30 + subIndex * 130, y: childY + 95 },
            data: {
              label: subChild.name,
              tag: subChild.tag,
              type: subChild.type,
              elementId: subChild.id,
              pageId: page.id,
            },
          });

          generatedEdges.push({
            id: `edge_${child.id}_${subChild.id}`,
            source: childNodeId,
            target: subNodeId,
            style: { stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 },
          });
        });
      });
    });

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [pages]);

  const onNodeClick = (_: any, node: Node) => {
    if (node.data?.pageId && node.data?.elementId) {
      setActivePage(node.data.pageId as string);
      setSelectedUIElementId(node.data.elementId as string);
      setWorkspace('builder');
    } else if (node.type === 'pageNode') {
      const pageId = node.id.replace('node_', '');
      setActivePage(pageId);
      setWorkspace('builder');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#101114] text-[#F5F5F7] overflow-hidden">
      <div className="h-9 bg-[#18191D] border-b border-[rgba(255,255,255,0.08)] px-3.5 flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-[#8B7CFF]" />
          <span className="font-semibold text-[#F5F5F7] text-[11px]">Architecture Graph</span>
          <span className="text-[#686873]">·</span>
          <span className="text-[#96969F] text-[11px]">
            Click any component node to jump into UI Builder
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#96969F] text-[10px] font-mono">
          <span>{nodes.length} Nodes</span>
          <span>{edges.length} Connections</span>
        </div>
      </div>

      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background color="rgba(255,255,255,0.05)" gap={20} size={1} />
          <Controls className="!bg-[#18191D] !border-[rgba(255,255,255,0.08)] !rounded-[6px]" />
          <MiniMap
            nodeColor="#8B7CFF"
            maskColor="rgba(16, 17, 20, 0.85)"
            className="!bg-[#18191D] !border-[rgba(255,255,255,0.08)] !rounded-[6px]"
          />
        </ReactFlow>
      </div>
    </div>
  );
};
