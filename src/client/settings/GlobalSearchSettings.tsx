import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';

const { Title, Text } = Typography;

interface SearchConfig {
  id: number;
  collectionName: string;
  displayName: string;
  searchField: string;
  urlTemplate: string;
  enabled: boolean;
}

interface CollectionOption {
  name: string;
  title?: string;
}

const URL_TEMPLATE_HELP = (
  <span>
    URL opened when "View Record" is clicked. Use <code>{'{id}'}</code> as a placeholder for the record's primary key
    and <code>{'{collectionName}'}</code> for the collection name.
    <br />
    Example: <code>/admin/some-page-id?popupuid={'{id}'}</code>
  </span>
);

export const GlobalSearchSettings: React.FC = () => {
  const api = useAPIClient();
  const [configs, setConfigs] = useState<SearchConfig[]>([]);
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SearchConfig | null>(null);
  const [form] = Form.useForm();

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.resource('globalSearchConfigs').list({ paginate: false });
      const payload = res?.data?.data;
      setConfigs(Array.isArray(payload) ? payload : []);
    } catch {
      message.error('Failed to load search configurations');
    } finally {
      setLoading(false);
    }
  }, [api]);

  const loadCollections = useCallback(async () => {
    try {
      const res = await api.resource('collections').list({ paginate: false });
      const payload = res?.data?.data;
      const rows: CollectionOption[] = Array.isArray(payload) ? payload : [];
      // Exclude system / meta collections (those starting with underscores)
      setCollections(rows.filter((c) => c.name && !c.name.startsWith('_')));
    } catch {
      // Non-fatal — collection picker just won't be populated
    }
  }, [api]);

  useEffect(() => {
    loadConfigs();
    loadCollections();
  }, [loadConfigs, loadCollections]);

  // ── CRUD helpers ─────────────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ searchField: 'name', enabled: true });
    setModalOpen(true);
  };

  const openEditModal = (record: SearchConfig) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.resource('globalSearchConfigs').destroy({ filterByTk: id });
      message.success('Removed');
      loadConfigs();
    } catch {
      message.error('Failed to delete configuration');
    }
  };

  const handleToggleEnabled = async (record: SearchConfig, enabled: boolean) => {
    try {
      await api.resource('globalSearchConfigs').update({ filterByTk: record.id, values: { enabled } });
      setConfigs((prev) => prev.map((c) => (c.id === record.id ? { ...c, enabled } : c)));
    } catch {
      message.error('Failed to update');
    }
  };

  const handleModalOk = async () => {
    let values: Partial<SearchConfig>;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    try {
      if (editingRecord) {
        await api.resource('globalSearchConfigs').update({ filterByTk: editingRecord.id, values });
        message.success('Updated');
      } else {
        await api.resource('globalSearchConfigs').create({ values });
        message.success('Added');
      }
      setModalOpen(false);
      loadConfigs();
    } catch {
      message.error('Failed to save configuration');
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────

  const columns: ColumnsType<SearchConfig> = [
    {
      title: 'Collection',
      dataIndex: 'collectionName',
      key: 'collectionName',
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.displayName || name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {name}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Search Field',
      dataIndex: 'searchField',
      key: 'searchField',
      width: 140,
      render: (field) => <Tag>{field || 'name'}</Tag>,
    },
    {
      title: (
        <Space>
          URL Template
          <Tooltip title={URL_TEMPLATE_HELP}>
            <QuestionCircleOutlined style={{ color: '#999' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'urlTemplate',
      key: 'urlTemplate',
      ellipsis: true,
      render: (url) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {url || <em>not set</em>}
        </Text>
      ),
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 90,
      render: (enabled, record) => (
        <Switch checked={enabled} onChange={(val) => handleToggleEnabled(record, val)} size="small" />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          </Tooltip>
          <Popconfirm
            title="Remove this collection from search?"
            onConfirm={() => handleDelete(record.id)}
            okText="Remove"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  // Collection options for the Select — exclude names already configured
  const configuredNames = new Set(
    configs
      .filter((c) => !editingRecord || c.collectionName !== editingRecord.collectionName)
      .map((c) => c.collectionName),
  );
  const collectionOptions = collections
    .filter((c) => !configuredNames.has(c.name))
    .map((c) => ({ value: c.name, label: c.title ? `${c.title} (${c.name})` : c.name }));

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0 }}>
            Global Search — Collections
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            Add Collection
          </Button>
        </Space>

        <Text type="secondary">
          Configure which collections are included in the global search and how their "View Record" links are
          constructed.
        </Text>

        <Table<SearchConfig>
          dataSource={configs}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
          locale={{ emptyText: 'No collections configured. Click "Add Collection" to get started.' }}
        />
      </Space>

      <Modal
        title={editingRecord ? 'Edit Collection' : 'Add Collection to Search'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        okText={editingRecord ? 'Save' : 'Add'}
        destroyOnClose
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="collectionName"
            label="Collection"
            rules={[{ required: true, message: 'Please select a collection' }]}
          >
            {editingRecord ? (
              <Input disabled />
            ) : (
              <Select
                showSearch
                placeholder="Select a collection"
                options={collectionOptions}
                filterOption={(input, option) =>
                  String(option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            )}
          </Form.Item>

          <Form.Item name="displayName" label="Display Name">
            <Input placeholder="Human-readable label shown in search results (optional)" />
          </Form.Item>

          <Form.Item
            name="searchField"
            label="Search Field"
            rules={[{ required: true, message: 'Please enter a field name' }]}
            tooltip="The field on this collection that will be queried with a LIKE/contains search."
          >
            <Input placeholder="name" />
          </Form.Item>

          <Form.Item
            name="urlTemplate"
            label={
              <Space>
                URL Template
                <Tooltip title={URL_TEMPLATE_HELP}>
                  <QuestionCircleOutlined style={{ color: '#999' }} />
                </Tooltip>
              </Space>
            }
          >
            <Input placeholder="/admin/your-page-id?popupuid={id}" />
          </Form.Item>

          <Form.Item name="enabled" label="Enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
