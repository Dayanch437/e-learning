import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Table, Card, Row, Col, Statistic, Input, Select, Tag, Button, Space, Tabs, Radio } from 'antd';
import { BookOutlined, SoundOutlined, GlobalOutlined, TranslationOutlined, SearchOutlined } from '@ant-design/icons';
import { vocabularyAPI } from '../../services/api';
import { VocabularyWord } from '../../types';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const SimpleVocabularyList: React.FC = () => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [advancedSearchText, setAdvancedSearchText] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [partOfSpeechFilter, setPartOfSpeechFilter] = useState<string>('');
  const [startsWithFilter, setStartsWithFilter] = useState('');
  const [searchMode, setSearchMode] = useState<'basic'|'advanced'>('basic');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [debouncedAdvancedSearchText, setDebouncedAdvancedSearchText] = useState('');
  const [debouncedStartsWithFilter, setDebouncedStartsWithFilter] = useState('');
  
  // Debounce timer reference
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounce delay in milliseconds
  const DEBOUNCE_DELAY = 500;
  
  // Debounce function for search inputs
  const debounceSearch = useCallback((func: () => void) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      func();
    }, DEBOUNCE_DELAY);
  }, []);
  
  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      
      if (searchMode === 'basic') {
        const params: any = {};
        if (debouncedSearchText) params.search = debouncedSearchText;
        if (levelFilter) params.level = levelFilter;
        if (categoryFilter) params.category = categoryFilter;
        
        response = await vocabularyAPI.getAll(params);
      } else {
        // Use advanced search
        response = await vocabularyAPI.searchAdvanced(
          debouncedAdvancedSearchText,
          partOfSpeechFilter,
          debouncedStartsWithFilter
        );
        
        // Store the search query for display
        setSearchQuery(debouncedAdvancedSearchText);
      }
      
      const data = response.data;
      
      if ('results' in data) {
        setWords(data.results);
        setTotal(data.count);
      } else {
        const words = Array.isArray(data) ? data : [];
        setWords(words);
        setTotal(words.length);
      }
    } catch (error) {
      console.error('Failed to fetch words:', error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchMode, debouncedSearchText, debouncedAdvancedSearchText, debouncedStartsWithFilter, 
    levelFilter, categoryFilter, partOfSpeechFilter]);

  const fetchStats = async () => {
    try {
      const response = await vocabularyAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchWords();
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchWords]);
  
  // Effect for debouncing basic search
  useEffect(() => {
    if (searchText !== debouncedSearchText) {
      debounceSearch(() => {
        setDebouncedSearchText(searchText);
        if (searchMode === 'basic') {
          fetchWords();
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, debounceSearch, searchMode]);
  
  // Effect for debouncing advanced search
  useEffect(() => {
    if (advancedSearchText !== debouncedAdvancedSearchText) {
      debounceSearch(() => {
        setDebouncedAdvancedSearchText(advancedSearchText);
        if (searchMode === 'advanced') {
          fetchWords();
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedSearchText, debounceSearch, searchMode]);
  
  // Effect for debouncing "starts with" filter
  useEffect(() => {
    if (startsWithFilter !== debouncedStartsWithFilter) {
      debounceSearch(() => {
        setDebouncedStartsWithFilter(startsWithFilter);
        if (searchMode === 'advanced') {
          fetchWords();
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startsWithFilter, debounceSearch, searchMode]);

  const handleSearch = (value: string) => {
    // Only update the search text - the debounce effect will handle API call
    setSearchText(value);
  };

  const handleAdvancedSearch = (value: string) => {
    // Only update the search text - the debounce effect will handle API call
    setAdvancedSearchText(value);
  };

  const handleFilterChange = () => {
    // This is for non-debounced filters like dropdown selections
    fetchWords();
  };
  
  const handleSearchModeChange = (mode: 'basic' | 'advanced') => {
    setSearchMode(mode);
    // Clear filters when switching modes
    if (mode === 'basic') {
      setAdvancedSearchText('');
      setStartsWithFilter('');
      setPartOfSpeechFilter('');
    } else {
      setSearchText('');
    }
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      speechSynthesis.speak(utterance);
    }
  };

  const columns = [
    {
      title: 'Words',
      key: 'words',
      render: (text: any, record: VocabularyWord) => (
        <div>
          <div style={{ marginBottom: 8 }}>
            <Space>
              <GlobalOutlined style={{ color: '#1890ff' }} />
              <span style={{ fontWeight: 500, fontSize: 16 }}>
                {record.turkmen_word}
              </span>
              <Button
                type="text"
                size="small"
                icon={<SoundOutlined />}
                onClick={() => speakWord(record.turkmen_word)}
              />
            </Space>
          </div>
          <div>
            <Space>
              <TranslationOutlined style={{ color: '#52c41a' }} />
              <span style={{ fontSize: 16 }}>
                {record.english_word}
              </span>
              <Button
                type="text"
                size="small"
                icon={<SoundOutlined />}
                onClick={() => speakWord(record.english_word)}
              />
            </Space>
          </div>
          {record.pronunciation && (
            <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
              /{record.pronunciation}/
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Level & Category',
      key: 'level_category',
      render: (text: any, record: VocabularyWord) => (
        <Space direction="vertical" size="small">
          <Tag color={record.level === 'beginner' ? 'green' : record.level === 'intermediate' ? 'orange' : 'red'}>
            {record.level}
          </Tag>
          {record.category && (
            <Tag color="blue">
              {record.category}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Created By',
      dataIndex: 'created_by_name',
      key: 'created_by_name',
    },
  ];

  return (
    <div>
      <h1>Vocabulary</h1>
      
      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Words"
              value={stats.total_words || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Categories"
              value={stats.total_categories || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Beginner"
              value={stats.by_level?.beginner || stats.by_category?.beginner || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Advanced"
              value={stats.by_level?.advanced || stats.by_category?.advanced || 0}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Radio.Group 
          value={searchMode} 
          onChange={(e) => handleSearchModeChange(e.target.value)}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="basic">Basic Search</Radio.Button>
          <Radio.Button value="advanced">Advanced Search</Radio.Button>
        </Radio.Group>
        
        {searchMode === 'basic' ? (
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Space wrap>
                <Search
                  placeholder="Search words... (auto-search)"
                  allowClear
                  onSearch={handleSearch}
                  style={{ width: 250 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Select
                  placeholder="Filter by level"
                  allowClear
                  style={{ width: 150 }}
                  value={levelFilter}
                  onChange={(value) => {
                    setLevelFilter(value || '');
                    handleFilterChange();
                  }}
                >
                  <Option value="beginner">Beginner</Option>
                  <Option value="elementary">Elementary</Option>
                  <Option value="pre_intermediate">Pre-Intermediate</Option>
                  <Option value="intermediate">Intermediate</Option>
                  <Option value="upper_intermediate">Upper-Intermediate</Option>
                  <Option value="advanced">Advanced</Option>
                </Select>
                <Select
                  placeholder="Filter by category"
                  allowClear
                  style={{ width: 150 }}
                  value={categoryFilter}
                  onChange={(value) => {
                    setCategoryFilter(value || '');
                    handleFilterChange();
                  }}
                >
                  <Option value="nouns">Nouns</Option>
                  <Option value="verbs">Verbs</Option>
                  <Option value="adjectives">Adjectives</Option>
                </Select>
              </Space>
            </Col>
          </Row>
        ) : (
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Search
                  placeholder="Advanced search (auto-search as you type)"
                  allowClear
                  enterButton={<><SearchOutlined /> Search</>}
                  size="large"
                  onSearch={handleAdvancedSearch}
                  value={advancedSearchText}
                  onChange={(e) => setAdvancedSearchText(e.target.value)}
                />
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Input 
                      placeholder="Starts with... (auto-search)" 
                      allowClear 
                      value={startsWithFilter}
                      onChange={(e) => {
                        setStartsWithFilter(e.target.value);
                      }}
                      addonBefore="Starts with"
                    />
                  </Col>
                  <Col span={12}>
                    <Select
                      placeholder="Part of speech"
                      allowClear
                      style={{ width: '100%' }}
                      value={partOfSpeechFilter}
                      onChange={(value) => {
                        setPartOfSpeechFilter(value || '');
                        handleFilterChange();
                      }}
                    >
                      <Option value="noun">Noun</Option>
                      <Option value="verb">Verb</Option>
                      <Option value="adjective">Adjective</Option>
                      <Option value="adverb">Adverb</Option>
                      <Option value="pronoun">Pronoun</Option>
                      <Option value="preposition">Preposition</Option>
                    </Select>
                  </Col>
                </Row>
              </Space>
            </Col>
          </Row>
        )}
      </Card>

      {/* Table */}
      <Card>
        {searchMode === 'advanced' && searchQuery && (
          <div style={{ marginBottom: 16 }}>
            <h3>
              Search results for: <Tag color="blue">{searchQuery}</Tag>
            </h3>
          </div>
        )}
        <Table
          columns={columns}
          dataSource={words}
          loading={loading}
          rowKey="id"
          pagination={{
            total,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} words`,
          }}
        />
      </Card>
    </div>
  );
};

export default SimpleVocabularyList;