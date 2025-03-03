import { h, HTMLAttributes, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { NDataTable } from '../index'
import type { DataTableColumns } from '../index'
import { NButton, NButtonGroup } from '../../button'

describe('n-data-table', () => {
  it('should work with import on demand', () => {
    mount(NDataTable)
  })
  it('show custom empty', () => {
    const columns = [
      {
        title: 'Name',
        key: 'name'
      }
    ]
    const wrapper = mount(() => (
      <NDataTable columns={columns} data={[]}>
        {{
          empty: () => <div class="empty-info">empty</div>
        }}
      </NDataTable>
    ))
    expect(wrapper.find('.empty-info').exists()).toEqual(true)
  })
  describe('props.columns', () => {
    it('has correct type', () => {
      interface Data {
        collegeID: number
        collegeName: string
      }
      const data: Data[] = [
        {
          collegeID: 1,
          collegeName: 'Peking University'
        }
      ]
      const createRowKey = (row: Data): number => row.collegeID
      const createRowClassName = (row: Data): string => 'star kirby'
      const createRowProps = (row: Data): HTMLAttributes => ({
        style: { color: 'red' }
      })
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      const createSummary = (pageData: Data[]) => {
        return {
          collegeID: {
            value: pageData.reduce(
              (prevValue, row) => prevValue + row.collegeID,
              0
            ),
            colSpan: 3
          }
        }
      }
      const columns: DataTableColumns<Data> = [
        {
          title: 'collegeID',
          key: 'collegeID',
          align: 'center',
          sorter: (row1, row2) => row1.collegeID - row2.collegeID
        },
        {
          title: 'collegeName',
          key: 'collegeName',
          align: 'center',
          defaultSortOrder: 'ascend'
        },
        {
          title: '操作',
          key: 'actions',
          render (row) {
            return (
              <NButtonGroup>
                {{
                  default: () => {
                    return (
                      [
                        {
                          text: '修改',
                          type: 'warning'
                        },
                        {
                          text: '删除',
                          type: 'error'
                        }
                      ] as const
                    ).map(({ type, text }) => (
                      <NButton type={type} round dashed>
                        {{ default: () => text }}
                      </NButton>
                    ))
                  }
                }}
              </NButtonGroup>
            )
          }
        }
      ]
      mount(() => (
        <NDataTable
          columns={columns}
          data={data}
          rowKey={createRowKey}
          rowClassName={createRowClassName}
          rowProps={createRowProps}
          summary={createSummary}
        />
      )).unmount()
    })
  })
  it('should work with `itemCount` without `remote`', () => {
    const columns = [
      {
        title: 'Name',
        key: 'name'
      }
    ]
    const data = new Array(978).fill(0).map((_, index) => {
      return {
        name: index
      }
    })
    const pagination = {
      page: 1,
      pageCount: 1,
      pageSize: 10,
      itemCount: 0,
      prefix ({ itemCount }: { itemCount: number | undefined }) {
        return itemCount
      }
    }
    const wrapper = mount(() => (
      <NDataTable columns={columns} data={data} pagination={pagination} />
    ))
    expect(wrapper.find('.n-pagination-prefix').text()).toEqual('978')
  })

  it('should work with `itemCount` with `remote`', async () => {
    const onPageChange = jest.fn((page: number): void => {
      setTimeout(() => {
        pagination.page = page
        pagination.itemCount = data.length
        data = data.slice(
          (page - 1) * pagination.pageSize,
          page * pagination.pageSize
        )
      }, 1000)
    })
    const columns = [
      {
        title: 'Name',
        key: 'name'
      }
    ]
    let data = new Array(978).fill(0).map((_, index) => {
      return {
        name: index
      }
    })
    const pagination = {
      page: 1,
      pageSize: 10,
      itemCount: 978,
      prefix ({ itemCount }: { itemCount: number | undefined }) {
        return itemCount
      }
    }
    const wrapper = mount(() => (
      <NDataTable
        columns={columns}
        data={data}
        pagination={pagination}
        remote
        onUpdatePage={onPageChange}
      />
    ))
    await void wrapper.findAll('.n-pagination-item')[2].trigger('click')
    await nextTick()
    expect(onPageChange).toHaveBeenCalled()
    expect(wrapper.find('.n-pagination-prefix').text()).toEqual('978')
  })

  it('should work with `bordered` prop', async () => {
    const columns = [
      {
        title: 'Name',
        key: 'name'
      }
    ]
    const data = new Array(978).fill(0).map((_, index) => {
      return {
        name: index
      }
    })
    let wrapper = mount(() => <NDataTable columns={columns} data={data} />)
    expect(wrapper.find('.n-data-table').classes()).toContain(
      'n-data-table--bordered'
    )

    wrapper = mount(() => (
      <NDataTable columns={columns} data={data} bordered={false} />
    ))
    expect(wrapper.find('.n-data-table').classes()).not.toContain(
      'n-data-table--bordered'
    )
  })

  it('should work with `bottom-bordered` prop', async () => {
    const columns = [
      {
        title: 'Name',
        key: 'name'
      }
    ]
    const data = new Array(978).fill(0).map((_, index) => {
      return {
        name: index
      }
    })
    let wrapper = mount(() => (
      <NDataTable columns={columns} data={data} bordered={false} />
    ))
    expect(wrapper.find('.n-data-table').classes()).toContain(
      'n-data-table--bottom-bordered'
    )

    wrapper = mount(() => (
      <NDataTable
        columns={columns}
        data={data}
        bordered={false}
        bottom-bordered={false}
      />
    ))
    expect(wrapper.find('.n-data-table').classes()).not.toContain(
      'n-data-table--bottom-bordered'
    )
  })

  it('should work with `loading` prop', async () => {
    const columns = [
      {
        title: 'Name',
        key: 'name'
      }
    ]
    const data = new Array(978).fill(0).map((_, index) => {
      return {
        name: index
      }
    })
    let wrapper = mount(() => <NDataTable columns={columns} data={data} />)
    expect(wrapper.find('.n-base-loading').exists()).not.toBe(true)

    wrapper = mount(() => (
      <NDataTable columns={columns} data={data} loading={true} />
    ))
    expect(wrapper.find('.n-base-loading').exists()).toBe(true)
  })

  it('should work with `flex-height` prop', async () => {
    const columns = [
      {
        title: 'Name',
        key: 'name'
      }
    ]
    const data = new Array(978).fill(0).map((_, index) => {
      return {
        name: index
      }
    })
    let wrapper = mount(() => <NDataTable columns={columns} data={data} />)
    expect(wrapper.find('.n-data-table').classes()).not.toContain(
      'n-data-table--flex-height'
    )

    wrapper = mount(() => (
      <NDataTable columns={columns} data={data} flexHeight={true} />
    ))
    expect(wrapper.find('.n-data-table').classes()).toContain(
      'n-data-table--flex-height'
    )
  })
})
