import { create } from 'zustand'

const useStore = create((set, get) => ({

  // --- Auth ---
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({
    user: null,
    isAuthenticated: false,
    documents: [],
    messages: [],
    agentLogs: [],
    activeAgent: null,
    currentSources: [],
    followUpMessages: []
  }),

  // --- Documents ---
  documents: [],
  setDocuments: (documents) => set({ documents }),
  addDocument: (doc) => set((state) => ({
    documents: [doc, ...state.documents]
  })),
  clearDocuments: () => set({ documents: [] }),

  // --- Chat ---
  messages: [],
  isQuerying: false,
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  clearMessages: () => set({ messages: [] }),
  setIsQuerying: (val) => set({ isQuerying: val }),

  // --- Agent Activity ---
  agentLogs: [],
  activeAgent: null,
  resetAgentLogs: () => set({ agentLogs: [], activeAgent: null }),
  addAgentLog: (log) => set((state) => ({
    agentLogs: [...state.agentLogs, log]
  })),
  setActiveAgent: (agent) => set({ activeAgent: agent }),

  // --- Sources ---
  currentSources: [],
  setCurrentSources: (sources) => set({ currentSources: sources }),

  followUpMessages: [],
  addFollowUpMessage: (msg) => set(state => ({
    followUpMessages: [...state.followUpMessages, msg]
  })),
  clearFollowUpMessages: () => set({ followUpMessages: [] }),

}))

export default useStore