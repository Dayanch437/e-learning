import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Alert, Spin, Row, Col, Statistic, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { grammarAPI, videoAPI, vocabularyAPI } from '../../services/api';

const { Title, Paragraph, Text } = Typography;

interface APITestResult {
  name: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  data?: any;
}

const APIConnectionTester: React.FC = () => {
  const [testResults, setTestResults] = useState<APITestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const runAPITests = async () => {
    setTesting(true);
    const results: APITestResult[] = [];

    // Test Grammar API
    try {
      const grammarResponse = await grammarAPI.getAll({ page_size: 5 });
      results.push({
        name: 'Grammar API',
        status: 'success',
        message: `✅ Successfully fetched ${grammarResponse.data.count} grammar lessons`,
        data: grammarResponse.data.results?.slice(0, 3)
      });
    } catch (error: any) {
      results.push({
        name: 'Grammar API',
        status: 'error',
        message: `❌ Error: ${error.message || 'Failed to fetch grammar data'}`
      });
    }

    // Test Grammar Stats
    try {
      const grammarStats = await grammarAPI.getStats();
      results.push({
        name: 'Grammar Stats API',
        status: 'success',
        message: `✅ Grammar stats loaded`,
        data: grammarStats.data
      });
    } catch (error: any) {
      results.push({
        name: 'Grammar Stats API',
        status: 'error',
        message: `❌ Error: ${error.message || 'Failed to fetch grammar stats'}`
      });
    }

    // Test Video API
    try {
      const videoResponse = await videoAPI.getAll({ page_size: 5 });
      results.push({
        name: 'Video API',
        status: 'success',
        message: `✅ Successfully fetched ${videoResponse.data.count} video lessons`,
        data: videoResponse.data.results?.slice(0, 3)
      });
    } catch (error: any) {
      results.push({
        name: 'Video API',
        status: 'error',
        message: `❌ Error: ${error.message || 'Failed to fetch video data'}`
      });
    }

    // Test Video Stats
    try {
      const videoStats = await videoAPI.getStats();
      results.push({
        name: 'Video Stats API',
        status: 'success',
        message: `✅ Video stats loaded`,
        data: videoStats.data
      });
    } catch (error: any) {
      results.push({
        name: 'Video Stats API',
        status: 'error',
        message: `❌ Error: ${error.message || 'Failed to fetch video stats'}`
      });
    }

    // Test Vocabulary API
    try {
      const vocabularyResponse = await vocabularyAPI.getAll({ page_size: 5 });
      results.push({
        name: 'Vocabulary API',
        status: 'success',
        message: `✅ Successfully fetched ${vocabularyResponse.data.count} vocabulary words`,
        data: vocabularyResponse.data.results?.slice(0, 3)
      });
    } catch (error: any) {
      results.push({
        name: 'Vocabulary API',
        status: 'error',
        message: `❌ Error: ${error.message || 'Failed to fetch vocabulary data'}`
      });
    }

    // Test Vocabulary Stats
    try {
      const vocabularyStats = await vocabularyAPI.getStats();
      results.push({
        name: 'Vocabulary Stats API',
        status: 'success',
        message: `✅ Vocabulary stats loaded`,
        data: vocabularyStats.data
      });
    } catch (error: any) {
      results.push({
        name: 'Vocabulary Stats API',
        status: 'error',
        message: `❌ Error: ${error.message || 'Failed to fetch vocabulary stats'}`
      });
    }

    // Test Random Vocabulary
    try {
      const randomWords = await vocabularyAPI.getRandom(3, 'beginner');
      results.push({
        name: 'Random Vocabulary API',
        status: 'success',
        message: `✅ Retrieved ${randomWords.data.length} random words`,
        data: randomWords.data
      });
    } catch (error: any) {
      results.push({
        name: 'Random Vocabulary API',
        status: 'error',
        message: `❌ Error: ${error.message || 'Failed to fetch random vocabulary'}`
      });
    }

    setTestResults(results);
    setTesting(false);
  };

  useEffect(() => {
    runAPITests();
  }, []);

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>API Connection Test Dashboard</Title>
      <Paragraph>
        This dashboard tests all API endpoints to ensure proper connectivity between frontend and backend.
      </Paragraph>

      {/* Summary Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Tests"
              value={testResults.length}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Successful"
              value={successCount}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Failed"
              value={errorCount}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={runAPITests}
          loading={testing}
        >
          Refresh Tests
        </Button>
      </Space>

      {testing && (
        <div style={{ textAlign: 'center', margin: '50px 0' }}>
          <Spin size="large" />
          <Paragraph style={{ marginTop: 16 }}>Testing API connections...</Paragraph>
        </div>
      )}

      {/* Test Results */}
      <Row gutter={[16, 16]}>
        {testResults.map((result, index) => (
          <Col span={24} key={index}>
            <Card
              title={
                <Space>
                  {result.status === 'success' ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  )}
                  {result.name}
                </Space>
              }
              extra={
                <Tag color={result.status === 'success' ? 'green' : 'red'}>
                  {result.status.toUpperCase()}
                </Tag>
              }
            >
              <Paragraph>{result.message}</Paragraph>
              
              {result.data && result.status === 'success' && (
                <Card size="small" title="Sample Data" style={{ marginTop: 16 }}>
                  {Array.isArray(result.data) ? (
                    <div>
                      {result.data.map((item: any, i: number) => (
                        <div key={i} style={{ marginBottom: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                          <Text strong>
                            {item.title || item.turkmen_word || `Item ${i + 1}`}
                          </Text>
                          {item.english_word && (
                            <Text style={{ marginLeft: 8 }}>- {item.english_word}</Text>
                          )}
                          {item.category && (
                            <Tag style={{ marginLeft: 8 }}>{item.category}</Tag>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </Card>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {testResults.length > 0 && (
        <Alert
          style={{ marginTop: 24 }}
          message={
            errorCount === 0 
              ? "🎉 All API connections are working properly!" 
              : `⚠️ ${errorCount} API endpoint(s) have issues. Check the details above.`
          }
          type={errorCount === 0 ? "success" : "warning"}
          showIcon
        />
      )}
    </div>
  );
};

export default APIConnectionTester;