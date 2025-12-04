import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Button, Space, Divider, message, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { videoAPI } from '../../services/api';
import { VideoLesson } from '../../types';

const { Title, Paragraph, Text } = Typography;

const SimpleVideoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<VideoLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchVideo(parseInt(id));
    }
  }, [id]);

  const fetchVideo = async (videoId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await videoAPI.getById(videoId);
      setVideo(response.data);
    } catch (error: any) {
      console.error('Error fetching video:', error);
      setError('Failed to load video. Please try again.');
      message.error('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'green';
      case 'intermediate': return 'orange';
      case 'advanced': return 'red';
      default: return 'blue';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoEmbedUrl = (url: string) => {
    if (!url || url.trim() === '') {
      return '';
    }
    
    // Convert YouTube watch URLs to embed URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Convert YouTube short URLs
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Convert Vimeo URLs
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    // If it's already an embed URL or other format, return as is
    return url;
  };

  const isDirectVideoFile = (url: string) => {
    if (!url || url.trim() === '') {
      return false;
    }
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const renderVideoPlayer = () => {
    if (!video || !video.video_url) {
      return (
        <div style={{ 
          height: '300px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '2px dashed #d9d9d9'
        }}>
          <Space direction="vertical" size="large" style={{ textAlign: 'center' }}>
            <PlayCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
            <Text type="secondary">Video not available</Text>
          </Space>
        </div>
      );
    }

    const videoUrl = video.video_url.trim();
    
    // Check if it's a direct video file (mp4, webm, etc.)
    if (isDirectVideoFile(videoUrl)) {
      return (
        <div style={{ 
          position: 'relative', 
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#000'
        }}>
          <video 
            controls 
            style={{ 
              width: '100%', 
              height: 'auto',
              minHeight: '300px',
              maxHeight: '600px'
            }}
            poster={video.thumbnail || undefined}
            preload="metadata"
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
          
          {/* Show thumbnail as fallback if video fails to load */}
          {video.thumbnail && (
            <div style={{ display: 'none' }}>
              <img 
                src={video.thumbnail} 
                alt={video.title}
                style={{ width: '100%', height: 'auto' }}
                onError={(e) => {
                  console.log('Thumbnail failed to load:', video.thumbnail);
                }}
              />
            </div>
          )}
        </div>
      );
    }

    // For YouTube, Vimeo, and other embed videos
    const embedUrl = getVideoEmbedUrl(videoUrl);
    
    return (
      <div>
        {/* Show thumbnail preview for embedded videos */}
        {video.thumbnail && (
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <img 
              src={video.thumbnail}
              alt={`${video.title} thumbnail`}
              style={{ 
                maxWidth: '300px', 
                height: 'auto', 
                borderRadius: '8px',
                border: '1px solid #d9d9d9'
              }}
              onError={(e) => {
                console.log('Thumbnail failed to load:', video.thumbnail);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
          <iframe
            src={embedUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '8px'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title || 'Video Player'}
          />
        </div>
      </div>
    );
  };  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading video...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error"
          description={error || 'Video not found'}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => navigate('/videos')}>
              Back to Videos
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/videos')}
            style={{ padding: 0 }}
          >
            Back to Video Lessons
          </Button>
          
          <div>
            <Space wrap style={{ marginBottom: 16 }}>
              <Tag color={getDifficultyColor(video.level)} icon={<PlayCircleOutlined />}>
                {video.level?.charAt(0).toUpperCase() + video.level?.slice(1)}
              </Tag>
              <Tag color="blue" icon={<ClockCircleOutlined />}>
                {formatDate(video.created_at)}
              </Tag>
              {video.duration > 0 && (
                <Tag color="cyan">
                  Duration: {formatDuration(video.duration)}
                </Tag>
              )}
              <Tag color={video.status === 'published' ? 'green' : 'orange'}>
                {video.status.toUpperCase()}
              </Tag>
            </Space>
            
            <Title level={1} style={{ marginBottom: 16 }}>
              {video.title}
            </Title>
            
            {video.description && (
              <Paragraph style={{ fontSize: '16px', color: '#666' }}>
                {video.description}
              </Paragraph>
            )}
          </div>
        </Space>
      </Card>

      {/* Video Player */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 24 }}>
          Video Lesson
        </Title>
        
        
        
        {renderVideoPlayer()}
      </Card>

      {/* Additional Information */}
      {video.description && (
        <Card>
          <Title level={3} style={{ marginBottom: 24 }}>
            About This Video
          </Title>
          
          <div 
            style={{ 
              fontSize: '16px', 
              lineHeight: '1.8',
              color: '#333'
            }}
            dangerouslySetInnerHTML={{ 
              __html: video.description?.replace(/\n/g, '<br>') || 'No additional information available.' 
            }}
          />
          
          <Divider />
          
          <div style={{ textAlign: 'center' }}>
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/videos')}
            >
              Back to All Videos
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SimpleVideoDetail;