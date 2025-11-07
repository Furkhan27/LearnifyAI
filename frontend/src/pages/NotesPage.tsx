import React, { useEffect, useState } from "react";
import { FileText, ExternalLink, ChevronDown } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { motion } from "framer-motion";

interface Note {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  semester?: string;
}

const SEMESTERS = [
  "All Semesters",
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [selectedSemester, setSelectedSemester] = useState("All Semesters");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/notes")
      .then((res) => res.json())
      .then((data) => {
        const taggedNotes = data.map((note: Note) => ({
          ...note,
          semester: extractSemester(note.name),
        }));
        setNotes(taggedNotes);
        setFilteredNotes(taggedNotes);
      })
      .catch((err) => console.error("❌ Failed to fetch notes:", err))
      .finally(() => setLoading(false));
  }, []);

  const extractSemester = (name: string) => {
    const match = name.match(/sem(ester)?\s*([1-8])/i);
    return match ? `Semester ${match[2]}` : "General";
  };

  useEffect(() => {
    if (selectedSemester === "All Semesters") setFilteredNotes(notes);
    else setFilteredNotes(notes.filter((n) => n.semester === selectedSemester));
  }, [selectedSemester, notes]);

  return (
    <DashboardLayout role="student">
      <div className="p-6 text-white min-h-screen relative">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-indigo-400">🧾 Engineering Notes</h1>
            <p className="text-gray-400">Access semester-wise study notes</p>
          </div>

          {/* Glassmorphic Dropdown */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-lg text-indigo-300 font-medium hover:bg-white/20 transition-all"
            >
              {selectedSemester}
              <ChevronDown
                className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                size={18}
              />
            </motion.button>

            {dropdownOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg z-10"
              >
                {SEMESTERS.map((sem) => (
                  <li
                    key={sem}
                    onClick={() => {
                      setSelectedSemester(sem);
                      setDropdownOpen(false);
                    }}
                    className={`px-4 py-2 cursor-pointer hover:bg-white/20 transition ${
                      selectedSemester === sem ? "text-indigo-400" : "text-white"
                    }`}
                  >
                    {sem}
                  </li>
                ))}
              </motion.ul>
            )}
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <p>Loading notes...</p>
        ) : filteredNotes.length === 0 ? (
          <p className="text-gray-400 mt-10 text-center">No notes found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white/10 border border-white/20 rounded-2xl p-5 flex flex-col items-start shadow-lg hover:shadow-indigo-500/40 transition-all duration-300"
              >
                <div className="w-full flex justify-center items-center mb-4 text-indigo-400">
                  <FileText size={48} />
                </div>

                <h2 className="text-lg font-semibold text-white truncate w-full">
                  {note.name.replace(/\.[^/.]+$/, "")}
                </h2>

                <p className="text-sm text-gray-400 mt-1">{note.semester}</p>

                <a
                  href={note.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold w-full transition"
                >
                  <ExternalLink size={16} />
                  View / Download
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
