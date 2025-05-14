import React from 'react';
import './HomePage.css';

const videos = [
  {
    id: 1,
    user: 'PlayerOne',
    title: 'هدف عالمي 🔥',
    videoUrl: '/videos/goal1.mp4',
    likes: 24,
    comments: 3
  },
  {
    id: 2,
    user: 'PlayerTwo',
    title: 'مراوغة خرافية 😱',
    videoUrl: '/videos/skill1.mp4',
    likes: 15,
    comments: 2
  }
];

const goalOfWeek = {
  user: 'Admin',
  title: 'هدف الأسبوع 💥',
  videoUrl: '/videos/goalOfWeek.mp4'
};

const HomePage = () => {
  return (
    <div className="home-container">
      <h2 className="section-title">🎯 هدف الأسبوع</h2>
      <div className="video-card goal-week">
        <video controls src={goalOfWeek.videoUrl} />
        <div className="video-info">
          <h3>{goalOfWeek.title}</h3>
          <p>بواسطة: {goalOfWeek.user}</p>
        </div>
      </div>

      <h2 className="section-title">📹 مقاطع اللاعبين</h2>
      <div className="video-grid">
        {videos.map(video => (
          <div className="video-card" key={video.id}>
            <video controls src={video.videoUrl} />
            <div className="video-info">
              <h4>{video.title}</h4>
              <p>بواسطة: {video.user}</p>
              <div className="reactions">
                ❤️ {video.likes} &nbsp; 💬 {video.comments}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
