import React, { useState } from 'react';
import { message } from 'antd';
import { useAccess } from 'umi';
import Table from '@/components/Table'
import { roleList, removeRole, addRole } from '../service';

export default ({ id }) => {
  const access = useAccess();

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'disabled',
      valueEnum: {
        true: { text: '禁用', status: 'Default' },
        false: { text: '正常', status: 'Processing' },
      },
    },
    {
      title: '备注',
      dataIndex: 'description',
    },
  ];

  return <Table
  headerWrapper={false}
  columns={columns}
  search={false}
    toolBarRender={false}
    tableAlertRender={(record) => (
        <div>
        <p>
            未登录用户默认拥有 guest 角色，已登录用户默认拥有 guest , user 角色和动态等级对应角色
        </p>
        已选择{' '}
        <a
            style={{
            fontWeight: 600,
            }}
        >
            {record.selectedRowKeys.length}
        </a>{' '}
        项，勾选即绑定角色
        </div>
    )}
    request={ params => {
        return new Promise((resolve,reject) => {
            roleList({user_id:id,...params}).then(res => {
                const { result , data} = res
                if (!result || !data) reject();
                else {
                    const keys = [];
                    const objs = [];
                    data.forEach(({ checked, role }) => {
                    if (checked) keys.push(role.id);
                        objs.push(role);
                    });
                    setSelectedRowKeys(keys);
                    resolve({
                        ...res,
                        data: {
                            ...res.data,
                            data:objs
                        }
                    });
                }
            })
        })
    }
    }
    tableAlertOptionRender={false}
        scroll={{ y: 480 }}
        rowSelection={{
          columnWidth: 80,
          columnTitle: '选择',
          selectedRowKeys,
          onSelect: async (record, selected) => {
            const keys = selectedRowKeys.concat();
            if (selected === false && !access.adminUserRoleRemove) {
              message.error('无权限');
            } else if (selected === false && access.adminUserRoleRemove) {
              const { result, ...res } = await removeRole({
                role_id: record.id,
                user_id: id,
              });
              if (!result) {
                message.error(res.message);
              } else {
                const index = keys.findIndex((key) => key === record.id);
                if (index > -1) keys.splice(index, 1);
              }
            } else if (!access.adminUserRoleAdd) {
              message.error('无权限');
            } else {
              const { result, ...res } = await addRole({
                role_id: record.id,
                user_id: id,
              });
              if (!result) {
                message.error(res.message);
              } else {
                keys.push(record.id);
              }
            }
            setSelectedRowKeys(keys);
          },
        }}
  />
};
