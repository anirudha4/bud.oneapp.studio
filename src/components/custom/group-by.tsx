import React, { useMemo } from 'react'
import { useItemContext } from '../context/item-context';
import { ItemType } from '@/lib/types';
import Item from './item';
import { Separator } from '../ui/separator';
import moment from 'moment';

type Props = {}

const GroupBy = ({ }: Props) => {
    const { groupBy, items } = useItemContext();
    const groupItems = useMemo(() => {
        const grouped = items.reduce((acc, item) => {
            const rawKey = item[groupBy as keyof ItemType];
            console.log("typeOf rawKey", typeof rawKey);
            
            const key = typeof rawKey === 'string' ? rawKey : Array.isArray(rawKey) ? rawKey.join(',') : rawKey instanceof Date ? moment(rawKey).format('DD MM, YYYY') : String(rawKey);
            console.log("Key", key);
            
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {} as Record<string, ItemType[]>);

        return Object.entries(grouped).map(([key, items]) => ({
            key,
            items
        }));
    }, [groupBy, items])

    return (
        <div>
            {groupItems.map(group => (
                <React.Fragment key={group.key}>
                    <GroupByItem items={group.items} key={group.key} label={group.key} />
                    <Separator className='my-4' />
                </React.Fragment>
            ))}
        </div>
    )
}

export default GroupBy

export const GroupByItem = ({ label, items }: { label: string, items: ItemType[] }) => {
    return (
        <div className="mb-4">
            <h2 className="text-lg font-semibold mb-3">{label}</h2>
            <div className="columns-1 lg:columns-2 gap-4 space-y-4 transition-all">
                {items.map(item => (
                    <div key={item.id} className="break-inside-avoid mb-4">
                        <Item item={item} />
                    </div>
                ))}
            </div>
        </div>
    )
}