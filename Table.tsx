import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { IconButton } from '@mondra/ui-components'
import getOr from 'lodash/fp/getOr'
import map from 'lodash/fp/map'
import isEmpty from 'lodash/fp/isEmpty'
import isArray from 'lodash/fp/isArray'
import isFunction from 'lodash/fp/isFunction'
import isNumber from 'lodash/fp/isNumber'
import size from 'lodash/fp/size'
import classnames from 'classnames'
import { ITable, ITableCellParams, ISortModel, IColumnDef } from '../types/table'
import StickyBar from './StickyBar'
import Spinner from './Spinner'
import Pagination from './Pagination'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const mapWithIndex = map.convert({ cap: false })

const ASC = 'asc'
const DESC = 'desc'
const NONE = ''

const PaddArray = ['pl-4', 'pl-12', 'pl-20', 'pl-28', 'pl-36']

function getSortState(field: string, state: ISortModel): ISortModel {
    if (field !== state.field) {
        return { field, order: ASC }
    }
    switch (state.order) {
        case NONE:
            return { field, order: ASC }
        case ASC:
            return { field, order: DESC }
        default:
            return { field: NONE, order: NONE }
    }
}

const Table = ({
    className,
    columnDef,
    context = {},
    currentPage = 1,
    data,
    childNode = '',
    enableSort = false,
    isLoading = false,
    layout = 'fixed',
    onPageChange,
    onSortChange,
    pagination = true,
    pageSize = 1,
    primaryKey,
    sortModel = { field: '', order: '' },
    totalRecords = 1,
}: ITable) => {
    const [tableData, setTableData] = useState<Array<any>>([])
    const [sort, setSort] = useState(sortModel)

    useEffect(() => {
        setTableData(data)
    }, [data])

    const onSort = useCallback(
        (field: string) => () => {
            const state = getSortState(field, sort)
            setSort(state)
            onSortChange && onSortChange(state)
        },
        [onSortChange, sort]
    )

    const handleExpand = useCallback((event: any) => {
        const { expanded, rowindex } = event.currentTarget.dataset

        setTableData(
            mapWithIndex((rows: any, i: number) => ({
                ...rows,
                expanded: Number(rowindex) === i ? expanded !== 'true' : rows.expanded,
            }))
        )
    }, [])

    const isMultiLevelEnabled = !isEmpty(childNode)

    const renderRow = useCallback(
        (level = 0, totalRecords = 0) => (dataRow: any, i: number) => {
            const isChildNodeAvailable
                = isMultiLevelEnabled && isArray(dataRow[childNode]) && size(dataRow[childNode]) > 0
            const key = `${level}-${i}`
            return (
                <Fragment>
                    <tr
                        key={primaryKey ? dataRow[primaryKey] || key : key}
                        data-index={i}
                        data-level={level}
                        className={classnames(
                            'border-gray-200',
                            level > 0 ? 'bg-gray-50 border-0' : 'border-b border-t'
                        )}
                    >
                        {isMultiLevelEnabled
                            && (isChildNodeAvailable ? (
                                <td
                                    className="flex items-center justify-end h-16"
                                    key={`row-header-${key}`}
                                >
                                    <IconButton
                                        onClick={handleExpand}
                                        bgColor="bg-gray-100 active:bg-secondary-700 hover:bg-gray-300"
                                        iconType="font-awesome"
                                        iconClass={classnames(
                                            'w-3',
                                            'fal',
                                            dataRow.expanded && 'fa-chevron-up',
                                            !dataRow.expanded && 'fa-chevron-down'
                                        )}
                                        data-rowindex={i}
                                        data-rowlevel={level}
                                        data-expanded={dataRow.expanded || false}
                                    />
                                </td>
                            ) : (
                                <td className="relative">
                                    {level > 0 && (
                                        <Fragment>
                                            <div
                                                className={`absolute w-px ${
                                                    totalRecords === i + 1 ? 'h-1/2' : 'h-full'
                                                } bg-gray-400 top-0 right-4`}
                                            />
                                            <div className="absolute w-14 h-px -mt-px bg-gray-400 top-1/2 left-8" />
                                        </Fragment>
                                    )}
                                </td>
                            ))}
                        {mapWithIndex((col: IColumnDef, colIndex: number) => {
                            const params: ITableCellParams = {
                                childNodes: dataRow[childNode] || [],
                                colDef: col,
                                colName: col.field,
                                level,
                                node: { ...dataRow },
                                value: getOr('', col.field, dataRow),
                                ...context,
                            }
                            const value = isFunction(col.valueFormatter)
                                ? col.valueFormatter(params)
                                : getOr('', col.field, dataRow)

                            params.formattedValue = value

                            const padLeft = level > 0 && colIndex === 0 ? PaddArray[level] : 'pl-4'

                            return (
                                <td
                                    key={`${key}-${col.id || col.field}`}
                                    className={`h-16 px-4 text-sm text-gray-900 font-medium ${padLeft}`}
                                >
                                    <div
                                        title={isFunction(col.tooltip) ? col.tooltip(params) : ''}
                                        className={classnames(
                                            'text-left overflow-ellipsis overflow-hidden',
                                            col.align,
                                            isFunction(col.cellClass)
                                                ? col.cellClass(params)
                                                : col.cellClass
                                        )}
                                    >
                                        {col.component
                                            ? React.createElement(col.component, params)
                                            : value}
                                    </div>
                                </td>
                            )
                        }, columnDef)}
                    </tr>
                    {isChildNodeAvailable
                        && dataRow.expanded
                        && mapWithIndex(
                            renderRow(level + 1, dataRow[childNode].length),
                            dataRow[childNode]
                        )}
                </Fragment>
            )
        },
        []
    )

    return (
        <>
            <div
                className={`shadow rounded-t-lg overflow-y-auto min-w-full ${
                    isLoading ? 'cursor-wait' : ''
                }`}
            >
                <table
                    className={`table-${layout} lg:w-full md:w-max sm:w-max max-w-full whitespace-nowrap text-black bg-white ${className}`}
                >
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase text-xs leading-normal border-gray-200 border-b rounded-t-lg">
                            {isMultiLevelEnabled && <th key="header-expand" className="w-12" />}
                            {mapWithIndex((col: IColumnDef, i: number) => {
                                const isSortable
                                    = col.enableSort === undefined ? enableSort : col.enableSort

                                return (
                                    <th
                                        key={col.id || col.field}
                                        className={classnames('font-medium px-4 h-12', {
                                            'rounded-tl-lg': i === 0,
                                            'rounded-tr-lg': i === columnDef.length - 1,
                                        })}
                                        style={{
                                            width: isNumber(col.width) ? `${col.width}px` : '',
                                        }}
                                    >
                                        <div
                                            className={classnames(
                                                'text-left overflow-ellipsis overflow-hidden',
                                                col.align,
                                                col.headerClass,
                                                {
                                                    'cursor-pointer': isSortable,
                                                }
                                            )}
                                            role="button"
                                            onClick={isSortable ? onSort(col.field) : undefined}
                                        >
                                            {col.headerComponent
                                                ? React.createElement(col.headerComponent, {
                                                    ...context,
                                                    colDef: col,
                                                })
                                                : col.headerName}
                                            {isSortable && (
                                                <i
                                                    className={classnames(
                                                        'ml-2 transition-all leading-normal text-sm duration-75 ease-in-out fad fa-sort',
                                                        {
                                                            'fa-sort-down':
                                                                sort.field === col.field
                                                                && sort.order === DESC,
                                                            'fa-sort-up':
                                                                sort.field === col.field
                                                                && sort.order === ASC,
                                                        }
                                                    )}
                                                />
                                            )}
                                        </div>
                                    </th>
                                )
                            }, columnDef)}
                        </tr>
                    </thead>
                    <tbody>{mapWithIndex(renderRow(0, tableData.length), tableData)}</tbody>
                </table>
            </div>
            {tableData.length <= 0 && (
                <div className="text-center py-4 bg-white shadow rounded-b-lg text-sm text-gray-900 font-medium">
                    {isLoading ? 'Loading...' : 'No record found'}
                </div>
            )}
            {pagination && tableData.length > 0 && (
                <StickyBar>
                    <div className="bg-white shadow rounded-b-lg">
                        <Pagination
                            onChange={onPageChange}
                            page={currentPage}
                            pageSize={pageSize}
                            totalRecords={totalRecords}
                        />
                        {isLoading && (
                            <div className="absolute top-3 right-28 text-sm text-gray-900 font-medium flex items-center">
                                <Spinner loading={true} size={'text-2xl mr-2'} /> Loading...
                            </div>
                        )}
                    </div>
                </StickyBar>
            )}
        </>
    )
}

export default Table
