import React, { useState } from 'react';
import './App.css';

// بيانات تجريبية
const videos = [
  { id: 1, title: 'فيديو 1', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', likes: 3, comments: ['مذهل!', 'رائع!'] },
  { id: 2, title: 'فيديو 2', url: 'https://www.youtube.com/embed/3JZ_D3ELwOQ', likes: 5, comments: ['ممتع!'] },
  { id: 3, title: 'فيديو 3', url: 'https://www.youtube.com/embed/kJQP7kiw5Fk', likes: 2, comments: [] },
];

function App() {
  const [goalOfTheWeek, setGoalOfTheWeek] = useState(videos[0]); // الهدف الأسبوعي

  // وظيفة الإعجاب
  const handleLike = (id) => {
    const updatedVideos = videos.map(video => {
      if (video.id === id) {
        video.likes += 1;
      }
      return video;
    });
    // تحديث الحالة المحلية
  };

  // وظيفة إضافة تعليق
  const handleAddComment = (id, comment) => {
    const updatedVideos = videos.map(video => {
      if (video.id === id) {
        video.comments.push(comment);
      }
      return video;
    });
    // تحديث الحالة المحلية
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>موقع كرة القدم</h1>
        <h2>هدف الأسبوع</h2>
        <div className="goal-of-the-week">
          <h3>{goalOfTheWeek.title}</h3>
          <iframe src={goalOfTheWeek.url} title="Goal of the Week" />
        </div>
        <h2>الفيديوهات المميزة</h2>
        <div className="videos">
          {videos.map((video) => (
            <div key={video.id} className="video-card">
              <h3>{video.title}</h3>
              <iframe src={video.url} title={video.title} />
              <div className="video-actions">
                <button onClick={() => handleLike(video.id)}>👍 {video.likes} Likes</button>
                <button onClick={() => handleAddComment(video.id, prompt('أدخل تعليقك:'))}>💬 إضافة تعليق</button>
                <button>🗑️ حذف الفيديو</button>
              </div>
              <div className="comments">
                {video.comments.length > 0 ? (
                  video.comments.map((comment, index) => <p key={index}>{comment}</p>)
                ) : (
                  <p>لا توجد تعليقات بعد.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
