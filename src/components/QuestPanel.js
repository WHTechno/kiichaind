import { useState } from 'react';

export default function QuestPanel() {
  const [quests, setQuests] = useState([
    { id: 1, name: "Connect X Account", completed: false, reward: 50, action: "connect" },
    { id: 2, name: "Follow our X Account", completed: false, reward: 30, action: "follow" },
    { id: 3, name: "Like our latest post", completed: false, reward: 20, action: "like" },
    { id: 4, name: "Retweet our latest post", completed: false, reward: 30, action: "retweet" }
  ]);

  const completeQuest = (id) => {
    setQuests(quests.map(quest => 
      quest.id === id ? { ...quest, completed: true } : quest
    ));
    
    // In a real app, you would call a backend API or smart contract here
    const quest = quests.find(q => q.id === id);
    alert(`Quest "${quest.name}" completed! You earned ${quest.reward} points.`);
  };

  const openTwitter = (action) => {
    let url = "https://twitter.com/0g_network"; // Replace with actual Twitter handle
    
    switch(action) {
      case "follow":
        window.open(`${url}?follow=true`, '_blank');
        break;
      case "like":
        // Replace with actual tweet URL
        window.open("https://twitter.com/0g_network/status/123456789", '_blank');
        break;
      case "retweet":
        // Replace with actual tweet URL
        window.open("https://twitter.com/intent/retweet?tweet_id=123456789", '_blank');
        break;
      default:
        window.open(url, '_blank');
    }
  };

  return (
    <div className="panel quest-panel">
      <h2>Quests</h2>
      <p className="subtitle">Complete quests to earn extra points!</p>
      
      <div className="quest-list">
        {quests.map(quest => (
          <div key={quest.id} className={`quest-item ${quest.completed ? 'completed' : ''}`}>
            <div className="quest-info">
              <h3>{quest.name}</h3>
              <p className="reward">+{quest.reward} points</p>
            </div>
            
            {quest.completed ? (
              <div className="completed-badge">Completed</div>
            ) : (
              <button 
                onClick={() => {
                  if (quest.action) openTwitter(quest.action);
                  completeQuest(quest.id);
                }}
                className="quest-button"
              >
                {quest.action === "connect" ? "Connect" : 
                 quest.action === "follow" ? "Follow" : 
                 quest.action === "like" ? "Like" : 
                 "Retweet"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
