import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, List, Spin } from 'antd';
import { useCachedFetch } from '../hooks';
import { grammarAPI, vocabularyAPI, videoAPI } from '../services/api';
import { StatsResponse, VocabularyWord } from '../types';
import DataPrefetcher from '../utils/DataPrefetcher';

const { Title } = Typography;

const DashboardStats: React.FC = () => {
  // Using our custom hooks for fetching data with caching
  const { data: grammarStatsResponse, loading: grammarLoading } = useCachedFetch(
    () => grammarAPI.getStats(),
    []
  );
  
  const { data: videoStatsResponse, loading: videoLoading } = useCachedFetch(
    () => videoAPI.getStats(),
    []
  );
  
  const { data: vocabularyStatsResponse, loading: vocabLoading } = useCachedFetch(
    () => vocabularyAPI.getStats(),
    []
  );
  
  // Extract data safely from response with type assertions
  const grammarStats = (grammarStatsResponse?.data || grammarStatsResponse) as StatsResponse;
  const videoStats = (videoStatsResponse?.data || videoStatsResponse) as StatsResponse;
  const vocabularyStats = (vocabularyStatsResponse?.data || vocabularyStatsResponse) as StatsResponse;
  
  const { data: randomWordsResponse, loading: wordsLoading } = useCachedFetch(
    () => vocabularyAPI.getRandom(5),
    []
  );
  
  // Extract random words safely with type assertions
  const randomWords = (randomWordsResponse?.data || randomWordsResponse) as VocabularyWord[];
  
  // Prefetch data for vocabulary practice when component mounts
  useEffect(() => {
    DataPrefetcher.prefetchVocabularyPractice();
  }, []);
  
  return (
    <div>
      <Title level={2}>Öwreniş statistikalary</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card loading={grammarLoading}>
            <Statistic 
              title="Grammatika" 
              value={grammarStats?.total || 0} 
              suffix="sapak" 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={videoLoading}>
            <Statistic 
              title="Wideo" 
              value={videoStats?.total || 0}
              suffix="sapak" 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={vocabLoading}>
            <Statistic 
              title="Sözlük" 
              value={vocabularyStats?.total || 0}
              suffix="söz" 
            />
          </Card>
        </Col>
      </Row>
      
      <Title level={3} style={{ marginTop: 24 }}>Täze sözler</Title>
      <Card>
        {wordsLoading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin />
          </div>
        ) : (
          <List
            dataSource={randomWords || []}
            renderItem={(word) => (
              <List.Item>
                <List.Item.Meta 
                  title={word.turkmen_word}
                  description={word.english_word}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default DashboardStats;