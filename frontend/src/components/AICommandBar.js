import React, { useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const QUICK_COMMANDS = [
  { id: "more_trekking", label: "🥾 Add More Trekking", desc: "Inject mountain hikes & scenic trails" },
  { id: "reduce_travel_time", label: "⏱️ Reduce Travel Time", desc: "Cluster attractions to minimize transit" },
  { id: "make_cheaper", label: "💸 Make It Cheaper", desc: "Suggest budget dhabas & low-cost transit" },
  { id: "more_relaxing", label: "🧘 Make It More Relaxing", desc: "Slower pace with scenic cafe breaks" },
  { id: "add_local_food", label: "🍛 Add Local Street Food", desc: "Inject iconic regional food stops" },
  { id: "optimize_budget", label: "📊 Optimize Budget", desc: "Auto-tune costs to match target budget" }
];

const AICommandBar = ({ itinerary, tripMeta, onItineraryUpdated, selectedDay, totalDays }) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCommand, setActiveCommand] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [targetRegenDay, setTargetRegenDay] = useState(selectedDay || 1);

  const executeCommand = async (commandType, dayNum = null, promptText = null) => {
    setLoading(true);
    setActiveCommand(commandType);
    setStatusMsg("");

    try {
      const payload = {
        commandType,
        dayNumber: dayNum || targetRegenDay,
        customPrompt: promptText || customPrompt,
        currentItinerary: itinerary,
        tripMeta: tripMeta || {}
      };

      const res = await axios.post(`${API}/api/ai/command`, payload);
      if (res.data?.success && Array.isArray(res.data.itinerary)) {
        onItineraryUpdated(res.data.itinerary, res.data.totalCost);
        setStatusMsg(`✨ AI successfully applied: ${promptText || commandType.replace(/_/g, " ")}`);
        setCustomPrompt("");
        setTimeout(() => setStatusMsg(""), 4500);
      }
    } catch (err) {
      console.error("Error running AI command:", err);
      setStatusMsg("⚠️ Could not process AI command. Please try again.");
    } finally {
      setLoading(false);
      setActiveCommand(null);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    executeCommand("custom_prompt", targetRegenDay, customPrompt.trim());
  };

  const daysCount = totalDays || itinerary?.length || 3;
  const dayOptions = Array.from({ length: daysCount }, (_, i) => i + 1);

  return (
    <div className="ai-command-bar-wrapper">
      <div className="ai-command-header">
        <div className="ai-command-title">
          <span className="ai-sparkle-icon">✨</span>
          <div>
            <h4>AI Itinerary Assistant & Quick Commands</h4>
            <p>Refine your Indian travel schedule with real-time AI adjustments</p>
          </div>
        </div>

        {/* Day Selector for Regenerate Day command */}
        <div className="ai-day-selector-group">
          <label htmlFor="ai-regen-day">Select Day:</label>
          <select
            id="ai-regen-day"
            value={targetRegenDay}
            onChange={(e) => setTargetRegenDay(parseInt(e.target.value, 10))}
            disabled={loading}
          >
            {dayOptions.map((d) => (
              <option key={d} value={d}>
                Day {d}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-ai-regen-day"
            onClick={() => executeCommand("regenerate_day", targetRegenDay)}
            disabled={loading}
          >
            {loading && activeCommand === "regenerate_day" ? "Regenerating..." : `🔄 Regenerate Day ${targetRegenDay}`}
          </button>
        </div>
      </div>

      {/* Quick Command Pills */}
      <div className="ai-quick-pills-row">
        {QUICK_COMMANDS.map((cmd) => (
          <button
            key={cmd.id}
            type="button"
            className={`ai-pill-btn ${activeCommand === cmd.id ? "active-loading" : ""}`}
            onClick={() => executeCommand(cmd.id)}
            disabled={loading}
            title={cmd.desc}
          >
            {loading && activeCommand === cmd.id ? "Applying..." : cmd.label}
          </button>
        ))}
      </div>

      {/* Natural Language Custom Command Input */}
      <form onSubmit={handleCustomSubmit} className="ai-custom-prompt-form">
        <div className="ai-prompt-input-group">
          <span className="ai-prompt-prefix">💬 Prompt AI:</span>
          <input
            type="text"
            placeholder="e.g. Add an early sunrise photography point, or make Day 3 more cultural..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn-ai-prompt-send" disabled={loading || !customPrompt.trim()}>
            {loading && activeCommand === "custom_prompt" ? "Thinking..." : "Run AI"}
          </button>
        </div>
      </form>

      {/* Status Feedback Toast */}
      {statusMsg && (
        <div className="ai-status-toast animate-fade-in">
          {statusMsg}
        </div>
      )}
    </div>
  );
};

export default AICommandBar;
