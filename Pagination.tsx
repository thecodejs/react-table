import React, { useCallback } from 'react'
import { usePagination } from '@material-ui/lab/Pagination'


interface IPaginationProps {
    count?: number
    onChange: any
    page: number
    pageSize?: number
    totalRecords?: number
}

const defaultClass
    = 'inline-flex items-center text-sm font-medium border-t-2 py-4 px-4 focus:rounded focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500'

const getPaginationItems = (items: any[]) => {
    const list: any[] = []
    let next: React.ReactNode, previous: React.ReactNode

    items.forEach(({ page, type, selected, ...item }: any) => {
        if (type === 'previous') {
            previous = (
                <button
                    className={`${defaultClass} text-gray-500 border-transparent pl-1 hover:border-gray-300 disabled:opacity-50`}
                    {...item}
                >
                    <i className="far fa-long-arrow-left mr-2 text-gray-400" />
                    Previous
                </button>
            )
        } else if (type === 'next') {
            next = (
                <button
                    className={`${defaultClass} text-gray-500 border-transparent pr-1 hover:border-gray-300 disabled:opacity-50`}
                    {...item}
                >
                    Next
                    <i className="far fa-long-arrow-right ml-2 text-gray-400" />
                </button>
            )
        } else if (type === 'start-ellipsis' || type === 'end-ellipsis') {
            list.push(
                <span className={`${defaultClass} text-gray-500 border-transparent`}>...</span>
            )
        } else if (type === 'page') {
            list.push(
                <button
                    className={`${defaultClass} ${
                        selected
                            ? 'border-primary-500 text-primary-600 cursor-not-allowed'
                            : 'border-transparent text-gray-500 hover:text-primary-600 hover:border-gray-300'
                    }`}
                    {...{ ...item, disabled: selected }}
                >
                    {page}
                </button>
            )
        }
    })

    return { list, next, previous }
}

export const Pagination: React.FunctionComponent<IPaginationProps> = ({
    onChange,
    page = 1,
    pageSize = 1,
    totalRecords = 1,
}) => {
    const count = Math.ceil(totalRecords / pageSize)

    const onPageChange = useCallback((event: any, page: number) => {
        onChange(page)
    }, [])

    const { items } = usePagination({
        count,
        onChange: onPageChange,
        page,
    })

    const { list, next, previous } = getPaginationItems(items)

    return (
        <div className="px-4 -mt-px border-t border-gray-200">
            <nav className="-mt-px flex items-center justify-between sm:px-0">
                <div className="w-0 flex-1 flex">{previous}</div>
                <div className="hidden md:flex">{list}</div>
                <div className="w-0 flex-1 flex justify-end">{next}</div>
            </nav>
        </div>
    )
}

export default Pagination
