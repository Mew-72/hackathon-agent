import { useState, useEffect } from 'react';
import { X, AlertCircle, Info, User } from 'lucide-react';
import './WelcomeModal.css';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show only once per session
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcomeModal');
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenWelcomeModal', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="welcome-modal-overlay">
      <div className="welcome-modal glass">
        <button className="welcome-close" onClick={handleClose}>
          <X size={20} />
        </button>
        
        <h2>Welcome to Synapse AI! 🚀</h2>
        
        <div className="welcome-section">
          <h3><Info size={18} /> Test Account</h3>
          <p>
            For the hackathon judges: The system is integrated with Workspace using this test email:
            <br />
            <strong>workspace.test.agent@gmail.com</strong>
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
