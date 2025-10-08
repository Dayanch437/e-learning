import React, { useState, useEffect } from 'react';
import { Avatar, List } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import './ThinkingEffect.css';

interface ThinkingEffectProps {
  text?: string;
}

const ThinkingEffect: React.FC<ThinkingEffectProps> = ({ text = 'AI is thinking' }) => {
  const [dots, setDots] = useState('...');
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [thinking, setThinking] = useState(true);

  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '.';
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // After 2 seconds, start typing effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setThinking(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Typing effect
  useEffect(() => {
    if (thinking) return;

    if (textIndex < text.length) {
      const typingInterval = setInterval(() => {
        setDisplayText(prev => prev + text.charAt(textIndex));
        setTextIndex(prev => prev + 1);
      }, 50); // Speed of typing

      return () => clearInterval(typingInterval);
    }
  }, [textIndex, thinking, text]);

  return (
    <List.Item className="message assistant ai-typing">
      <List.Item.Meta
        avatar={
          <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
        }
        title="Teacher Emma"
        description={
          <div className="message-content">
            {thinking ? (
              <div className="thinking-dots">
                {text}
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              <div>
                <span className="typing-effect">{displayText}</span>
                {textIndex < text.length && <span className="cursor-blink"></span>}
              </div>
            )}
          </div>
        }
      />
    </List.Item>
  );
};

export default ThinkingEffect;