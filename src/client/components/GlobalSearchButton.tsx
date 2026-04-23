import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { GlobalSearchModal } from './GlobalSearchModal';

export const GlobalSearchButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Global Search">
        <Button type="text" icon={<SearchOutlined />} onClick={() => setOpen(true)} />
      </Tooltip>
      <GlobalSearchModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};
