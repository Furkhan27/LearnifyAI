import React, { useEffect, useRef, useState } from "react";
import cytoscape, { Core, NodeCollection } from "cytoscape";
import dagre from "cytoscape-dagre";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { Book, Rocket, Brain } from "lucide-react";

cytoscape.use(dagre);

interface NodeData {
  id: string;
  label: string;
}

export default function KnowledgeGraph() {
  const cyRef = useRef<Core | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [nodes, setNodes] = useState<NodeData[]>([
    { id: "math", label: "Mathematics" },
    { id: "algebra", label: "Algebra" },
    { id: "geometry", label: "Geometry" },
    { id: "ml", label: "Machine Learning" },
  ]);
  const [edges, setEdges] = useState([
    { source: "math", target: "algebra" },
    { source: "math", target: "geometry" },
    { source: "algebra", target: "ml" },
  ]);
  const [newNode, setNewNode] = useState("");
  const [goal, setGoal] = useState("");
  const [roadmap, setRoadmap] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Initialize Cytoscape once
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      layout: {
        name: "dagre",
        rankDir: "LR",
        nodeSep: 80,
        edgeSep: 60,
        rankSep: 120,
        fit: true,
        padding: 100,
      } as any,
      zoomingEnabled: false,
      userZoomingEnabled: false,
      panningEnabled: true,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#6366f1",
            label: "data(label)",
            color: "#fff",
            "text-outline-color": "#0b1220",
            "text-outline-width": 3,
            "font-size": "14px",
            "border-width": 2,
            "border-color": "#a5b4fc",
            width: 70,
            height: 70,
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#94a3b8",
            "target-arrow-color": "#94a3b8",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
        {
          selector: ".highlighted",
          style: {
            "background-color": "#22d3ee",
            "border-color": "#06b6d4",
            "transition-property": "background-color, border-color",
            "transition-duration": 0.4,
          },
        },
      ],
    });

    cyRef.current = cy;

    // ✅ Dynamic resizing
    const observer = new ResizeObserver(() => {
      cy.resize();
      cy.fit(undefined, 80);
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      cy.destroy();
    };
  }, []);

  // ✅ Update layout dynamically
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().remove();
    cy.add([
      ...nodes.map((n) => ({ data: { id: n.id, label: n.label } })),
      ...edges.map((e) => ({ data: { source: e.source, target: e.target } })),
    ]);

    const layout = cy.layout({
      name: "dagre",
      rankDir: "LR",
      nodeSep: 80,
      edgeSep: 60,
      rankSep: 120,
      fit: true,
      padding: 100,
    } as any);

    layout.run();
    setTimeout(() => {
      cy.center();
      cy.fit(undefined, 100);
    }, 200);
  }, [nodes, edges]);

  // ✅ Add Node using Gemini parent suggestion
  const handleAddNode = async () => {
    const trimmed = newNode.trim();
    if (!trimmed) return toast.error("Enter a node name");

    const id = trimmed.toLowerCase().replace(/\s+/g, "-");
    if (nodes.find((n) => n.id === id))
      return toast.error("Node already exists");

    try {
      const response = await fetch("http://localhost:5000/api/suggest-parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newNode: trimmed,
          existingNodes: nodes.map((n) => n.label),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gemini failed");

      const parentLabel = data.parent || "Mathematics";
      const parentNode = nodes.find(
        (n) => n.label.toLowerCase() === parentLabel.toLowerCase()
      );
      const parentId = parentNode ? parentNode.id : "math";

      setNodes((prev) => [...prev, { id, label: trimmed }]);
      setEdges((prev) => [...prev, { source: parentId, target: id }]);
      setNewNode("");
      toast.success(`Added "${trimmed}" under "${parentLabel}"`);
    } catch (err) {
      console.error(err);
      toast.error("AI parent suggestion failed");
    }
  };

  // ✅ Generate AI Roadmap
  const generateRoadmap = async () => {
    if (!goal.trim()) return toast.error("Enter your learning goal first!");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate roadmap");

      setRoadmap(data.steps || []);
      toast.success("Roadmap generated successfully 🚀");

      const cy = cyRef.current;
      if (!cy) return;
      cy.nodes().removeClass("highlighted");

      data.steps.forEach((step: string) => {
        const id = step.toLowerCase().replace(/\s+/g, "-");
        const node = cy.$id(id) as NodeCollection;
        if (node.nonempty()) node.addClass("highlighted");
      });

      cy.center();
      cy.fit(undefined, 100);
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to AI engine");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Focus node when clicking a roadmap step
  const focusNodeForStep = (step: string) => {
    const cy = cyRef.current;
    if (!cy) return;
    const id = step.toLowerCase().replace(/\s+/g, "-");
    const node = cy.$id(id) as NodeCollection;
    if (!node.nonempty()) return toast("No matching node found", { icon: "ℹ️" });

    cy.animate({ center: { eles: node }, duration: 600 });
    node.addClass("highlighted");
    setTimeout(() => node.removeClass("highlighted"), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#101828] to-[#1e293b] text-white flex flex-col items-center py-10 px-6">
      <Toaster position="top-center" />

      <h1 className="text-3xl font-semibold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-2">
        💭 Knowledge Graph Memory System
      </h1>

      {/* Graph container */}
      <motion.div
        ref={containerRef}
        className="w-full max-w-6xl h-[500px] rounded-2xl border border-white/20 backdrop-blur-xl bg-white/10 shadow-2xl mb-8 transition-all duration-500 hover:shadow-indigo-600/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Node input */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Add new concept..."
          value={newNode}
          onChange={(e) => setNewNode(e.target.value)}
          className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 transition-all w-64"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAddNode}
          className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold transition-all shadow-md hover:shadow-indigo-400/40"
        >
          ➕ Add Node
        </motion.button>
      </div>

      {/* Roadmap section */}
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-indigo-300">
          🎯 AI-Powered Roadmap Generator
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="e.g. Learn Machine Learning"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={generateRoadmap}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-md ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/30"
            }`}
          >
            {loading ? "Generating..." : "Generate"}
          </motion.button>
        </div>

        {roadmap.length > 0 && (
          <VerticalTimeline lineColor="#6366f1" className="mt-6">
            {roadmap.map((step, i) => (
              <VerticalTimelineElement
                key={i}
                icon={i === 0 ? <Brain /> : <Book />}
                iconStyle={{ background: "#6366f1", color: "#fff" }}
                contentStyle={{
                  background: "rgba(30,41,59,0.8)",
                  border: "1px solid rgba(99,102,241,0.4)",
                  color: "#fff",
                }}
              >
                <div
                  onClick={() => focusNodeForStep(step)}
                  className="cursor-pointer"
                >
                  <h4 className="text-indigo-300 font-semibold">
                    Step {i + 1}
                  </h4>
                  <p className="hover:text-cyan-300 transition-colors">{step}</p>
                </div>
              </VerticalTimelineElement>
            ))}
          </VerticalTimeline>
        )}
      </div>
    </div>
  );
}
