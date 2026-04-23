import React, { useState, useCallback, useRef } from 'react';
import { Modal, Input, Table, Button, Space, Typography, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAPIClient } from '@nocobase/client';

interface SearchResult {
  id: string | number;
  name: string;
  collectionName: string;
  displayName: string;
  urlTemplate: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ open, onClose }) => {
  const api = useAPIClient();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<any>(null);

  const handleSearch = useCallback(
    async (q: string) => {
      const query = q?.trim();
      if (!query || query.length < 2) return;
      setLoading(true);
      setSearched(true);
      try {
        const res = await api.request({
          url: 'globalSearch:search',
          method: 'GET',
          params: { q: query },
        });
        // NocoBase's dataWrapping middleware wraps ctx.body in { data: ... },
        // so the array lives at res.data.data. Guard with Array.isArray so that
        // a mis-shaped response never passes a non-array to the Table's dataSource.
        const payload = res?.data?.data;
        setResults(Array.isArray(payload) ? payload : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [api],
  );

  const handleClose = () => {
    setResults([]);
    setSearched(false);
    onClose();
  };

  const buildUrl = (record: SearchResult): string => {
    return record.urlTemplate
      .replace(/\{id\}/g, String(record.id))
      .replace(/\{collectionName\}/g, record.collectionName);
  };

  const columns: ColumnsType<SearchResult> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Typography.Text>{String(text ?? '')}</Typography.Text>,
    },
    {
      title: 'Collection',
      dataIndex: 'displayName',
      key: 'displayName',
      width: 180,
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 140,
      render: (_, record) => {
        const url = buildUrl(record);
        return (
          <Button
            type="primary"
            size="small"
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
            disabled={!url}
            onClick={() => window.open(url, '_blank')}
          >
            View Record
          </Button>
        );
      },
    },
  ];

  return (
    <Modal
      title="Global Search"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={800}
      destroyOnClose
      afterOpenChange={(visible) => {
        if (visible) {
          // Reset state each time the modal opens
          setResults([]);
          setSearched(false);
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Input.Search
          ref={inputRef}
          placeholder="Search across collections… (minimum 2 characters)"
          enterButton="Search"
          loading={loading}
          onSearch={handleSearch}
          allowClear
        />
        {searched && (
          <Table<SearchResult>
            dataSource={results}
            columns={columns}
            rowKey={(r) => `${r.collectionName}-${r.id}`}
            loading={loading}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            size="small"
            locale={{ emptyText: 'No results found' }}
          />
        )}
      </Space>
    </Modal>
  );
};
