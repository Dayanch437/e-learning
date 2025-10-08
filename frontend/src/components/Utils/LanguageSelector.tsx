import React from 'react';
import { Select, Space, Button, Tooltip, Badge } from 'antd';
import { GlobalOutlined, TranslationOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';

const { Option } = Select;

interface LanguageSelectorProps {
  showIcon?: boolean;
  style?: React.CSSProperties;
  mode?: 'select' | 'button';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  showIcon = true,
  style,
  mode = 'select'
}) => {
  const { language, setLanguage, availableLanguages, t } = useLanguage();

  const handleChange = (value: string) => {
    setLanguage(value as 'en' | 'tk');
  };
  
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'tk' : 'en';
    setLanguage(newLanguage);
  };

  if (mode === 'button') {
    return (
      <div style={{ ...style }}>
        <Tooltip title={t('switchLanguage')}>
          <Badge count={language.toUpperCase()} offset={[-15, 0]}>
            <Button 
              type="primary" 
              shape="circle" 
              icon={<TranslationOutlined />} 
              onClick={toggleLanguage}
              style={{ 
                background: '#1890ff',
                boxShadow: '0 2px 8px rgba(24, 144, 255, 0.2)'
              }}
            />
          </Badge>
        </Tooltip>
      </div>
    );
  }

  return (
    <div style={{ ...style }}>
      <Space>
        {showIcon && <GlobalOutlined style={{ fontSize: '16px', color: '#1890ff' }} />}
        <Select 
          value={language} 
          onChange={handleChange}
          style={{ width: 120 }}
          bordered={true}
          dropdownStyle={{ minWidth: '120px' }}
        >
          {Object.entries(availableLanguages).map(([code, name]) => (
            <Option key={code} value={code}>{name}</Option>
          ))}
        </Select>
      </Space>
    </div>
  );
};

export default LanguageSelector;