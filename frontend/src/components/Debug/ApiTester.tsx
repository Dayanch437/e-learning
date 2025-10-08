import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Input, Space, Divider, message, Table } from 'antd';
import { grammarAPI } from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ApiTester: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [grammarData, setGrammarData] = useState<any[]>([]);

  useEffect(() => {
    testGrammarAPI();
  }, []);

  const testGrammarAPI = async () => {
    setLoading(true);
    try {
      const response = await grammarAPI.getAll({ page_size: 5 });
      const data = response.data;
      
      if ('results' in data) {
        setGrammarData(data.results);
        setTestResult('✅ Grammar API: Success! Fetched ' + data.results.length + ' lessons');
      } else {
        const lessons = Array.isArray(data) ? data : [];
        setGrammarData(lessons);
        setTestResult('✅ Grammar API: Success! Fetched ' + lessons.length + ' lessons');
      }
    } catch (error: any) {
      setTestResult('❌ Grammar API Error: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty_level',
      key: 'difficulty_level',
    },
    {
      title: 'Is Published',
      dataIndex: 'is_published',
      key: 'is_published',
      render: (value: boolean) => value ? '✅' : '❌',
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5' }}>
      <Card>
        <Title level={3}>🔧 API Testing Tool</Title>
        <Paragraph>Test the simplified read-only API endpoints</Paragraph>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card size="small" title="Grammar API Test">
            <Space>
              <Button 
                type="primary" 
                onClick={testGrammarAPI} 
                loading={loading}
              >
                Test Grammar API
              </Button>
            </Space>
            
            <Divider />
            
            <Paragraph strong>Test Results:</Paragraph>
            <TextArea 
              value={testResult} 
              readOnly 
              autoSize={{ minRows: 2, maxRows: 6 }}
              style={{ marginBottom: 16 }}
            />
            
            {grammarData.length > 0 && (
              <>
                <Paragraph strong>Sample Grammar Data:</Paragraph>
                <Table 
                  dataSource={grammarData} 
                  columns={columns} 
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              </>
            )}
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default ApiTester;