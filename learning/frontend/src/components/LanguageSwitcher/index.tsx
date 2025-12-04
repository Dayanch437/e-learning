import React from 'react';
import { Button, Dropdown, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const languages = {
    en: { name: 'English', flag: '🇬🇧' },
    tk: { name: 'Türkmen', flag: '🇹🇲' },
    ru: { name: 'Русский', flag: '🇷🇺' },
  };

  const items: MenuProps['items'] = Object.entries(languages).map(([code, { name, flag }]) => ({
    key: code,
    label: (
      <span>
        {flag} {name}
      </span>
    ),
    onClick: () => changeLanguage(code),
  }));

  const currentLanguage = languages[i18n.language as keyof typeof languages] || languages.en;

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <Button 
        type="text" 
        icon={<GlobalOutlined />}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Space>
          <span>{currentLanguage.flag}</span>
          <span style={{ display: window.innerWidth > 768 ? 'inline' : 'none' }}>
            {currentLanguage.name}
          </span>
        </Space>
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
