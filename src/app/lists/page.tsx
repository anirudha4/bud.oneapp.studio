'use client'
import { useItemContext } from '@/components/context/item-context'
import React from 'react'

type Props = {}

const Lists = ({ }: Props) => {
    const { lists } = useItemContext();
    return (
        <div>
            {lists.map(list => (
                <div className="">{list.name}</div>
            ))}
        </div>
    )
}

export default Lists