import { useState, useEffect } from 'react';
import { X, AlertCircle, Info, User } from 'lucide-react';
import './WelcomeModal.css';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show every time the page is loaded for the hackathon
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="welcome-modal-overlay">
      <div className="welcome-modal glass">
        <button className="welcome-close" onClick={handleClose}>
          <X size={20} />
        </button>
        
        <h2>Welcome to Synapse AI! 🚀</h2>
        
        <div className="welcome-section warning">
          <h3><AlertCircle size={18} /> Privacy & Security</h3>
          <p>
            Please note that user authentication is not currently implemented. 
            <strong> All chats across all sessions are visible to anyone visiting this page.</strong>
          </p>
        </div>

        <div className="welcome-section">
          <h3><Info size={18} /> Workspace Testing</h3>
          <p>
            Because there is no authentication, the agent doesn't automatically know who you are. 
            To use Workspace functions (like Calendar or Tasks), you must tell the agent the test email:
            <br />
            <strong>workspace.test.agent@gmail.com</strong>
            <br />
            at least once per chat session.
          </p>
        </div>

        <div className="welcome-section warning">
          <h3><AlertCircle size={18} /> Known Issue</h3>
          <p>
            The agent sometimes misbehaves if you immediately give it direct orders or complex commands (due to how the MCP server and ADK handle initial tool calling contexts). 
            <br />
            <strong>Please start by saying "Hi" or having a small chat first</strong> before assigning tasks!
          </p>
        </div>

        <div className="welcome-section">
          <h3><User size={18} /> About Me & The Project</h3>
          <p>
            Hi, I'm Mayank! Welcome to my submission for the Gen AI Academy APAC Final Hackathon. 
            Synapse AI is designed to act as an orchestrator of specialized agents, seamlessly managing your Calendar, Mail, Tasks, and Docs. I aim for it to feel like a deeply integrated, highly premium productivity assistant. Hope you enjoy!
          </p>
        </div>

        <button className="primary-btn welcome-btn" onClick={handleClose}>
          Let's get started
        </button>
      </div>
    </div>
  );
}
